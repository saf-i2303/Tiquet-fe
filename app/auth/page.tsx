import { redirect } from "next/navigation";

/**
 * Tujuan handler 401 terpusat di lib/api.ts (UNAUTHORIZED_REDIRECT).
 * Halaman login aktif berada di /login, jadi /auth hanya menjadi alias.
 */
export default function AuthPage() {
  redirect("/login");
}
