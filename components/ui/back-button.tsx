"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackButton({
  href = "/",
  label = "Kembali",
  className,
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    // Kembali ke halaman sebelumnya jika ada riwayat, jika tidak ke `href`
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-control px-2 py-1.5 text-sm font-medium text-muted transition hover:bg-canvas hover:text-navy-900",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
