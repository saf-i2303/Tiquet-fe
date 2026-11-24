"use client";

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/ui/page-header";

const GateQrScanner = dynamic(
  () => import("@/components/gate/gate-qr-scanner").then((mod) => mod.GateQrScanner),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-card border border-line bg-surface p-6 text-sm text-muted">
        Memuat scanner kamera...
      </div>
    ),
  },
);

export default function GateScanPage() {
  return (
    <>
      <PageHeader
        kicker="Gate Staff"
        title="Scan QR Tiket"
        subtitle="Validasi tiket customer di gate dengan memindai QR code secara langsung."
      />
      <GateQrScanner />
    </>
  );
}
