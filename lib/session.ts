import type { SessionUser } from "@/types/user";

export const SESSION_COOKIE = "tiketku_session";

export function encodeSession(user: SessionUser): string {
  return Buffer.from(JSON.stringify(user), "utf-8").toString("base64url");
}

export function decodeSession(value?: string | null): SessionUser | null {
  if (!value) return null;
  try {
    const raw = Buffer.from(value, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw) as SessionUser;
    if (!parsed?.id || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}
