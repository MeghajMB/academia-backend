import * as dotenv from "dotenv";
dotenv.config();
import "./config/env"; 

import { lectureConsumer } from "./kafka/lecture-consumer";

lectureConsumer().catch((error) => {
  console.log(error);
  process.exit(1);
});
