import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
/*   if (!process.env.JWT_SECRET) {
    throw new Error("Env not initialized");
  } */
  if (!process.env.MONGO_URI) {
    throw new Error("MongoDB Key Not Set");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected");
  } catch (err) {
    console.error(err);
  }
};

const port = process.env.PORT || 3001;
start().then(() =>
  app.listen(port, () => console.log(`Created at port ${port}`))
);
