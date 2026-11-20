import { getSession } from "@/lib/auth";
import { previewSession } from "@/lib/preview";
import type { Role, SessionUser } from "@/types/user";

/**
 * Semua halaman bisa dibuka langsung lewat URL — tidak ada validasi
 * login/register. Session demo dipakai sebagai fallback supaya halaman
 * yang menampilkan data user tetap bisa dirender.
 */
export async function requireAuth(nextPath = "/"): Promise<SessionUser> {
  void nextPath;
  return (await getSession()) ?? previewSession("customer");
}

export async function requireRole(role: Role, nextPath = "/"): Promise<SessionUser> {
  void nextPath;
  const session = await getSession();
  return session?.role === role ? session : previewSession(role);
}

/** Login/register tetap bisa diakses kapan saja. */
export async function redirectIfAuthenticated(): Promise<void> {
  return;
}
