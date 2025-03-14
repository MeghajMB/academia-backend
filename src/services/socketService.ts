import { Server } from "socket.io";
import { redisPubSub } from "../config/redisPubSub";
import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { BidModel } from "../models/bidModel";
import { NotificationModel } from "../models/notificationModel";

class SocketService {
  private _io: Server;
  private socketSubscriptionMap: Map<string, Set<string>> = new Map();

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

    this.listenForConnections();
    this.listenForRedisMessages();
  }
  private async subscribeToChannel(socket: any, channel: string) {
    if (!this.socketSubscriptionMap.has(channel)) {
      this.socketSubscriptionMap.set(channel, new Set());
      await redisPubSub.sub.subscribe(channel);
    }
    this.socketSubscriptionMap.get(channel)!.add(socket.id);
  }

  private async unsubscribeFromChannel(socket: any, channel: string) {
    if (this.socketSubscriptionMap.has(channel)) {
      this.socketSubscriptionMap.get(channel)!.delete(socket.id);

      if (this.socketSubscriptionMap.get(channel)!.size === 0) {
        await redisPubSub.sub.unsubscribe(channel);
        this.socketSubscriptionMap.delete(channel);
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
            const notificationCount=await NotificationModel.countDocuments({isRead:false})
          socket.emit(`notifications`, {notifications,count:notificationCount});
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

      socket.on("disconnect", async () => {
        console.log(`Client disconnected: ${socket.id}`);
        for (const [channel, sockets] of this.socketSubscriptionMap.entries()) {
          if (sockets.has(socket.id)) {
            await this.unsubscribeFromChannel(socket, channel);
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
          console.log(data)
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
    try {
      console.log("Shutting down SocketService...");

      // Unsubscribe from all active Redis channels
      for (const channel of this.socketSubscriptionMap.keys()) {
        await redisPubSub.sub.unsubscribe(channel);
        console.log(`Unsubscribed from Redis channel: ${channel}`);
      }

      // Clear the map
      this.socketSubscriptionMap.clear();

      // Close all socket connections
      this._io.disconnectSockets(true);

      // Close the Socket.IO server
      await new Promise<void>((resolve) => {
        this._io.close(() => {
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
