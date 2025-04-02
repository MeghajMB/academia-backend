interface Pagination {
  totalDocuments: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface GetUsersParams {
  role: string;
  page: number;
  limit: number;
  search: string;
}

export interface GetCoursesParams {
  page: number;
  limit: number;
  search: string;
}
export interface GetInstructorVerificationRequestsParams {
  page: number;
  limit: number;
}
export interface RejectVerificationRequestParams {
  rejectReason: string;
  userId: string;
}
