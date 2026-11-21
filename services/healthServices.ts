import { api, unwrap } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

/** Data health dari backend: map[string]string dengan key `status` dan `postgres`. */
export type HealthPayload = {
  status: string;
  postgres: string;
};

/** GET /api/v1/health — pengecekan konektivitas server dan database. */
export async function checkHealth(): Promise<HealthPayload> {
  return unwrap(await api.get<ApiResponse<HealthPayload>>("/health"));
}
