"use client";

import { useEffect, useState } from "react";

/**
 * Menghitung sisa waktu menuju `target` dan mengembalikannya dalam format HH:MM:SS.
 * Mengembalikan "--:--:--" sampai komponen ter-mount agar aman saat SSR.
 */
export function useCountdown(target: string): string {
  const [display, setDisplay] = useState("--:--:--");

  useEffect(() => {
    const update = () => setDisplay(formatRemaining(target));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [target]);

  return display;
}

export function formatRemaining(target: string): string {
  const diff = new Date(target).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) return "00:00:00";

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}
