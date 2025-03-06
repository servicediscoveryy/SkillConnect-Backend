class ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  pagination?: {
    totalPages: number;
    currentPage: number;
    pageSize: number;
    totalItems: number;
  };

  constructor(
    statusCode: number,
    data: T,
    message = "Success",
    pagination?: {
      totalPages: number;
      currentPage: number;
      pageSize: number;
      totalItems: number;
    }
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = true;

    if (pagination) {
      this.pagination = pagination;
    }
  }
}

export default ApiResponse;
