"use client";

import { useEffect, useState } from "react";
import { checkHealth } from "@/services/healthServices";

const POLL_INTERVAL_MS = 30_000;
const HEALTH_TIMEOUT_MS = 5_000;
const FAILURES_BEFORE_OFFLINE = 2;

/**
 * Status konektivitas backend. Dipakai banner global di root layout.
 * Default online agar tidak menampilkan peringatan saat pengecekan awal.
 *
 * Banner hanya muncul setelah beberapa kegagalan berturut-turut supaya
 * gangguan sesaat (CORS, DB restart, dll.) tidak memicu peringatan palsu.
 */
export function useHealthCheck() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let active = true;
    let failures = 0;
    let controller: AbortController | null = null;

    async function run() {
      // Timeout menjamin request lama selesai sebelum poll berikutnya (30s).
      controller = new AbortController();
      const currentController = controller;
      const timeout = window.setTimeout(
        () => currentController.abort(),
        HEALTH_TIMEOUT_MS,
      );

      try {
        await checkHealth(currentController.signal);
        failures = 0;
        if (active) setIsOnline(true);
      } catch (error) {
        if (!active) return;
        failures += 1;
        if (process.env.NODE_ENV !== "production") {
          const reason = error instanceof Error ? error.message : String(error);
          console.warn(
            `[health] pengecekan gagal (${failures}/${FAILURES_BEFORE_OFFLINE}): ${reason}`,
          );
        }
        if (active && failures >= FAILURES_BEFORE_OFFLINE) {
          setIsOnline(false);
        }
      } finally {
        window.clearTimeout(timeout);
        if (active) setIsChecking(false);
      }
    }

    void run();
    const timer = window.setInterval(run, POLL_INTERVAL_MS);

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
    };
  }, []);

  return { isOnline, isChecking };
}
