import { RtpCodecCapability } from "mediasoup/node/lib/rtpParametersTypes";
import { env } from "./env";
const config = {
  env: {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
  },
  kafka: {
    broker: env.KAFKA_BROKER,
    clientId: env.KAFKA_CLIENT_ID,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
  aws: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
    tempBucketName: env.AWS_TEMP_BUCKET_NAME,
    bucketName: env.AWS_BUCKET_NAME,
  },
  mongo: {
    uri: env.MONGO_URI,
  },
  mailtrap: {
    userId: env.MAILTRAP_USER_ID,
    userPassword: env.MAILTRAP_USER_PASSWORD,
  },
  app: {
    domainName: env.DOMAIN_NAME,
    clientUrl: env.CLIENT_URL,
    backendUrl: env.BACKEND_URL,
    publicIp: env.PUBLIC_IP,
  },
  jwt: {
    accessTokenSecret: env.JWT_ACCESS_TOKEN_SECRET,
    refreshTokenSecret: env.JWT_REFRESH_TOKEN_SECRET,
    passwordResetSecret: env.JWT_PASSWORD_RESET_SECRET,
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
  razorpay: {
    keyId: env.RAZORPAY_KEY_ID,
    keySecret: env.RAZORPAY_KEY_SECRET,
  },
  cloudfront: {
    domain: env.CLOUDFRONT_DOMAIN,
    keyPairId: env.CLOUDFRONT_KEY_PAIR_ID,
    privateKey: env.CLOUDFRONT_PRIVATE_KEY,
  },
  mediasoup: {
    mediaCodecs: [
      {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/VP9",
        clockRate: 90000,
        parameters: {
          "profile-id": 2,
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/h264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "4d0032",
          "level-asymmetry-allowed": 1,
          "x-google-start-bitrate": 1000,
        },
      },
      {
        kind: "video",
        mimeType: "video/h264",
        clockRate: 90000,
        parameters: {
          "packetization-mode": 1,
          "profile-level-id": "42e01f",
          "level-asymmetry-allowed": 1,
          "x-google-start-bitrate": 1000,
        },
      },
    ] as RtpCodecCapability[],
  },
};

export default config;
