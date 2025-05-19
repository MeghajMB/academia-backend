export interface getWalletServiceResponse {
  walletId: string;
  totalEarnings: number;
  goldCoins: number;
  redeemPoints: number;
  goldConversion: number;
  redeemConversion: number;
}

export interface GetTransactionHistoryParams {
    limit: number;
    page: number;
    type: "credit" | "debit"|"all";
    purchaseType: "course" | "conversion" | "coins"|"all";
    userId: string;
}
