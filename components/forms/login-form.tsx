"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { getApiErrorMessage, saveTokensToStorage } from "@/lib/api";
import { loginRequest, toSessionUser } from "@/services/authServices";

const targetByRole: Record<string, string> = {
  customer: "/events",
  organizer: "/organizer",
  super_admin: "/admin",
  gate_staff: "/events",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNext(value: FormDataEntryValue | null): string {
  const raw = typeof value === "string" ? value : "";
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : "";
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setErrorMsg("Email dan password wajib diisi.");
      return;
    }
    if (!emailPattern.test(email)) {
      setErrorMsg("Format email belum benar.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    try {
      const data = await loginRequest({ email, password });
      const user = toSessionUser(data.user);
      saveTokensToStorage(data.access_token, data.refresh_token);
      setUser(user);
      router.push(safeNext(formData.get("next")) || next || targetByRole[user.role] || "/");
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Email atau password salah."));
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="type-page text-navy-900">Selamat datang kembali!</h1>
      <p className="body-copy mt-1 text-muted">
        Masuk untuk melanjutkan ke akun{" "}
        <span className="font-semibold text-navy-900">Tiquet</span>.
      </p>

      {errorMsg && (
        <Alert tone="danger" className="mt-3">
          {errorMsg}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {next && <input type="hidden" name="next" value={next} />}

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="nama@email.com"
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Minimal 6 karakter"
          />
        </Field>

        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          <label className="flex items-center gap-2 text-muted">
            <Checkbox type="checkbox" name="remember" /> Ingat saya
          </label>
          <Link
            href="/forgot-password"
            className="font-semibold text-navy-900 underline-offset-4 transition hover:text-navy-600 hover:underline"
          >
            Lupa sandi?
          </Link>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Memproses..." : "Masuk"}{" "}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted sm:text-sm">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-navy-900 underline-offset-4 transition hover:text-navy-600 hover:underline"
        >
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}
