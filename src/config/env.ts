import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().optional().default("3000"),

  KAFKA_BROKER: z.string().min(1),
  KAFKA_CLIENT_ID: z.string().min(1),

  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.string().min(1),

  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_TEMP_BUCKET_NAME: z.string().min(1),
  AWS_BUCKET_NAME: z.string().min(1),

  MONGO_URI: z.string().min(1),

  MAILTRAP_USER_ID: z.string().min(1),
  MAILTRAP_USER_PASSWORD: z.string().min(1),

  DOMAIN_NAME: z.string().min(1),
  CLIENT_URL: z.string().min(1),

  JWT_ACCESS_TOKEN_SECRET: z.string().min(1),
  JWT_REFRESH_TOKEN_SECRET: z.string().min(1),
  JWT_PASSWORD_RESET_SECRET: z.string().min(1),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),

  CLOUDFRONT_DOMAIN: z.string().min(1),
  CLOUDFRONT_KEY_PAIR_ID: z.string().min(1),
  CLOUDFRONT_PRIVATE_KEY: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
