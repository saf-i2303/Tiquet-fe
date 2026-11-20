export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorPayload {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}
