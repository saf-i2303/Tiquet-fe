"use client";

import { Alert } from "@/components/ui/alert";
import { useHealthCheck } from "@/hooks/use-health-check";

/** Banner kecil di atas halaman; fixed agar tidak menggeser layout existing. */
export function HealthBanner() {
  const { isOnline, isChecking } = useHealthCheck();

  if (isOnline || isChecking) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-2"
      role="status"
      aria-live="polite"
    >
      <Alert tone="warning" className="mx-auto max-w-3xl py-2 text-xs shadow-sm">
        Backend tidak dapat dihubungi. Beberapa data mungkin tidak tersedia.
      </Alert>
    </div>
  );
}
