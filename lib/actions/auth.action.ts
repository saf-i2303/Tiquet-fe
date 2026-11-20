"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, setSession } from "@/lib/auth";
import { requireAuth } from "@/lib/guards";
import { mockLogin, mockRegister } from "@/services/auth.service";
import type { AuthFormState } from "@/types/auth";
import type { Role } from "@/types/user";

const targetByRole: Record<string, string> = {
  customer: "/",
  organizer: "/organizer",
  super_admin: "/admin",
  gate_staff: "/",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNext(value: FormDataEntryValue | null): string {
  const raw = typeof value === "string" ? value : "";
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "";
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "customer") as Role;
  const remember = formData.get("remember") === "on";
  const next = safeNext(formData.get("next"));

  if (!email || !password) return { error: "Email dan password wajib diisi." };
  if (!emailPattern.test(email)) return { error: "Format email belum benar." };
  if (password.length < 6) return { error: "Password minimal 6 karakter." };

  const user = await mockLogin({ email, password, role, remember });
  await setSession(user, remember);
  redirect(next || targetByRole[role] || "/");
}

export async function registerAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "customer") === "organizer" ? "organizer" : "customer";

  if (name.length < 2) return { error: "Nama minimal 2 karakter." };
  if (!emailPattern.test(email)) return { error: "Format email belum benar." };
  if (phone.length < 9) return { error: "Nomor WhatsApp belum valid." };
  if (password.length < 8) return { error: "Password minimal 8 karakter." };

  const user = await mockRegister({ name, email, phone, password, role });
  await setSession(user);
  redirect(targetByRole[role] ?? "/");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/");
}

export async function updateProfileAction(formData: FormData): Promise<void> {
  const session = await requireAuth("/profile");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  if (name.length < 2) redirect("/profile?error=name");

  await setSession({ ...session, name, phone, city });
  revalidatePath("/profile");
  redirect("/profile?saved=1");
}

export async function sendResetAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  if (!emailPattern.test(email)) redirect("/forgot-password?error=email");
  redirect("/forgot-password?sent=1");
}
