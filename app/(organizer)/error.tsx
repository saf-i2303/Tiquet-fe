"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function OrganizerError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="py-16">
      <EmptyState
        title="Data dashboard tidak dapat dimuat"
        description="Coba muat ulang halaman. Jika masalah berlanjut, periksa koneksi Anda."
        action={
          <Button type="button" onClick={reset}>
            Coba lagi
          </Button>
        }
      />
    </main>
  );
}
