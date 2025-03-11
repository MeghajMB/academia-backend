import { Server } from "socket.io";
import { redisPubSub } from "../config/redisPubSub";
import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { BidModel } from "../models/bidModel";
import { NotificationModel } from "../models/notificationModel";

class SocketService {
  private _io: Server;
  private activeSubscriptions: Set<string>;

  constructor(
    server: HttpServer<typeof IncomingMessage, typeof ServerResponse>
  ) {
    this._io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
      },
    });
    this.activeSubscriptions = new Set();

    this.listenForConnections();
    this.listenForRedisMessages();
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
          socket.emit(`updateBids${gigId}`, topBids);
          //subscribe if not subscribed
          if (!this.activeSubscriptions.has(`bids:${gigId}`)) {
            await redisPubSub.sub.subscribe(`bids:${gigId}`);
            this.activeSubscriptions.add(`bids:${gigId}`);
          }
        } catch (error) {
          console.error(`Error in joinBiddingRoom: ${error}`);
          socket.emit("error", { message: "Failed to join bidding room" });
        }
      });

      socket.on("leaveBiddingRoom", async (gigId) => {
        socket.leave(gigId);
        if (io.sockets.adapter.rooms.get(gigId)?.size === 0) {
          await redisPubSub.sub.unsubscribe(`bids:${gigId}`);
          this.activeSubscriptions.delete(`bids:${gigId}`);
        }
      });

      /* Notification Events */
      socket.on("registerUser", async (userId) => {
        try {
          socket.join(userId);
          const notification = await NotificationModel.find({ userId });
          socket.emit(`notifications`, notification);
          redisPubSub.sub.subscribe(`notifications:${userId}`);
        } catch (error) {
          console.log(error);
        }
      });
      socket.on("unRegisterUser", async (userId) => {
        try {
          socket.leave(userId);
          redisPubSub.sub.unsubscribe(`notifications:${userId}`);
        } catch (error) {
          console.log(error);
        }
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
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
          io.to(gigId).emit(`updateBids${gigId}`, data);
        } else if (channel.startsWith("notifications:")) {
          const userId = channel.split(":")[1];
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
      for (const subscription of this.activeSubscriptions) {
        await redisPubSub.sub.unsubscribe(subscription);
        console.log(`Unsubscribed from Redis channel: ${subscription}`);
      }

      // Clear the set
      this.activeSubscriptions.clear();

      // Close socket connections
      this._io.disconnectSockets(true);

      // Close the socket.io server
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
