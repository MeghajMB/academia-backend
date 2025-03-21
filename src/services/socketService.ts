import { DefaultEventsMap, Server, Socket } from "socket.io";
import { redisPubSub } from "../config/redisPubSub";
import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { BidModel } from "../models/bidModel";
import { NotificationModel } from "../models/notificationModel";
import MediasoupManager from "../lib/mediaSoup";
//intialize the class

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

    io.on("connection", (socket) => {
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

      /* Dummy socket for webrtc start */
      /**
       * In the joinGig event,validates and sends an event with routercapabiities
       */
      socket.on("joinGig", async ({ gigId, accessToken }, callback) => {
        try {
          const mediasoupManager = this._mediasoupManager;
          /* Do the necesary validations before giving access to the below code in the future */
          const router = await mediasoupManager.getOrCreateRoomRouter(gigId);
          socket.join(gigId);
          socket.emit("routerCapabilities", {
            routerRtpCapabilities: router.rtpCapabilities,
          });
          console.log(`User ${socket.id} joined room: ${gigId}`);
        } catch (error) {
          console.error("Error joining room:", error);
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
                transportType
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
      /* Handle the produce event */
      socket.on(
        "transport-produce",
        async ({ gigId, transportId, kind, rtpParameters }, callback) => {
          const mediasoupManager = this._mediasoupManager;
          try {
            const producer = await mediasoupManager.createProducer({
              gigId,
              transportId,
              kind,
              rtpParameters,
            });
            socket.to(gigId).emit("newProducer", { producerId: producer.id });
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

      /* Dummy socket for webrtc end */

      socket.on("disconnect", async () => {
        const socketSubscriptionMap = this._socketSubscriptionMap;
        const mediasoupManager = this._mediasoupManager;
        console.log(`Client disconnected: ${socket.id}`);
        for (const [channel, sockets] of socketSubscriptionMap.entries()) {
          if (sockets.has(socket.id)) {
            await this.unsubscribeFromChannel(socket, channel);
          }
        }
        //delete the mediasoup data
        const gigIds = Object.keys(mediasoupManager.rooms);
        for (const gigId of gigIds) {
          if (socket.rooms.has(gigId)) {
            mediasoupManager.cleanupRoom(gigId, socket.id);
          }
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

  get io() {
    return this._io;
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
