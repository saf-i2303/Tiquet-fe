/** Envelope sukses Go/Fiber: { success, message, data }. `data` memakai omitempty. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/** Metadata pagination yang dipakai semua endpoint daftar backend. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

/** Shape `data` pada endpoint daftar backend: { items, pagination }. */
export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

/** Validator Go mengembalikan array {field, message}; beberapa error memakai map. */
export type ApiErrorDetails = ApiFieldError[] | Record<string, string[]>;

/** Bentuk `error` pada ErrorResponse backend. */
export interface ApiErrorBody {
  code?: string;
  details?: ApiErrorDetails;
}

/**
 * Error payload backend: { success, message, error: { code, details } }.
 * `code`/`details` juga dinormalisasi ke root oleh lib/api.ts agar helper lama tetap bekerja.
 */
export interface ApiErrorPayload {
  message: string;
  success?: boolean;
  error?: ApiErrorBody;
  code?: string;
  details?: ApiErrorDetails;
}
