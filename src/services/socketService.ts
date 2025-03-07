import { Server } from "socket.io";
import { redisPubSub } from "../config/redisPubSub";
import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { BidModel } from "../models/bidModel";
//import { produceMessage } from "../infrastructure/kafka/kafkaProducer"; // Assuming Kafka is used

class SocketService {
  private _io: Server;

  constructor(
    server: HttpServer<typeof IncomingMessage, typeof ServerResponse>
  ) {
    this._io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
      },
    });

    this.listenForConnections();
  }

  private listenForConnections() {
    const io = this._io;
    console.log("Listening for socket connections...");

    io.on("connection", (socket) => {
      console.log(`New client connected: ${socket.id}`);

      /* Bidding Events */

      socket.on("joinBiddingRoom", async (gigId) => {
        socket.join(gigId);
        console.log(`User joined room: ${gigId}`);

        // Send initial top 10 bids
        const topBids = await BidModel.find({ gigId })
          .sort({ amount: -1 })
          .limit(10);
        socket.emit("updateBids", topBids);
        // Subscribe to Redis for bid updates
        redisPubSub.sub.subscribe(`bids:${gigId}`);
      });

      socket.on("newBid", async (gigId) => {
        const topBids = await BidModel.find({ gigId })
          .sort({ amount: -1 })
          .limit(10);
        io.to(gigId).emit("updateBids", topBids);
      });

      socket.on("leaveBiddingRoom", (gigId) => {
        socket.leave(gigId);
        console.log(`User left room: ${gigId}`);
        redisPubSub.sub.unsubscribe(`bids:${gigId}`);
      });

      /* Messaging Events */

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New Message Received:", message);

        // Publish the message to Redis
        await redisPubSub.pub.publish("MESSAGES", JSON.stringify({ message }));
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    // Listen for messages from Redis
    redisPubSub.sub.on("message", async (channel, message) => {
      /* Bids */
      if (channel.startsWith("bids:")) {
        //const { gigId } = JSON.parse(message);
        const gigId = channel.split(":")[1];
        // Fetch updated top 10 bids
        const topBids = await BidModel.find({ gigId })
          .sort({ amount: -1 })
          .limit(10);
        io.to(gigId).emit("updateBids", topBids);
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
