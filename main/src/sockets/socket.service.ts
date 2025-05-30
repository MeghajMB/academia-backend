import { DefaultEventsMap, Server, Socket } from "socket.io";
import { redisPubSub } from "../lib/redisPubSub";
import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { BidModel } from "../models/bid.model";
import { NotificationModel } from "../models/notification.model";
import { mediasoupManager } from "../lib/mediaSoup";
import jwt from "jsonwebtoken";
import { CustomJwtPayload } from "../types/jwt";
import { UserRepository } from "../repositories/user/user.repository";
import { SessionRepository } from "../repositories/session/session.repository";
import config from "../config/configuration";

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

export interface CustomSocket extends Socket {
  userId?: string;
  userName?: string;
  profilePicture?: string;
  sessionId?: string;
}

class SocketService {
  private _io: Server;
  private _socketSubscriptionMap = new Map<string, Set<string>>();
  private _mediasoupManager: typeof mediasoupManager;

  constructor(
    server: HttpServer<typeof IncomingMessage, typeof ServerResponse>
  ) {
    this._io = new Server(server, {
      cors: {
        origin: config.app.clientUrl,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    this._mediasoupManager = mediasoupManager;
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
      socket.on("registerUser", async (userId, callback) => {
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
            userId,
            isRead: false,
          });
          callback({
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
      socket.on("joinSession", async ({ sessionId, accessToken }, callback) => {
        try {
          const mediasoupManager = this._mediasoupManager;

          if (socket.sessionId == sessionId) return;

          const decoded = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_TOKEN_SECRET!
          ) as CustomJwtPayload;
          const user = await userRepository.findById(decoded.id);
          if (!user) {
            throw new Error("Invalid User");
          }
          if (user?.isBlocked) {
            throw new Error("You are blocked");
          }
          const session = await sessionRepository.findById(sessionId);
          if (!session) {
            throw new Error("No Session Found");
          }

          if (session.instructorId.toString() != user._id.toString()) {
            if (
              !session.participants.find(
                (value) => value.userId.toString() == user._id.toString()
              )
            )
              throw new Error("You dont have access to this Session");
          }
          const sessionEndTime =
            session.sessionDate.getTime() + session.sessionDuration * 60 * 1000;
          if (
            session.status !== "in-progress" // || sessionEndTime < Date.now()
          ) {
            throw new Error("Session is over");
          }

          socket.userId = decoded.id;
          socket.userName = user?.name;
          socket.sessionId = sessionId;
          socket.profilePicture = user.profilePicture;
          /* Validation End */
          const router = await mediasoupManager.getOrCreateRoomRouter(
            sessionId
          );
          socket.join(sessionId);
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
            sessionId,
            transportType,
          }: { sessionId: string; transportType: "sender" | "consumer" },
          callback
        ) => {
          const mediasoupManager = this._mediasoupManager;
          try {
            const transportParams =
              await mediasoupManager.createWebRtcTransport(
                sessionId,
                transportType,
                socket.userId!
              );
            console.log(
              "Transport create for" + sessionId + "type" + transportType
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
        async ({ sessionId, dtlsParameters, transportId }, callback) => {
          const mediasoupManager = this._mediasoupManager;
          try {
            await mediasoupManager.connectProducerTransport({
              sessionId,
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
          { sessionId, transportId, kind, rtpParameters, appData },
          callback
        ) => {
          const mediasoupManager = this._mediasoupManager;
          try {
            /* Take the userdetails here */
            const userDetails = {
              userId: socket.userId!,
              userName: socket.userName!,
              profilePicture: socket.profilePicture!,
            };
            /*  */
            const producer = await mediasoupManager.createProducer({
              sessionId,
              transportId,
              kind,
              rtpParameters,
              userDetails,
              appData,
            });
            socket.to(sessionId).emit("newProducer", {
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
        async ({ sessionId, dtlsParameters, transportId }, callback) => {
          const mediasoupManager = this._mediasoupManager;
          try {
            await mediasoupManager.connectConsumer({
              sessionId,
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
          { sessionId, consumerTransportId, producerId, rtpCapabilities },
          callback
        ) => {
          const mediasoupManager = this._mediasoupManager;
          try {
            const consumerInfo = await mediasoupManager.createConsumer({
              sessionId,
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
      socket.on("resumePausedConsumer", async ({ sessionId, consumerId }) => {
        const mediasoupManager = this._mediasoupManager;
        console.log("consume-resume");
        await mediasoupManager.resumeConsumer({ sessionId, consumerId });
      });

      /* This event fetches all the producers */
      socket.on("getProducers", ({ sessionId }, callback) => {
        const room = this._mediasoupManager.rooms[sessionId];
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
        async ({ sessionId, producerId, paused }, callback) => {
          try {
            const metadata = await this._mediasoupManager.pauseOrResumeproducer(
              { sessionId, producerId, isPaused: paused }
            );

            socket.to(sessionId).emit("producerStateChanged", {
              producerId,
              paused,
              userId: metadata?.userId || "unknown",
              userName: metadata?.userName || "Unknown User",
              kind: metadata?.kind,
            });
          } catch (error: any) {
            console.error(
              `Error in producerStateChanged: producerId=${producerId}, gigId=${sessionId}`,
              error
            );
          }
        }
      );
      /* This event is for disconnecting the media */
      socket.on("leaveGig", async () => {
        const sessionId = socket.sessionId;
        const userId = socket.userId;
        if (!sessionId || !userId) return;
        console.log("disconnect triggered leavegig event is triggered");
        const deletedProducers = await this._mediasoupManager.disconnectUser(
          sessionId,
          userId
        );
        for (let i = 0; i < deletedProducers.length; i++) {
          socket
            .to(sessionId)
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
        const sessionId = socket.sessionId;
        const userId = socket.userId;
        if (sessionId && userId) {
          console.log("websocket disconnected so closing producers");
          const deletedProducerIds =
            await this._mediasoupManager.disconnectUser(sessionId, userId);
          deletedProducerIds.forEach((producerId) => {
            socket.to(sessionId).emit("producerClosed", { producerId });
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
