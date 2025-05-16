import express, { Request, Response, NextFunction } from "express";

//routes
import routes from './routes/index.routes'

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
import config from "./config/configuration";

const app = express();

app.use(
  cors({
    origin: config.app.clientUrl,
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

app.get("/healthz", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

app.use("/api", routes);

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