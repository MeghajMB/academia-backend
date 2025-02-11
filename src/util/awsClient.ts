import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";

//s3 client instance
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});
// SQS client instance
export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION!, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
