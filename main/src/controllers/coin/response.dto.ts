import { z } from "zod";
import { SuccessResponseSchema } from "../shared-response.dto";

export const GetPackagesResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
    packages: z.array(
      z.object({
        id: z.string(),
        coinAmount: z.number(),
        priceInINR: z.number(),
      })
    ),
  }),
});

export type GetPackagesResponseDTO = z.infer<typeof GetPackagesResponseSchema>;

export const CreateCoinPackageResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
    coinAmount: z.number(),
    priceInINR: z.number(),
  }),
});

export type createCoinPackageResponseDTO = z.infer<
  typeof CreateCoinPackageResponseSchema
>;

export const GetCoinConfigResponseSchema = SuccessResponseSchema.extend({
  data: z.object({
    id: z.string(),
    packages: z.array(
      z.object({
        id: z.string(),
        coinAmount: z.number(),
        priceInINR: z.number(),
      })
    ),
    goldToINRRatio: z.number(),
    redeemCoinToGoldRatio: z.number(),
    isActive: z.boolean(),
  }),
});

export type GetCoinConfigResponseDTO = z.infer<
  typeof GetCoinConfigResponseSchema
>;
