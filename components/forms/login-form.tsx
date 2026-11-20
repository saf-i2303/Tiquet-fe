"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { loginAction } from "@/lib/actions/auth.action";
import type { AuthFormState } from "@/types/auth";

const initialState: AuthFormState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <div className="w-full">
      <h1 className="type-page text-navy-900">Selamat datang kembali!</h1>
      <p className="body-copy mt-1 text-muted">
        Masuk untuk melanjutkan ke akun{" "}
        <span className="font-semibold text-navy-900">Tiquet</span>.
      </p>

      {state.error && (
        <Alert tone="danger" className="mt-3">
          {state.error}
        </Alert>
      )}

      <form action={formAction} className="mt-4 space-y-3">
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

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Memproses..." : "Masuk"}{" "}
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
