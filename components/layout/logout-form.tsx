"use client";

import { useRouter } from "next/navigation";
import { logoutSessionRequest } from "@/services/authServices";
import { useState, type FormEvent, type ReactNode } from "react";

interface LogoutFormProps {
  children: ReactNode;
  className?: string;
  /** Dipanggil setelah request logout selesai, sebelum navigasi. */
  onComplete?: () => void;
}

export function LogoutForm({
  children,
  className,
  onComplete,
}: LogoutFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    try {
      await logoutSessionRequest();
      // Tutup dropdown di sini, bukan di onClick: form harus tetap terpasang
      // sampai request logout selesai agar submit tidak gugur.
      onComplete?.();
      router.replace("/");
      router.refresh();
    } catch {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
