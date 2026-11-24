"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, KeyRound, Lock, Mail } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendEmail = (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      setLoading(false);
      if (email.includes("@")) {
        setStep(2);
      } else {
        setError("Format email belum benar.");
      }
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      setLoading(false);
      if (otp === "123456") {
        setStep(3);
      } else {
        setError("Kode OTP salah. Silakan coba lagi.");
      }
    }, 1000);
  };

  // --- Handler Step 3: Simpan Sandi Baru ---
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Konfirmasi sandi tidak cocok.");
      return;
    }

    // TODO: Sambungkan endpoint reset password backend bila sudah tersedia.
    setTimeout(() => {
      setLoading(false);
      setStep(4); // Berhasil
    }, 1000);
  };

  return (
    <div className="w-full">
      {/* ───────────── STEP 1: INPUT EMAIL ───────────── */}
      {step === 1 && (
        <>
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-control bg-info-soft ring-1 ring-info/20">
            <Mail className="h-5 w-5 text-navy-700" />
          </div>
          <h1 className="type-page text-navy-900">Lupa sandi?</h1>
          <p className="body-copy mt-1 text-muted">
            Masukkan email terdaftar. Kami akan mengirim kode OTP.
          </p>

          {error && (
            <Alert tone="danger" className="mt-3">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSendEmail} className="mt-4 space-y-3">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button type="submit" disabled={loading} className="w-full mt-4!">
              {loading ? "Mengirim..." : "Kirim Kode OTP"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-control bg-info-soft ring-1 ring-info/20">
            <KeyRound className="h-5 w-5 text-navy-700" />
          </div>
          <h1 className="type-page text-navy-900">Cek Email Anda</h1>
          <p className="body-copy mt-1 text-muted">
            Kami telah mengirim 6 digit kode OTP ke <br />
            <span className="font-semibold text-navy-900">{email}</span>
          </p>

          {error && (
            <Alert tone="danger" className="mt-3">
              {error}
            </Alert>
          )}

          <form onSubmit={handleVerifyOtp} className="mt-4 space-y-3">
            <Field label="Kode OTP" htmlFor="otp">
              <Input
                id="otp"
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                className="text-center text-lg font-mono tracking-[0.5em]"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
            </Field>
            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full mt-4!"
            >
              {loading ? "Memverifikasi..." : "Verifikasi OTP"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-muted">
            Belum menerima kode?{" "}
            <button
              type="button"
              onClick={() => handleSendEmail()}
              className="font-semibold text-navy-900 hover:underline"
            >
              Kirim ulang
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-control bg-navy-900/5 ring-1 ring-navy-900/10">
            <Lock className="h-5 w-5 text-navy-900" />
          </div>
          <h1 className="type-page text-navy-900">Buat Sandi Baru</h1>
          <p className="body-copy mt-1 text-muted">
            Pastikan sandi baru Anda kuat dan mudah diingat.
          </p>

          {error && (
            <Alert tone="danger" className="mt-3">
              {error}
            </Alert>
          )}

          <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
            <Field label="Sandi Baru" htmlFor="password" hint="Min. 8 karakter">
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                placeholder="Buat sandi baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Field label="Konfirmasi Sandi" htmlFor="confirmPassword">
              <Input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                placeholder="Ulangi sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>

            <Button type="submit" disabled={loading} className="w-full mt-4!">
              {loading ? "Menyimpan..." : "Simpan Sandi Baru"}{" "}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}

      {step === 4 && (
        <div className="py-4 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="type-page text-navy-900">Sandi Berhasil Diubah!</h1>
          <p className="body-copy mt-1 text-muted">
            Sandi akun Anda telah berhasil diperbarui. Silakan masuk kembali
            dengan sandi baru Anda.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-control bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            Masuk ke Akun
          </Link>
        </div>
      )}

      {step !== 4 && (
        <p className="mt-5 text-center text-xs text-muted sm:text-sm">
          Ingat sandi Anda?{" "}
          <Link
            href="/login"
            className="font-semibold text-navy-900 hover:underline"
          >
            Masuk
          </Link>
        </p>
      )}
    </div>
  );
}
