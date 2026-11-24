"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Building2, FileText, ShieldCheck, Users } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { StatTile } from "@/components/ui/stat-tile";
import { organizerStatusMeta } from "@/lib/constants";
import { getApiErrorMessage } from "@/lib/api";
import { formatDate, formatRupiah } from "@/lib/utils";
import {
  getOrganizersList,
  rejectOrganizer,
  verifyOrganizer,
} from "@/services/adminServices";

const statusFilters = [
  { value: "", label: "Semua" },
  { value: "pending", label: "Menunggu" },
  { value: "verified", label: "Terverifikasi" },
  { value: "rejected", label: "Ditolak" },
  { value: "suspended", label: "Ditangguhkan" },
];

export default function AdminOrganizersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; saved?: string }>;
}) {
  const { status = "", q = "", saved } = use(searchParams);
  const router = useRouter();
  const [organizers, setOrganizers] = useState<Awaited<ReturnType<typeof getOrganizersList>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    getOrganizersList()
      .then((data) => {
        if (!active) return;
        setOrganizers(data);
        setErrorMsg("");
      })
      .catch(() => {
        if (!active) return;
        setOrganizers([]);
        setErrorMsg("Gagal memuat data admin");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleDecision(id: string, decision: "verified" | "rejected") {
    setErrorMsg("");
    try {
      if (decision === "verified") {
        await verifyOrganizer(id);
      } else {
        const reason = window.prompt("Alasan penolakan organizer:");
        if (reason === null || !reason.trim()) return;
        await rejectOrganizer(id, reason.trim());
      }
      setOrganizers((current) =>
        current.map((item) => (item.id === id ? { ...item, status: decision } : item)),
      );
      router.refresh();
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Gagal menyimpan keputusan verifikasi."));
    }
  }

  const needle = q.trim().toLowerCase();
  const filtered = organizers.filter((organizer) => {
    const matchStatus = !status || organizer.status === status;
    const matchQuery =
      !needle ||
      organizer.name.toLowerCase().includes(needle) ||
      organizer.ownerName.toLowerCase().includes(needle) ||
      organizer.city.toLowerCase().includes(needle) ||
      organizer.email.toLowerCase().includes(needle);
    return matchStatus && matchQuery;
  });

  const pending = organizers.filter((organizer) => organizer.status === "pending");
  const verified = organizers.filter((organizer) => organizer.status === "verified");
  const totalRevenue = organizers.reduce((total, organizer) => total + organizer.revenue, 0);

  return (
    <main>
      {isLoading && (
        <Alert tone="info" className="mb-4">
          Memuat data...
        </Alert>
      )}
      {errorMsg && (
        <Alert tone="danger" className="mb-4">
          {errorMsg}
        </Alert>
      )}

      <PageHeader
        kicker="Kepatuhan"
        title="Verifikasi organizer"
        subtitle="Tinjau dokumen dan setujui Event Organizer sebelum mereka menjual tiket."
      />

      {saved && (
        <Alert tone="success" className="mb-4">
          Keputusan verifikasi organizer berhasil disimpan.
        </Alert>
      )}

      <div className="stat-grid mb-6">
        <StatTile
          label="Total organizer"
          value={organizers.length}
          hint="Terdaftar di platform"
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatTile
          label="Menunggu verifikasi"
          value={pending.length}
          hint="Perlu ditinjau"
          tone="gold"
          icon={<BadgeCheck className="h-4 w-4" />}
        />
        <StatTile
          label="Terverifikasi"
          value={verified.length}
          hint="Boleh menjual tiket"
          tone="green"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatTile label="Total GMV EO" value={formatRupiah(totalRevenue)} hint="Akumulasi" tone="blue" />
      </div>

      <FilterBar
        className="mb-4"
        chips={statusFilters.map((filter) => ({
          label: filter.label,
          href: `/admin/organizers${filter.value ? `?status=${filter.value}` : ""}`,
          active: status === filter.value,
        }))}
        searchPlaceholder="Nama, owner, kota..."
        defaultValue={q}
        hidden={{ status }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="Organizer tidak ditemukan"
          description="Coba ubah filter status atau kata kunci pencarian."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((organizer) => (
            <Card key={organizer.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/organizers/${organizer.id}`}
                      className="type-subhead text-navy-900 transition hover:text-navy-700"
                    >
                      {organizer.name}
                    </Link>
                    <StatusBadge value={organizer.status} map={organizerStatusMeta} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    <span>Owner: {organizer.ownerName}</span>
                    <span>{organizer.city}</span>
                    <span>Bergabung {formatDate(organizer.joinedAt, { dateStyle: "medium" })}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {organizer.documents.length} dokumen
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {organizer.members.length} anggota
                    </span>
                    <span>{organizer.events} event</span>
                    <span>
                      <Price value={organizer.revenue} /> GMV
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ButtonLink
                    href={`/admin/organizers/${organizer.id}`}
                    variant="outline"
                    size="sm"
                  >
                    Review dokumen
                  </ButtonLink>
                  {organizer.status === "pending" && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleDecision(organizer.id, "verified")}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> Setujui
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleDecision(organizer.id, "rejected")}
                      >
                        Tolak
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
