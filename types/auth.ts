import type { ApiResponse } from "./api";
import type { Role, SessionUser } from "./user";

export interface LoginPayload {
  email: string;
  password: string;
}

/** Sesuai RegisterRequest backend: { email, password, full_name, role }. */
export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: Extract<Role, "customer" | "organizer">;
}

/** Shape user yang dikembalikan backend (auth/me/login/register). */
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  roles: Role[];
}

/** Data hasil login/refresh. */
export interface AuthData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export type AuthEnvelope = ApiResponse<AuthData>;
export type UserEnvelope = ApiResponse<AuthUser>;

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Dipakai form klien untuk menyimpan JWT ke localStorage setelah mutasi sukses. */
  success?: boolean;
  accessToken?: string;
  refreshToken?: string;
  /** Data user hasil login/register, disimpan sekali agar layout tidak perlu /auth/me. */
  user?: SessionUser;
  redirectTo?: string;
}
