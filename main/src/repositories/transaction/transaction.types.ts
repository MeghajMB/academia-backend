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
  date:string;
  earnings:number;
};