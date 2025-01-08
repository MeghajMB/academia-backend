// src/infrastructure/server/Server.ts
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config(/* { path: "./src/.env" } */);

import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middleware/error-handler";

import passport from "passport";
import "./config/passport";

import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(passport.initialize());

app.use("/api/auth", authRoutes);

app.use(
  errorHandler as (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => void
);

export { app };
