import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../util/awsS3Client";

export class FileService {
  private bucketName = process.env.AWS_BUCKET_NAME!;

  async generatePutSignedUrl(key: string, contentType: string,isPublic:boolean): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
  });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // URL expiration time
    });

    return signedUrl;
  }
  async generateGetSignedUrl(key:string){

    const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      const signedUrl = await getSignedUrl(s3Client, command);
      return signedUrl
  }
}