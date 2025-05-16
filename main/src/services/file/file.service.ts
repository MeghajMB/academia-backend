import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../../lib/awsClient";
import {
  CloudfrontSignedCookiesOutput,
  getSignedCookies,
} from "@aws-sdk/cloudfront-signer";
import { IFileService } from "./file.interface";
import config from "../../config/configuration";
import { injectable } from "inversify";

@injectable()
export class FileService implements IFileService {
  private readonly _bucketName = config.aws.bucketName;
  private readonly _tempBucketName = config.aws.tempBucketName;

  async generatePutSignedUrl(
    key: string,
    contentType: string,
    isPublic = false,
    isTemp = false
  ): Promise<string> {
    try {
      const bucketName = isTemp ? this._tempBucketName : this._bucketName;
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // URL expiration time
      });

      return signedUrl;
    } catch (error) {
      throw error;
    }
  }

  async generateGetSignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this._bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command);
    return signedUrl;
  }
  async generateCloudFrontGetSignedCookies(
    videoPath: string
  ): Promise<CloudfrontSignedCookiesOutput> {
    const dateLessThan = Math.floor(Date.now() / 1000) + 3600;
    const policy = {
      Statement: [
        {
          Resource: `${process.env.CLOUDFRONT_DOMAIN}/${videoPath}*`,
          Condition: {
            DateLessThan: {
              "AWS:EpochTime": dateLessThan, // time in seconds
            },
          },
        },
      ],
    };

    const policyString = JSON.stringify(policy);

    const signedCookies = getSignedCookies({
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
      policy: policyString,
    });

    return signedCookies;
  }
}
