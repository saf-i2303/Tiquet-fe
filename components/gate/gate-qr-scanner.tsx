"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import { Camera, RefreshCcw, ScanLine, ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ticketStatusMeta, type Tone } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import {
  DEMO_SCAN_TOKENS,
  mockVerifyTicketScan,
  recordLocalCheckIn,
  type TicketScanVerification,
} from "@/services/checkin.service";

type ScanPhase = "starting" | "scanning" | "verifying" | "done" | "error";

interface ScanResult {
  rawValue: string;
  scannedAt: string;
  verification?: TicketScanVerification;
}

function getCameraErrorMessage(error: unknown): string {
  const name =
    error && typeof error === "object" && "name" in error
      ? String((error as { name?: unknown }).name ?? "")
      : "";
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  if (name === "NotAllowedError" || /permission denied/i.test(message)) {
    return "Izin kamera ditolak. Izinkan akses kamera di browser lalu coba lagi.";
  }
  if (
    name === "NotFoundError" ||
    name === "OverconstrainedError" ||
    /no cameras|requested device not found/i.test(message)
  ) {
    return "Kamera belakang tidak ditemukan pada perangkat ini.";
  }
  if (name === "NotReadableError" || /could not start video|track start/i.test(message)) {
    return "Kamera sedang dipakai aplikasi lain atau tidak bisa dibaca.";
  }
  if (name === "SecurityError") {
    return "Akses kamera diblokir oleh kebijakan keamanan browser.";
  }
  return "Kamera tidak dapat diakses. Pastikan izin kamera diberikan dan halaman dibuka lewat HTTPS atau localhost.";
}

function getUnsupportedReason(): string | null {
  if (!window.isSecureContext) {
    return "Scanner kamera membutuhkan HTTPS atau localhost. Buka halaman ini di lingkungan aman.";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Browser ini tidak mendukung akses kamera (getUserMedia tidak tersedia).";
  }
  return null;
}

function formatScanTime(): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date());
}

export function GateQrScanner() {
  const reactId = useId();
  const scannerRegionId = `gate-qr-scanner-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { user } = useAuth();

  const [phase, setPhase] = useState<ScanPhase>("starting");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [restartKey, setRestartKey] = useState(0);

  /** Mencegah satu QR diproses dua kali oleh callback scan yang berulang. */
  const handledRef = useRef(false);
  const stopScannerRef = useRef<() => Promise<void>>(async () => {});
  const onScanRef = useRef<
    (rawValue: string, stopScanner: () => Promise<void>) => void
  >(() => {});

  const handleDecoded = useCallback(
    async (rawValue: string, stopScanner: () => Promise<void>) => {
      const token = rawValue.trim();
      if (!token) return;

      const scannedAt = formatScanTime();
      setScanResult({ rawValue: token, scannedAt });
      setCameraError(null);
      setVerificationError(null);
      setPhase("verifying");

      // Lepaskan kamera lebih dulu sebelum menunggu hasil verifikasi.
      await stopScanner();

      try {
        // PLACEHOLDER: ganti ke endpoint check-in backend saat tersedia.
        const verification = await mockVerifyTicketScan(token);
        // Simpan ke riwayat lokal agar dashboard gate staff bisa menampilkannya.
        recordLocalCheckIn(
          token,
          verification,
          user?.name ?? "Gate Staff",
          user?.id,
        );
        setScanResult((current) => ({
          rawValue: token,
          scannedAt: current?.scannedAt ?? scannedAt,
          verification,
        }));
        setPhase("done");
      } catch (error) {
        setVerificationError(
          error instanceof Error ? error.message : "Gagal memverifikasi tiket.",
        );
        setPhase("done");
      }
    },
    [user],
  );

  useEffect(() => {
    let disposed = false;
    let activeScanner: Html5Qrcode | null = null;
    let stopInFlight: Promise<void> | null = null;

    /** stop()/clear() aman dipanggil berulang (reset, unmount, atau scan sukses). */
    const dispose = (): Promise<void> => {
      disposed = true;
      const instance = activeScanner;
      if (!instance) return Promise.resolve();

      if (!stopInFlight) {
        stopInFlight = (async () => {
          try {
            // Bisa gagal bila scanner belum selesai start; diabaikan dengan aman.
            await instance.stop();
          } catch {
            // Kamera sudah berhenti atau sedang dalam transisi start.
          }
          try {
            instance.clear();
          } catch {
            // DOM sudah dibersihkan React saat unmount.
          }
        })().finally(() => {
          stopInFlight = null;
        });
      }
      return stopInFlight;
    };

    stopScannerRef.current = dispose;
    onScanRef.current = (rawValue, stopScanner) => {
      void handleDecoded(rawValue, stopScanner);
    };

    const startScanner = async () => {
      // Cek browser dilakukan setelah mount, bukan di synchronous effect body.
      await Promise.resolve();
      if (disposed) return;

      const unsupportedReason = getUnsupportedReason();
      if (unsupportedReason) {
        setCameraError(unsupportedReason);
        setPhase("error");
        return;
      }

      try {
        // Import dinamis: html5-qrcode hanya boleh jalan di browser.
        const { Html5Qrcode } = await import("html5-qrcode");
        if (disposed) return;

        activeScanner = new Html5Qrcode(scannerRegionId, { verbose: false });
        await activeScanner.start(
          // Prioritas kamera belakang; string facingMode = constraint "ideal",
          // sehingga tetap jalan di perangkat satu kamera.
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const edge = Math.max(
                120,
                Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.62),
              );
              return { width: edge, height: edge };
            },
          },
          (decodedText) => {
            if (disposed || handledRef.current) return;
            handledRef.current = true;
            onScanRef.current(decodedText, dispose);
          },
          undefined,
        );

        if (disposed) {
          await dispose();
          return;
        }
        setCameraError(null);
        setPhase("scanning");
      } catch (error) {
        if (disposed) return;
        await dispose();
        setCameraError(getCameraErrorMessage(error));
        setPhase("error");
      }
    };

    void startScanner();

    return () => {
      void dispose();
    };
  }, [restartKey, scannerRegionId, handleDecoded]);

  const handleReset = () => {
    handledRef.current = false;
    setScanResult(null);
    setCameraError(null);
    setVerificationError(null);
    setPhase("starting");
    setRestartKey((value) => value + 1);
  };

  const handleDemoToken = (token: string) => {
    if (phase === "verifying") return;
    handledRef.current = true;
    void handleDecoded(token, () => stopScannerRef.current());
  };

  const result = scanResult?.verification?.result;
  const resultTone: Tone =
    result === "valid" ? "green" : result === "duplicate" ? "amber" : result === "invalid" ? "red" : "blue";

  const phaseMeta: { label: string; tone: Tone } = (() => {
    if (phase === "verifying") return { label: "Memverifikasi", tone: "amber" };
    if (phase === "done" && result) {
      return {
        label: result === "valid" ? "Tiket valid" : result === "duplicate" ? "Duplikat" : "Tidak valid",
        tone: resultTone,
      };
    }
    if (phase === "error") return { label: "Perlu perhatian", tone: "red" };
    if (phase === "starting") return { label: "Menyiapkan", tone: "blue" };
    return { label: "Siap scan", tone: "blue" };
  })();

  const showCameraBlocked = phase === "error" && !scanResult;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <Card className="p-5">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-navy-600" /> Preview kamera
            </span>
          }
          description="Arahkan QR tiket ke area kamera. Scanner akan membaca otomatis dengan kamera belakang."
          action={
            <Badge tone={phaseMeta.tone}>{phaseMeta.label}</Badge>
          }
        />

        <div className="mt-4 overflow-hidden rounded-card border border-line bg-navy-950">
          <div className="relative mx-auto aspect-square max-h-[480px] w-full">
            {/* html5-qrcode menyuntikkan <video> ke elemen ini; tidak ada prop
                facingMode pada <video> buatan React. */}
            <div id={scannerRegionId} className="absolute inset-0 h-full w-full" />

            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="h-52 w-52 rounded-card border-2 border-gold-400/90 shadow-[0_0_0_9999px_rgba(2,6,23,0.28)] sm:h-64 sm:w-64" />
            </div>

            {showCameraBlocked ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-control bg-danger-soft text-danger">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-white">Kamera tidak tersedia</p>
                  <p className="text-sm text-blue-100/80">{cameraError}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={handleReset}>
            <RefreshCcw className="h-4 w-4" /> Reset scanner
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-navy-600" /> Hasil scan
            </span>
          }
          description="QR terbaca -> verifikasi tiket -> status check-in muncul di sini."
        />

        <div className="mt-4 space-y-4">
          {cameraError && !showCameraBlocked ? (
            <Alert tone="danger">{cameraError}</Alert>
          ) : null}
          {verificationError ? <Alert tone="danger">{verificationError}</Alert> : null}
          {phase === "verifying" ? (
            <Alert tone="info">Memverifikasi tiket ke data check-in...</Alert>
          ) : null}

          {scanResult ? (
            <div className="rounded-control border border-line bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-navy-900">Hasil verifikasi</p>
                {result ? (
                  <Badge tone={resultTone}>
                    {result === "valid" ? "Valid" : result === "duplicate" ? "Duplikat" : "Tidak valid"}
                  </Badge>
                ) : (
                  <Badge tone="blue">Memverifikasi</Badge>
                )}
              </div>

              {scanResult.verification ? (
                <>
                  <p className="mt-3 text-sm text-navy-800">
                    {scanResult.verification.message}
                  </p>
                  <p className="mt-3 break-all rounded-control bg-slate-50 px-3 py-2 font-mono text-xs text-navy-800">
                    {scanResult.rawValue}
                  </p>

                  {scanResult.verification.ticket ? (
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="min-w-0">
                        <dt className="text-xs text-muted">Event</dt>
                        <dd className="font-semibold text-navy-900">
                          {scanResult.verification.ticket.eventTitle}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted">Pemegang tiket</dt>
                        <dd className="truncate font-semibold text-navy-900">
                          {scanResult.verification.ticket.holderName}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted">Jenis tiket</dt>
                        <dd className="text-navy-900">
                          {scanResult.verification.ticket.ticketTypeName}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted">Status tiket</dt>
                        <dd className="mt-1">
                          <StatusBadge
                            value={scanResult.verification.ticket.status}
                            map={ticketStatusMeta}
                          />
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted">Gate</dt>
                        <dd className="text-navy-900">{scanResult.verification.gate}</dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted">Waktu check-in</dt>
                        <dd className="text-navy-900">
                          {formatDateTime(
                            scanResult.verification.ticket.checkedInAt ??
                              scanResult.verification.at,
                          )}
                        </dd>
                      </div>
                    </dl>
                  ) : null}
                </>
              ) : null}

              <p className="mt-4 text-xs text-muted">Waktu scan: {scanResult.scannedAt}</p>
            </div>
          ) : (
            <div className="rounded-control border border-dashed border-line bg-slate-50 p-4 text-sm text-muted">
              Belum ada QR yang terbaca. Arahkan kamera ke kode QR tiket.
            </div>
          )}

          <div className="rounded-control border border-line bg-slate-50 p-3">
            <p className="text-xs font-semibold text-navy-900">Coba tanpa kamera (mock)</p>
            <p className="mt-1 text-xs text-muted">
              Endpoint check-in belum tersedia; token contoh memakai fungsi verifikasi yang sama.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={phase === "verifying"}
                onClick={() => handleDemoToken(DEMO_SCAN_TOKENS.valid)}
              >
                Token valid
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={phase === "verifying"}
                onClick={() => handleDemoToken(DEMO_SCAN_TOKENS.duplicate)}
              >
                Token duplikat
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={phase === "verifying"}
                onClick={() => handleDemoToken(DEMO_SCAN_TOKENS.invalid)}
              >
                Token invalid
              </Button>
            </div>
          </div>

          <Alert tone="info">
            Scanner memakai <span className="font-semibold">html5-qrcode</span> dengan prioritas
            kamera belakang (<span className="font-mono">facingMode: environment</span>). Kamera
            dihentikan otomatis setelah QR terbaca dan saat komponen dilepas.
          </Alert>
        </div>
      </Card>
    </div>
  );
}
