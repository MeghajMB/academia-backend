import { CloudfrontSignedCookiesOutput } from "@aws-sdk/cloudfront-signer";

export interface IFileService {
  generatePutSignedUrl(
    key: string,
    contentType: string,
    isPublic?: boolean,
    isTemp?: boolean
  ): Promise<string>;

  generateGetSignedUrl(key: string): Promise<string>;

  generateCloudFrontGetSignedCookies(
    videoPath: string
  ): Promise<CloudfrontSignedCookiesOutput>;
}
