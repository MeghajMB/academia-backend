import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config(/* { path: "./src/.env" } */);

//routes
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import instructorRoutes from "./routes/instructor.routes";
import userRoutes from "./routes/user.routes";
import categoryRoutes from "./routes/category.routes";
import fileRoutes from "./routes/file.routes"
import courseRoutes from "./routes/course.routes"
import paymentRoutes from "./routes/payment.routes"
import reviewRoutes from "./routes/review.routes"
import gigRoutes from "./routes/gig.routes"
import bidRoutes from "./routes/bid.routes"
import notificationRoutes from "./routes/notifcation.routes"

import { errorHandler } from "./middleware/error-handler";
import { morganLogger } from "./middleware/logging";
import passport from "passport";
import "./lib/passport";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { StatusCode } from "./enums/status-code.enum";

//jobs
import "./jobs/delete-expired-lectures";

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
app.use("/api/gig", gigRoutes);
app.use("/api/bid", bidRoutes);
app.use("/api/notification", notificationRoutes);

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