import * as dotenv from "dotenv";
dotenv.config();
import "./config/env";

import mongoose from "mongoose";
import { createServer } from "http";
import { app } from "./app";
import SocketService from "./sockets/socket.service";
import config from "./config/configuration";
import { runConsumers } from "./kafka/consumers";

let socketService: SocketService;
const start = async () => {
  try {
    await mongoose.connect(config.mongo.uri);
    console.log("Connected to MongoDB");
    const server = createServer(app);
    socketService = new SocketService(server);
    await runConsumers()

    const port = config.env.port || 3001;
    server.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Couldn't start the server:", err);
    process.exit(1);
  }
};
const gracefulShutdown = async () => {
  console.log("Received shutdown signal, starting graceful shutdown...");

  try {
    // Shutdown socket service
    if (socketService) {
      await socketService.shutdown();
    }

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");

    // Exit process
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
start();
