import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Field, Input } from "@/components/ui/input";
import { sendResetAction } from "@/lib/actions/auth.action";

export const metadata: Metadata = {
  title: "Pemulihan Sandi",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <>
      <h1 className="type-page mb-1 text-navy-900">Pemulihan sandi</h1>
      <p className="body-copy mb-5 text-muted">
        Masukkan email terdaftar, kami akan kirim tautan reset.
      </p>

      {sent && (
        <Alert tone="success" className="mb-4">
          Kalau email terdaftar, tautan reset sudah dikirim. Cek inbox dan folder spam.
        </Alert>
      )}
      {error && (
        <Alert tone="danger" className="mb-4">
          Format email belum benar. Coba lagi.
        </Alert>
      )}

      <form action={sendResetAction} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="nama@email.com"
          />
        </Field>
        <Button type="submit" className="w-full">
          Kirim Tautan Reset
        </Button>
      </form>

      <div className="mt-6 flex justify-center">
        <ButtonLink href="/login" variant="ghost" size="sm">
          ← Kembali ke Login
        </ButtonLink>
      </div>
    </>
  );
}
