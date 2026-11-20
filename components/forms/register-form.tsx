"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, BadgeCheck, Users } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { registerAction } from "@/lib/actions/auth.action";
import { cn } from "@/lib/utils";
import type { AuthFormState } from "@/types/auth";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );
  const [role, setRole] = useState("customer");

  return (
    <div className="w-full">
      <h1 className="type-page text-navy-900">Buat akun gratis</h1>
      <p className="body-copy mt-1 text-muted">
        Jelajahi event, amankan tiket, dan kelola pesanan dalam satu tempat.
      </p>

      {state.error && (
        <Alert tone="danger" className="mt-3">
          {state.error}
        </Alert>
      )}

      <form action={formAction} className="mt-4 space-y-3">
        <Field label="Nama lengkap" htmlFor="name">
          <Input id="name" name="name" required placeholder="Nama kamu" />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          <Field label="No. WhatsApp" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              required
              inputMode="tel"
              placeholder="08xxxxxxxxxx"
            />
          </Field>
        </div>

        <Field label="Password" htmlFor="password" hint="Min. 8 karakter">
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
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

        <Button type="submit" disabled={pending} className="mt-5 w-full">
          {pending ? "Memproses..." : "Buat akun"}{" "}
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
