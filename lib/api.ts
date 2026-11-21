import type {
  ApiErrorDetails,
  ApiErrorPayload,
  ApiResponse,
} from "@/types/api";
import type { SessionUser } from "@/types/user";

/**
 * SATU-SATUNYA tempat request HTTP ke backend dibangun.
 *
 * Alur: lib/api.ts -> services/<domain>Services.ts -> page/component.
 * Dilarang memanggil `fetch` langsung atau menduplikat BASE_URL di service.
 */

const API_VERSION_PATH = "/api/v1";
const PROXY_FALLBACK_URL = API_VERSION_PATH;
const DEFAULT_UPSTREAM_ORIGIN = "http://localhost:8080";

/**
 * Menerima origin (http://localhost:8080) maupun base lengkap
 * (http://localhost:8080/api/v1). Trailing slash dibuang agar path tidak dobel.
 * Nilai relatif "/api/v1" tetap diterima sebagai fallback rewrite Next.js.
 */
function normalizeApiBaseUrl(
  value: string | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim().replace(/\/+$/, "");
  if (!trimmed) return fallback;
  return trimmed.endsWith(API_VERSION_PATH)
    ? trimmed
    : `${trimmed}${API_VERSION_PATH}`;
}

/**
 * Browser memanggil backend langsung (cross-origin) dan mengandalkan CORS.
 * NEXT_PUBLIC_API_URL di-inline Next.js saat build karena memakai prefix tersebut.
 */
export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL,
  PROXY_FALLBACK_URL,
);

/** Render sisi server memakai API_UPSTREAM_URL (server-only). */
const SERVER_API_URL = normalizeApiBaseUrl(
  process.env.API_UPSTREAM_URL,
  DEFAULT_UPSTREAM_ORIGIN,
);

function getApiBaseUrl(): string {
  return typeof window === "undefined" ? SERVER_API_URL : API_BASE_URL;
}

export const TOKEN_STORAGE_KEY = "tiketku_access_token";
export const REFRESH_TOKEN_STORAGE_KEY = "tiketku_refresh_token";
export const USER_STORAGE_KEY = "tiketku_user_data";
export const UNAUTHORIZED_REDIRECT = "/login";

/** Dikirim saat clearTokens() agar context klien ikut menghapus user. */
export const AUTH_CLEARED_EVENT = "tiketku:auth-cleared";

/** Mencegah beberapa 401 bersamaan memicu redirect berulang. */
let isRedirecting = false;

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status = 500, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams =
  | Record<string, QueryValue | QueryValue[]>
  | URLSearchParams;

export interface ApiRequestOptions extends Omit<
  RequestInit,
  "headers" | "method" | "body"
> {
  headers?: Record<string, string>;
  /** Opsi cache/revalidate fetch extended Next.js. */
  next?: { revalidate?: number | false; tags?: string[] };
  /** Set true untuk endpoint publik yang tidak boleh mengirim Bearer. */
  skipAuth?: boolean;
}

/* --------------------------------- token -------------------------------- */

/** Token hanya dibaca dari localStorage di browser; server tidak menyimpan auth. */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // localStorage bisa diblokir (private mode); request tetap berjalan tanpa token.
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveTokensToStorage(
  accessToken: string,
  refreshToken: string,
): void {
  setAccessToken(accessToken);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  } catch {
    // Diabaikan seperti setAccessToken.
  }
}

/* --------------------------------- user --------------------------------- */

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.role === "string"
  );
}

/** User login disimpan di localStorage agar layout tidak perlu memanggil /auth/me. */
export function getUserFromStorage(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSessionUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveUserToStorage(user: SessionUser): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Diabaikan seperti setAccessToken.
  }
}

export function removeUserFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Diabaikan seperti getAccessToken.
  }
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    // Diabaikan seperti getAccessToken.
  }
  removeUserFromStorage();
  window.dispatchEvent(new Event(AUTH_CLEARED_EVENT));
}

/** Handler 401 terpusat: hapus token lalu arahkan ke /login. */
function handleUnauthorized(): void {
  if (isRedirecting) return;

  clearTokens();
  if (typeof window === "undefined") return;

  if (window.location.pathname === UNAUTHORIZED_REDIRECT) return;

  // DEBUG SEMENTARA: hapus setelah masalah 401 teratasi.
  if (process.env.NODE_ENV !== "production") {
    console.warn("[api] 401 diterima — hapus token dan redirect ke /login");
  }

  isRedirecting = true;
  window.location.replace("/login");
}

/* -------------------------------- helpers -------------------------------- */

/** URLSearchParams melakukan encoding otomatis (setara encodeURIComponent). */
export function buildQuery(params?: QueryParams): string {
  if (!params) return "";
  if (params instanceof URLSearchParams) return params.toString();

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== "") {
          search.append(key, String(item));
        }
      }
      continue;
    }
    search.append(key, String(value));
  }
  return search.toString();
}

function buildUrl(path: string, params?: QueryParams): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = `${getApiBaseUrl()}${normalized}`;
  const query = buildQuery(params);
  return query ? `${base}?${query}` : base;
}

function isBodyInit(body: unknown): body is BodyInit {
  if (typeof body === "string") return true;
  if (typeof FormData !== "undefined" && body instanceof FormData) return true;
  if (typeof Blob !== "undefined" && body instanceof Blob) return true;
  if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer)
    return true;
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams)
    return true;
  return false;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  return isBodyInit(body) ? body : JSON.stringify(body);
}

async function buildHeaders(
  body: unknown,
  custom: Record<string, string> | undefined,
  skipAuth: boolean | undefined,
): Promise<Record<string, string>> {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const rawToken = skipAuth ? null : await getAccessToken();
  // Lindungi dari token yang sudah membawa prefiks "Bearer " atau spasi.
  const token = rawToken?.replace(/^Bearer\s+/i, "").trim();

  return {
    Accept: "application/json",
    // FormData harus dibiarkan browser yang menentukan boundary-nya.
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...custom,
    // Token dari getAccessToken() menang agar tidak tertimpa custom header.
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Error internal Next.js harus diteruskan agar prerender/redirect tetap bekerja. */
function isNextControlError(error: unknown): boolean {
  const candidate = error as {
    name?: string;
    digest?: string;
    code?: string;
  } | null;
  if (!candidate) return false;
  return (
    candidate.name === "AbortError" ||
    candidate.digest === "DYNAMIC_SERVER_USAGE" ||
    candidate.digest === "BAILOUT_TO_CLIENT_SIDE_RENDERING" ||
    candidate.code === "NEXT_STATIC_GEN_BAILOUT"
  );
}

/** fetch() gagal sebelum ada response: network down, diblokir browser, atau CORS. */
function toNetworkError(error: unknown, url: string): ApiError {
  const reason = error instanceof Error ? error.message : String(error);
  const target =
    typeof window === "undefined"
      ? "API_UPSTREAM_URL backend"
      : "koneksi dan konfigurasi CORS backend";
  const detail =
    process.env.NODE_ENV === "production" ? "" : ` (${url}: ${reason})`;
  return new ApiError(`Gagal terhubung ke API. Periksa ${target}.${detail}`, 0);
}

async function request<T>(
  method: string,
  path: string,
  body: unknown,
  options: ApiRequestOptions = {},
  params?: QueryParams,
): Promise<T> {
  const { headers, next, skipAuth, cache, ...rest } = options;
  const payload = serializeBody(body);
  const url = buildUrl(path, params);
  const requestHeaders = await buildHeaders(payload, headers, skipAuth);

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      method,
      ...(payload === undefined ? {} : { body: payload }),
      headers: requestHeaders,
      ...(next ? { next } : { cache: cache ?? "no-store" }),
      // Token ada di localStorage, bukan cookie; selaras dengan AllowCredentials=false.
      credentials: "omit",
    });
  } catch (error) {
    if (isNextControlError(error)) throw error;
    throw toNetworkError(error, url);
  }

  // Backend: success -> { success, message, data? }; error -> { success, message, error: { code, details } }.
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized();
    const raw = data as ApiErrorPayload | null;
    const payloadError: ApiErrorPayload | undefined = raw
      ? {
          ...raw,
          code: raw.code ?? raw.error?.code,
          details: raw.details ?? raw.error?.details,
        }
      : undefined;
    throw new ApiError(
      payloadError?.message ?? `Request gagal (${response.status}).`,
      response.status,
      payloadError,
    );
  }

  return data as T;
}

/**
 * Helper untuk membuka envelope sukses backend: { success, message, data? }.
 * Endpoint delete/logout tidak mengirim `data`, jadi helper ini dipakai hanya
 * untuk endpoint yang kontraknya menjamin adanya `data`.
 */
export function unwrap<T>(envelope: ApiResponse<T>): T {
  if (envelope.data === undefined) {
    throw new ApiError(envelope.message || "Respons API tidak memiliki data.");
  }
  return envelope.data;
}

export function getFieldErrors(
  details?: ApiErrorDetails,
): Record<string, string> {
  if (!details) return {};
  if (Array.isArray(details)) {
    return Object.fromEntries(
      details.map((item) => [item.field, item.message]),
    );
  }
  return Object.fromEntries(
    Object.entries(details).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.join(", ") : String(messages),
    ]),
  );
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export const api = {
  /** GET dengan query param opsional (objek atau URLSearchParams). */
  get<T>(
    path: string,
    params?: QueryParams,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    return request<T>("GET", path, undefined, options, params);
  },

  /** POST dengan body objek (auto JSON.stringify) atau FormData. */
  post<T>(
    path: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    return request<T>("POST", path, body, options);
  },

  /** PUT dengan body objek (auto JSON.stringify). */
  put<T>(
    path: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    return request<T>("PUT", path, body, options);
  },

  /** DELETE tanpa body (query param bisa dikirim lewat path/options). */
  delete<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    return request<T>("DELETE", path, undefined, options);
  },

  /** POST multipart/FormData. Content-Type JSON tidak ditambahkan. */
  upload<T>(
    path: string,
    formData: FormData,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    return request<T>("POST", path, formData, options);
  },
};
