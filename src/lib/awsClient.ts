import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import config from "../config/configuration";

//s3 client instance
export const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId || "",
    secretAccessKey: config.aws.secretAccessKey || "",
  },
});
// SQS client instance
export const sqsClient = new SQSClient({
  region: config.aws.region!, 
  credentials: {
    accessKeyId: config.aws.accessKeyId!, 
    secretAccessKey: config.aws.secretAccessKey!,
  },
});
