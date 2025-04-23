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
  _id: {
    year: number;
    month: number;
    quarter:number;
  };
  total: number;
};