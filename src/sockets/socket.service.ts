import { DefaultEventsMap, Server, Socket } from "socket.io";
import { redisPubSub } from "../lib/redisPubSub";
import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { BidModel } from "../models/bid.model";
import { NotificationModel } from "../models/notification.model";
import MediasoupManager from "../lib/mediaSoup";
//intialize the class

export interface CustomSocket extends Socket {
  userId?: string;
  userName?: string;
  profilePicture?: string;
  gigId?: string;
}

class SocketService {
  private _io: Server;
  private _socketSubscriptionMap: Map<string, Set<string>> = new Map();
  private _mediasoupManager: MediasoupManager;

  constructor(
    server: HttpServer<typeof IncomingMessage, typeof ServerResponse>
  ) {
    this._io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    this._mediasoupManager = new MediasoupManager();
    this.listenForConnections();
    this.listenForRedisMessages();
  }
  private async subscribeToChannel(socket: any, channel: string) {
    const socketSubscriptionMap = this._socketSubscriptionMap;
    if (!socketSubscriptionMap.has(channel)) {
      socketSubscriptionMap.set(channel, new Set());
      await redisPubSub.sub.subscribe(channel);
    }
    socketSubscriptionMap.get(channel)!.add(socket.id);
  }

  private async unsubscribeFromChannel(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    channel: string
  ) {
    const socketSubscriptionMap = this._socketSubscriptionMap;
    if (socketSubscriptionMap.has(channel)) {
      socketSubscriptionMap.get(channel)!.delete(socket.id);

      if (socketSubscriptionMap.get(channel)!.size === 0) {
        await redisPubSub.sub.unsubscribe(channel);
        socketSubscriptionMap.delete(channel);
      }
    }
  }

  private listenForConnections() {
    const io = this._io;

    io.on("connection", (socket: CustomSocket) => {
      console.log(`New client connected: ${socket.id}`);

      /* Bidding Events */
      socket.on("joinBiddingRoom", async (gigId) => {
        try {
          socket.join(gigId);
          const topBids = await BidModel.find({ gigId })
            .sort({ amount: -1 })
            .limit(10);
          socket.emit(`topBids${gigId}`, topBids);
          //subscribe if not subscribed
          await this.subscribeToChannel(socket, `bids:${gigId}`);
        } catch (error) {
          console.error(`Error in joinBiddingRoom: ${error}`);
          socket.emit("error", { message: "Failed to join bidding room" });
        }
      });

      socket.on("leaveBiddingRoom", async (gigId) => {
        socket.leave(gigId);
        await this.unsubscribeFromChannel(socket, `bids:${gigId}`);
      });

      /* Notification Events */
      socket.on("registerUser", async (userId) => {
        try {
          socket.join(userId);
          await this.subscribeToChannel(socket, `notifications:${userId}`);
          const notifications = await NotificationModel.find({
            userId,
            isRead: false,
          })
            .sort({ createdAt: 1 })
            .limit(3);
          const notificationCount = await NotificationModel.countDocuments({
            isRead: false,
          });
          socket.emit(`notifications`, {
            notifications,
            count: notificationCount,
          });
        } catch (error) {
          console.log(error);
        }
      });
      socket.on("unRegisterUser", async (userId) => {
        try {
          socket.leave(userId);
          await this.unsubscribeFromChannel(socket, `notifications:${userId}`);
        } catch (error) {
          console.log(error);
        }
      });

      /* Webrtc Events start */
      /**
       * In the joinGig event,validates and emits an event "routerCapabilities" with routercapabiities
       */
      socket.on("joinGig", async ({ gigId, accessToken }, callback) => {
        try {
          const mediasoupManager = this._mediasoupManager;
          /* Do the necesary validations and store the userid in socket */
          socket.userId = accessToken;
          socket.userName = "New Name";
          socket.gigId = gigId;
          socket.profilePicture = "user profile picture";
          console.log(
            socket.userId + "This is the user id i have saved in sockets"
          );
          /*  */
          const router = await mediasoupManager.getOrCreateRoomRouter(gigId);
          socket.join(gigId);
          socket.emit("routerCapabilities", {
            routerRtpCapabilities: router.rtpCapabilities,
          });
          callback({ status: "ok", message: "success" });
        } catch (error: any) {
          console.error("Error joining room:", error);
          callback({ status: "error", message: error.message });
          socket.emit("error", "You dont have access to this gig");
        }
      });
      /* Create transport for sender or consumer */
      socket.on(
        "createTransport",
        async (
          {
            gigId,
            transportType,
          }: { gigId: string; transportType: "sender" | "consumer" },
          callback
        ) => {
          const mediasoupManager = this._mediasoupManager;
          try {
            const transportParams =
              await mediasoupManager.createWebRtcTransport(
                gigId,
                transportType,
                socket.userId!
              );
            console.log(
              "Transport create for" + gigId + "type" + transportType
            );
            if (transportType == "sender") {
              socket.emit("sendTransportCreated", transportParams);
            } else {
              socket.emit("recvTransportCreated", transportParams);
            }
          } catch (error) {
            console.error("Error creating WebRTC Transport:", error);
            callback({ status: "error", message: error });
          }
        }
      );
      /* Connect the producer transport */
      socket.on(
        "connectProducerTransport",
        async ({ gigId, dtlsParameters, transportId }, callback) => {
          const mediasoupManager = this._mediasoupManager;
          try {
            await mediasoupManager.connectProducerTransport({
              gigId,
              transportId,
              dtlsParameters,
            });
            callback({ status: "ok" });
          } catch (error) {
            callback({
              status: "error",
              message:
                error instanceof Error ? error.message : "Something Happened",
            });
          }
        }
      );
      /**
       * 'transport-produce' event is used to create a new producer
       * It then emits an event newProducer to notify others that a new producer has been registered and is ready to be consumed
       */
      socket.on(
        "transport-produce",
        async (
          { gigId, transportId, kind, rtpParameters, appData },
          callback
        ) => {
          const mediasoupManager = this._mediasoupManager;
          try {
            /* Take the userdetails here */
            const userDetails = {
              userId: socket.userId!,
              userName: socket.userName!,
            };
            /*  */
            const producer = await mediasoupManager.createProducer({
              gigId,
              transportId,
              kind,
              rtpParameters,
              userDetails,
              appData,
            });
            socket.to(gigId).emit("newProducer", {
              producerId: producer.id,
              userId: userDetails.userId,
              userName: userDetails.userName,
              kind,
            });
            callback({ status: "ok", id: producer.id });
          } catch (error) {
            callback({ status: "error", message: error });
          }
        }
      );
      /* Connect consumer transport */
      socket.on(
        "connectConsumerTransport",
        async ({ gigId, dtlsParameters, transportId }, callback) => {
          const mediasoupManager = this._mediasoupManager;
          try {
            await mediasoupManager.connectConsumer({
              gigId,
              dtlsParameters,
              transportId,
            });
            callback({ status: "ok" });
          } catch (error) {
            callback({
              status: "error",
              message:
                error instanceof Error ? error.message : "Something Happened",
            });
          }
        }
      );
      /* Start consuming media */
      socket.on(
        "consumeMedia",
        async (
          { gigId, consumerTransportId, producerId, rtpCapabilities },
          callback
        ) => {
          const mediasoupManager = this._mediasoupManager;
          try {
            const consumerInfo = await mediasoupManager.createConsumer({
              gigId,
              consumerTransportId,
              producerId,
              rtpCapabilities,
            });
            console.log("This is the consume meida data");
            //console.log(consumerInfo);
            callback({ status: "ok", consumerData: consumerInfo });
          } catch (error) {
            console.error("Error creating consumer:", error);
            callback({ status: "error", message: error });
          }
        }
      );
      /* This function resumes media reception if it was previously paused. */
      socket.on("resumePausedConsumer", async ({ gigId, consumerId }) => {
        const mediasoupManager = this._mediasoupManager;
        console.log("consume-resume");
        await mediasoupManager.resumeConsumer({ gigId, consumerId });
      });

      /* This event fetches all the producers */
      socket.on("getProducers", ({ gigId }, callback) => {
        const room = this._mediasoupManager.rooms[gigId];
        const producerDetails = Object.keys(room.producers).map(
          (producerId) => ({
            producerId,
            userId: room.producerMetadata[producerId].userId,
            userName: room.producerMetadata[producerId].userName,
            kind: room.producerMetadata[producerId].kind,
          })
        );

        callback({ producerIds: producerDetails });
      });

      /* This event is for pausing or resuming producers */
      socket.on(
        "producerStateChanged",
        async ({ gigId, producerId, paused }, callback) => {
          try {
            const metadata = await this._mediasoupManager.pauseOrResumeproducer(
              { gigId, producerId, isPaused: paused }
            );

            socket.to(gigId).emit("producerStateChanged", {
              producerId,
              paused,
              userId: metadata?.userId || "unknown",
              userName: metadata?.userName || "Unknown User",
              kind: metadata?.kind,
            });
          } catch (error: any) {
            console.error(
              `Error in producerStateChanged: producerId=${producerId}, gigId=${gigId}`,
              error
            );
          }
        }
      );
      /* This event is for disconnecting the media */
      socket.on("leaveGig", async () => {
        const gigId = socket.gigId;
        const userId = socket.userId;
        if (!gigId || !userId) return;
        const deletedProducers = await this._mediasoupManager.disconnectUser(
          gigId,
          userId
        );
        for (let i = 0; i < deletedProducers.length; i++) {
          socket
            .to(gigId)
            .emit("producerClosed", { producerId: deletedProducers[i] });
        }
      });
      /* Webrtc Events end */

      socket.on("disconnect", async () => {
        const socketSubscriptionMap = this._socketSubscriptionMap;
        console.log(`Client disconnected: ${socket.id}`);
        for (const [channel, sockets] of socketSubscriptionMap.entries()) {
          if (sockets.has(socket.id)) {
            await this.unsubscribeFromChannel(socket, channel);
          }
        }
        //This is to handle the disconnect the videocall if the data is there
        const gigId = socket.gigId;
        const userId = socket.userId;
        if (gigId && userId) {
          const deletedProducerIds =
            await this._mediasoupManager.disconnectUser(gigId, userId);
          deletedProducerIds.forEach((producerId) => {
            socket.to(gigId).emit("producerClosed", { producerId });
          });
        }
      });
    });
  }

  private listenForRedisMessages() {
    const io = this._io;
    redisPubSub.sub.on("message", async (channel, message) => {
      try {
        const data = JSON.parse(message);

        if (channel.startsWith("bids:")) {
          const gigId = channel.split(":")[1];
          const topBids = await BidModel.find({ gigId })
            .sort({ amount: -1 })
            .limit(10)
            .populate("userId");
          io.to(gigId).emit(`topBids${gigId}`, topBids);
        } else if (channel.startsWith("notifications:")) {
          const userId = channel.split(":")[1];
          console.log(data);
          io.to(userId).emit("notifications", data);
        }
      } catch (error) {
        console.error(`Error processing Redis message: ${error}`);
      }
    });
  }

  public async shutdown(): Promise<void> {
    const socketSubscriptionMap = this._socketSubscriptionMap;
    const io = this._io;
    try {
      console.log("Shutting down SocketService...");

      // Unsubscribe from all active Redis channels
      for (const channel of socketSubscriptionMap.keys()) {
        await redisPubSub.sub.unsubscribe(channel);
        console.log(`Unsubscribed from Redis channel: ${channel}`);
      }

      // Clear the map
      socketSubscriptionMap.clear();

      // Close all socket connections
      io.disconnectSockets(true);

      // Close the Socket.IO server
      await new Promise<void>((resolve) => {
        io.close(() => {
          console.log("All socket connections closed");
          resolve();
        });
      });

      console.log("SocketService shutdown complete");
    } catch (error) {
      console.error(`Error during SocketService shutdown: ${error}`);
    }
  }
}

export default SocketService;
