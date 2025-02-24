// src/infrastructure/server/Server.ts
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config(/* { path: "./src/.env" } */);

import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import instructorRoutes from "./routes/instructorRoutes";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import fileRoutes from "./routes/fileRoutes"
import courseRoutes from "./routes/courseRoutes"
import paymentRoutes from "./routes/paymentRoutes"
import reviewRoutes from "./routes/reviewRoutes"

import { errorHandler } from "./middleware/error-handler";

import { morganLogger } from "./middleware/logging";
import passport from "passport";
import "./config/passport";

import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { StatusCode } from "./enums/statusCode.enum";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["POST","PATCH", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morganLogger); // Log to file

app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: process.stdout, // Log to console
}));

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/files",fileRoutes);
app.use('/api/payment',paymentRoutes)
app.use("/api/review", reviewRoutes);

app.use(
  errorHandler as (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => void
);

app.use((req,res,next)=>{
  res.status(StatusCode.NOT_FOUND).send({message:'Invalid Route'})
})

export { app };