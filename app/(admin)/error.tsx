"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="py-16">
      <EmptyState
        title="Data platform tidak dapat dimuat"
        description="Coba muat ulang halaman. Jika masalah berlanjut, hubungi administrator sistem."
        action={
          <Button type="button" onClick={reset}>
            Coba lagi
          </Button>
        }
      />
    </main>
  );
}
