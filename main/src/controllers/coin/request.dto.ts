import { z } from "zod";

export const createCoinPackageRequestSchema = z.object({
  coinAmount: z.number(),
  priceInINR: z.number(),
});
export type createCoinPackageRequestDTO = z.infer<
  typeof createCoinPackageRequestSchema
>;

export const updateCoinPackageRequestSchema = z.object({
  packageId:z.string(),
  coinAmount: z.number(),
  priceInINR: z.number(),
});
export type updateCoinPackageRequestDTO = z.infer<
  typeof updateCoinPackageRequestSchema
>;

export const updateCoinRatioRequestSchema = z.object({
  goldToINRRatio: z.number().min(0),
  redeemCoinToGoldRatio: z.number().min(0),
});

export type updateCoinRatioRequestDTO = z.infer<
  typeof updateCoinRatioRequestSchema
>;

export const deleteCoinPackageRequestSchema = z.object({
    packageId: z.string()
  });
  
  export type deleteCoinPackageRequestDTO = z.infer<typeof deleteCoinPackageRequestSchema>;