import mongoose from "mongoose";
import { createServer } from "http";
import { app } from "./app";
import SocketService from "./services/socketService";
import { runConsumer } from "./kafka/consumer";
import { runProducer } from "./kafka/producer";


const start = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MongoDB Key Not Set");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }

  const server = createServer(app);
  const socketService = new SocketService(server);
  await runConsumer();
  await runProducer();

  const port = process.env.PORT || 3001;
  server.listen(port, () => console.log(`Server running on port ${port}`));
};

start();
