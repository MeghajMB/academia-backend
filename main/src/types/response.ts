// src/types/index.ts
export interface SuccessResponse<T = any> {
    status: 'success';
    code: number;
    message: string;
    data: T;
  }
  
  export interface ErrorDetail {
    field?: string;
    message: string;
  }
  
  export interface ErrorResponse {
    status: 'error';
    code: number;
    message: string;
    errors: ErrorDetail[];
  }