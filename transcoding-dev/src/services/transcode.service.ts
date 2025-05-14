import dotenv from "dotenv";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "node:fs/promises";
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { Readable, pipeline } from "stream";
import util from "util";
import { exec } from "child_process";
import path from "node:path";
import { MessageBody } from "../types/types";
import { produceLectureEvent } from "../kafka/producer";

dotenv.config();

const execAsync = util.promisify(exec);
const pipelineAsync = util.promisify(pipeline);

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

//use ffmpeg to convert to hsl
export async function transcode({ event, data }: MessageBody) {
  try {
    const tempFilePath = `/tmp/${data.lectureId}/video.mp4`; //in production the path is /tmp/video.mp4
    const outputFolder = `tmp/${data.lectureId}/hls_output`; //in production the path is /tmp/hls_output
    const tempDirPath = `/tmp/${data.lectureId}`;
    // Download video from S3
    const command = new GetObjectCommand({
      Bucket: data.bucketName,
      Key: data.key,
    });
    console.log(data.lectureId);
    const result = await s3Client.send(command);

    if (!result.Body) {
      throw new Error("Failed to download video: S3 object body is empty.");
    }
    //stream the video into the temppath
    if (!existsSync(tempDirPath)) {
      mkdirSync(tempDirPath, { recursive: true });
    }
    console.log("Starting video download...");
    const fileStream = createWriteStream(tempFilePath);
    await pipelineAsync(result.Body as Readable, fileStream);
    console.log("Video downloaded successfully.");

    // HLS Transcoding
    console.log("Starting HLS transcoding...");
    await fs.mkdir(outputFolder, { recursive: true });
    // change the command for linux
    const ffmpegCommand =
      `ffmpeg -i "${tempFilePath}" ` +
      `-filter_complex ` +
      `"[0:v]split=3[v1][v2][v3]; ` +
      `[v1]scale=w=1920:h=1080[v1out]; ` +
      `[v2]scale=w=1280:h=720[v2out]; ` +
      `[v3]scale=w=854:h=480[v3out]" ` +
      `-map "[v1out]" -c:v:0 libx264 -b:v:0 5000k -maxrate:v:0 5350k -bufsize:v:0 7500k ` +
      `-map "[v2out]" -c:v:1 libx264 -b:v:1 2800k -maxrate:v:1 2996k -bufsize:v:1 4200k ` +
      `-map "[v3out]" -c:v:2 libx264 -b:v:2 1400k -maxrate:v:2 1498k -bufsize:v:2 2100k ` +
      `-map a:0 -c:a aac -b:a:0 192k -ac 2 ` +
      `-map a:0 -c:a aac -b:a:1 128k -ac 2 ` +
      `-map a:0 -c:a aac -b:a:2 96k -ac 2 ` +
      `-f hls ` +
      `-hls_time 10 ` +
      `-hls_playlist_type vod ` +
      `-hls_flags independent_segments ` +
      `-hls_segment_type mpegts ` +
      `-hls_segment_filename "${outputFolder}/stream_%v/data%03d.ts" ` +
      `-master_pl_name master.m3u8 ` +
      `-var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" ` +
      `"${outputFolder}/stream_%v/playlist.m3u8"`;

    await execAsync(ffmpegCommand);

    console.log("HLS transcoding complete. Uploading to S3...");
    //uploads the file to s3 and returns the key of the main file
    const masterBucketKey = await uploadHlsToS3(
      outputFolder,
      process.env.AWS_BUCKET_NAME!,
      data.key
    );
    console.log("Uploading to S3 complete. Changing lecture status");
    // produce message here
    await produceLectureEvent({
      event: "lecture-transcoded",
      data: {
        courseId: data.courseId,
        key: masterBucketKey,
        lectureId: data.lectureId,
        sectionId: data.sectionId,
        userId: data.userId,
      },
    });

    console.log("Lecture status updated to 'completed' in MongoDB.");
    await s3Client.send(
      new DeleteObjectCommand({ Bucket: data.bucketName, Key: data.key })
    );
    console.log("Deleted the file in temp bucket");
    /* Deleting the temp folder */

    for (const file of [outputFolder, tempFilePath]) {
      await fs.rm(file, { recursive: true, force: true });
      console.log(`Deleted local file/folder: ${file}`);
    }
    fs.rmdir(tempDirPath);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Upload HLS files to S3
async function uploadHlsToS3(
  folder: string,
  bucket: string,
  originalKey: string
) {
  const uploadFile = async (
    filePath: string,
    s3Key: string
  ): Promise<string | void> => {
    const fileStream = await fs.readFile(filePath);
    const contentType = s3Key.endsWith(".m3u8")
      ? "application/vnd.apple.mpegurl"
      : "video/MP2T"; // Ensure correct MIME type for each file

    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: fileStream,
      ContentType: contentType,
    });

    try {
      await s3Client.send(putCommand);
    } catch (error) {
      console.error(`Failed to upload ${s3Key}:`, error);
    }
  };

  const files = await fs.readdir(folder, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(folder, file.name);
    //check if the file is a directory

    if (file.isDirectory()) {
      // If it's a directory, recurse into it and upload files
      const subFiles = await fs.readdir(fullPath, {
        withFileTypes: true,
      });
      //loop the subfolder to get the files and upload it into s3
      for (const subFile of subFiles) {
        const subFilePath = path.join(fullPath, subFile.name);
        const s3Key = `videos/${originalKey}/${file.name}/${subFile.name}`;
        await uploadFile(subFilePath, s3Key);
      }
    } else {
      // If it's a file, upload it
      const s3Key = `videos/${originalKey}/${file.name}`;
      await uploadFile(fullPath, s3Key);
    }
  }
  return `videos/${originalKey}/master.m3u8`;
}
