import {
  api,
  ApiError,
  clearTokens,
  refreshAccessToken,
  saveTokensToStorage,
  unwrap,
} from "@/lib/api";
import type {
  AuthData,
  AuthEnvelope,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UserEnvelope,
} from "@/types/auth";
import type { Role, SessionUser } from "@/types/user";

export async function registerRequest(
  payload: RegisterPayload,
): Promise<AuthUser> {
  const response = await api.post<UserEnvelope>("/auth/register", payload);
  return unwrap(response);
}

export async function loginRequest(payload: LoginPayload): Promise<AuthData> {
  const response = await api.post<AuthEnvelope>(
    "/auth/login",
    {
      email: payload.email,
      password: payload.password,
    },
    { skipAuth: true },
  );
  return unwrap(response);
}

/**
 * POST /api/v1/auth/refresh
 * Implementasi ada di lib/api.ts (dipakai juga oleh handler 401 terpusat)
 * agar tidak terjadi circular import antara lib/api dan services.
 */
export async function refreshTokenRequest(_refreshToken?: string): Promise<AuthData> {
  const data = await refreshAccessToken();
  if (!data) throw new ApiError("Sesi berakhir. Silakan masuk kembali.", 401);
  return data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await api.post(
    "/auth/logout",
    { refresh_token: refreshToken },
    { skipAuth: true },
  );
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<UserEnvelope>("/auth/me");
  return unwrap(response);
}

export function persistAuthData(data: AuthData): void {
  saveTokensToStorage(data.access_token, data.refresh_token);
}

/** Logout murni client: hapus token di localStorage, tanpa cookie/API logout. */
export async function logoutSessionRequest(): Promise<void> {
  clearTokens();
}

export function toSessionUser(user: AuthUser): SessionUser {
  const roles: Role[] = user.roles?.length ? user.roles : ["customer"];
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: roles[0],
    roles,
  };
}
