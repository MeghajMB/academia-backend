import mongoose from "mongoose";

export interface TransactionBase {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  status: "pending" | "success" | "failed";
  purchaseType: "course" | "service" | "coins";
  type: "credit" | "debit";
  purchaseId?: mongoose.Types.ObjectId;
  paymentId?: string;
  orderId?: string;
  paymentMethod?: string;
  details?: Record<string, any>; // store extra details
  createdAt: Date;
  updatedAt: Date;
}

export interface getInstructorEarningsRepositoryResponse {
  _id: {
    year: number;
    month?: number;
    quarter?: number;
  };
  totalAmount: number;
  count: number;
}
export interface AggregatedEarnings {
  date: string;
  earnings: number;
}

export interface getPaginatedTransactionsOfUserRepositoryParams {
  skip: number;
  limit: number;
  type: "credit" | "debit" | "all";
  purchaseType: "course" | "conversion" | "coins" | "all";
  userId: mongoose.Types.ObjectId;
}
