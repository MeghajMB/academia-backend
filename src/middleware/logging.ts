import morgan from "morgan";
import fs from "fs";
import path from "path";
import * as rfs from "rotating-file-stream";

// Create a logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a rotating write stream for logs (optional)
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: logsDir
  })

// Configure Morgan to log to the file and console
const morganLogger = morgan(":method :url :status :res[content-length] - :response-time ms", {
  stream: accessLogStream, // Log to file
});

export { morganLogger };