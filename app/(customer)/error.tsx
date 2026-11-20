"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function CustomerError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="page-container py-16">
      <EmptyState
        title="Halaman tidak dapat dimuat"
        description="Coba muat ulang halaman. Jika masalah berlanjut, kembali ke daftar event."
        action={
          <Button type="button" onClick={reset}>
            Coba lagi
          </Button>
        }
      />
    </main>
  );
}
