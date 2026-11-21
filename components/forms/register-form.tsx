"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, BadgeCheck, Users } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { getApiErrorMessage, saveTokensToStorage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { loginRequest, registerRequest, toSessionUser } from "@/services/authServices";

const targetByRole: Record<string, string> = {
  customer: "/events",
  organizer: "/organizer",
  super_admin: "/admin",
  gate_staff: "/events",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [role, setRole] = useState<"customer" | "organizer">("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (fullName.length < 2) {
      setErrorMsg("Nama minimal 2 karakter.");
      return;
    }
    if (fullName.length > 100) {
      setErrorMsg("Nama maksimal 100 karakter.");
      return;
    }
    if (!emailPattern.test(email)) {
      setErrorMsg("Format email belum benar.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password minimal 8 karakter.");
      return;
    }
    if (password.length > 72) {
      setErrorMsg("Password maksimal 72 karakter.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      await registerRequest({ email, password, full_name: fullName, role });
      // Register backend tidak mengembalikan token: login dengan kredensial yang sama.
      const data = await loginRequest({ email, password });
      const user = toSessionUser(data.user);
      saveTokensToStorage(data.access_token, data.refresh_token);
      setUser(user);
      router.push(targetByRole[user.role] || "/");
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Registrasi gagal, silakan coba lagi."));
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="type-page text-navy-900">Buat akun gratis</h1>
      <p className="body-copy mt-1 text-muted">
        Jelajahi event, amankan tiket, dan kelola pesanan dalam satu tempat.
      </p>

      {errorMsg && (
        <Alert tone="danger" className="mt-3">
          {errorMsg}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <Field label="Nama lengkap" htmlFor="name">
          <Input
            id="name"
            name="name"
            required
            maxLength={100}
            placeholder="Nama kamu"
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@email.com"
          />
        </Field>

        <Field label="Password" htmlFor="password" hint="8-72 karakter">
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            placeholder="Buat password"
          />
        </Field>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-navy-800">
            Daftar sebagai
          </span>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-control border py-3 text-sm font-medium transition",
                role === "customer"
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-line bg-white text-navy-700 hover:bg-canvas",
              )}
            >
              <input
                type="radio"
                name="role"
                value="customer"
                checked={role === "customer"}
                onChange={() => setRole("customer")}
                className="sr-only"
              />
              <Users className="h-5 w-5" />
              Customer
            </label>

            <label
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-control border py-3 text-sm font-medium transition",
                role === "organizer"
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-line bg-white text-navy-700 hover:bg-canvas",
              )}
            >
              <input
                type="radio"
                name="role"
                value="organizer"
                checked={role === "organizer"}
                onChange={() => setRole("organizer")}
                className="sr-only"
              />
              <BadgeCheck className="h-5 w-5" />
              Organizer
            </label>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="mt-5 w-full">
          {isLoading ? "Memproses..." : "Buat akun"}{" "}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-3 text-center text-xs leading-relaxed text-muted/80">
        Dengan daftar, kamu menyetujui{" "}
        <Link href="/terms" className="underline hover:text-navy-900">
          syarat &amp; ketentuan
        </Link>{" "}
        serta{" "}
        <Link href="/privacy" className="underline hover:text-navy-900">
          kebijakan privasi
        </Link>
        .
      </p>

      <p className="mt-2 text-center text-xs text-muted sm:text-sm">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-navy-900 underline-offset-4 transition hover:text-navy-600 hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
