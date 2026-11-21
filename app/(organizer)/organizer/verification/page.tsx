"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, FileText, ShieldCheck, Upload } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  addOrganizerDocument,
  getOrganizer,
  listOrganizerDocuments,
  submitVerification,
  type OrganizerDocumentRecord,
} from "@/services/organizerServices";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { documentStatusMeta, organizerStatusMeta } from "@/lib/constants";
import { requireOrganizerId } from "@/lib/ownership";
import { formatDate } from "@/lib/utils";
import type { Organizer } from "@/types/organizer";

const docTypeByLabel: Record<string, OrganizerDocumentRecord["doc_type"]> = {
  "Akta Perusahaan": "akta",
  NPWP: "npwp",
  "KTP Owner": "ktp",
  "Izin Usaha": "nib",
  "Dokumen pendukung": "other",
};

export default function OrganizerVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; uploaded?: string; error?: string }>;
}) {
  const { submitted, uploaded, error } = use(searchParams);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [organizer, setOrganizer] = useState<Organizer | undefined>();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [submittedLocally, setSubmittedLocally] = useState(false);
  const [uploadedLocally, setUploadedLocally] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (isLoading || !user) return;
    let active = true;
    const organizerId = requireOrganizerId(user);

    getOrganizer(organizerId)
      .then((data) => {
        if (active) setOrganizer(data);
      })
      .catch(() => {
        if (active) setOrganizer(undefined);
      })
      .finally(() => {
        if (active) setIsDataLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isLoading, user]);

  if (isLoading || !user || isDataLoading) return null;

  function refetchOrganizer() {
    const organizerId = requireOrganizerId(user!);
    getOrganizer(organizerId)
      .then((data) => {
        if (data) setOrganizer(data);
      })
      .catch(() => undefined);
    router.refresh();
  }

  async function handleUpload(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const data = new FormData(formEvent.currentTarget);
    const file = data.get("file");
    const label = String(data.get("type") ?? "Akta Perusahaan");

    if (!(file instanceof File) || !file.name) {
      setLocalError("file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError("size");
      return;
    }

    try {
      await addOrganizerDocument({
        doc_type: docTypeByLabel[label] ?? "other",
        file_name: file.name,
      });
      setLocalError("");
      setUploadedLocally(true);
      refetchOrganizer();
    } catch (uploadError) {
      window.alert(
        uploadError instanceof Error ? uploadError.message : "Gagal mengunggah dokumen.",
      );
    }
  }

  async function handleSubmitVerification(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    try {
      const documents = await listOrganizerDocuments().catch(() => []);
      if (documents.length === 0) {
        setLocalError("documents");
        return;
      }
      await submitVerification();
      setLocalError("");
      setSubmittedLocally(true);
      refetchOrganizer();
    } catch (submitError) {
      window.alert(
        submitError instanceof Error ? submitError.message : "Gagal mengajukan verifikasi.",
      );
    }
  }

  if (!organizer) return <Alert tone="danger">Data organizer tidak ditemukan.</Alert>;

  const activeError = localError || error;

  return (
    <main>
      <PageHeader
        kicker="Kepatuhan"
        title="Verifikasi organizer"
        subtitle="Lengkapi dokumen agar event kamu bisa lolos moderasi dan tayang di marketplace."
      />

      {(submitted || submittedLocally) && (
        <Alert tone="success" className="mb-5">
          Pengajuan verifikasi berhasil dikirim. Tim kami meninjau maksimal 2 hari kerja.
        </Alert>
      )}
      {(uploaded || uploadedLocally) && (
        <Alert tone="success" className="mb-5">
          Dokumen berhasil diunggah dan menunggu peninjauan admin.
        </Alert>
      )}
      {activeError === "file" && (
        <Alert tone="danger" className="mb-5">
          Pilih file dokumen yang ingin diunggah terlebih dahulu.
        </Alert>
      )}
      {activeError === "size" && (
        <Alert tone="danger" className="mb-5">
          Ukuran file melebihi 5 MB. Kompres dokumen lalu coba lagi.
        </Alert>
      )}
      {activeError === "documents" && (
        <Alert tone="danger" className="mb-5">
          Unggah minimal satu dokumen sebelum mengajukan verifikasi.
        </Alert>
      )}
      {activeError === "not-found" && (
        <Alert tone="danger" className="mb-5">
          Data organizer tidak ditemukan.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5">
          <CardHeader
            title="Dokumen yang diunggah"
            action={<StatusBadge value={organizer.status} map={organizerStatusMeta} />}
          />

          <div className="mt-4 space-y-2">
            {organizer.documents.map((document) => (
              <div
                key={document.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-line p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-control bg-info-soft text-info">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-navy-900">{document.type}</div>
                    <div className="text-xs text-muted">
                      {document.name} · diunggah {formatDate(document.uploadedAt)}
                    </div>
                  </div>
                </div>
                <StatusBadge value={document.status} map={documentStatusMeta} />
              </div>
            ))}
          </div>

          <form
            onSubmit={handleUpload}
            className="mt-5 rounded-control border border-dashed border-line bg-surface p-4"
          >
            <SectionHeading
              as="h3"
              title="Tambah dokumen baru"
              titleClassName="type-label"
              className="mt-0"
            />
            <p className="mt-1 text-xs text-muted">
              Unggah akta perusahaan, NPWP, atau KTP owner. Format PDF/JPG maksimal 5 MB.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[200px_1fr_auto]">
              <Field label="Jenis dokumen" htmlFor="type">
                <Select id="type" name="type" defaultValue="Akta Perusahaan">
                  <option value="Akta Perusahaan">Akta Perusahaan</option>
                  <option value="NPWP">NPWP</option>
                  <option value="KTP Owner">KTP Owner</option>
                  <option value="Izin Usaha">Izin Usaha</option>
                  <option value="Dokumen pendukung">Dokumen pendukung</option>
                </Select>
              </Field>
              <Field label="File dokumen" htmlFor="file">
                <Input
                  id="file"
                  name="file"
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </Field>
              <div className="flex items-end">
                <Button type="submit" variant="outline" size="sm">
                  <Upload className="h-3.5 w-3.5" /> Unggah
                </Button>
              </div>
            </div>
          </form>
        </Card>

        <aside className="section-stack">
          <Card className="p-5">
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-navy-600" /> Kenapa perlu verifikasi?
                </span>
              }
            />
            <ul className="mt-3 space-y-2 text-sm text-navy-800">
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                Meningkatkan kepercayaan calon pembeli.
              </li>
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                Event bisa lolos moderasi dan tayang.
              </li>
              <li className="flex gap-2">
                <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                Pencairan dana lebih lancar.
              </li>
            </ul>
          </Card>

          <Card className="p-5">
            <form onSubmit={handleSubmitVerification}>
              <CardHeader title="Ajukan verifikasi" />
              <p className="mt-1 text-sm text-muted">
                Pastikan semua dokumen sudah benar. Pengajuan akan ditinjau oleh super admin.
              </p>
              <Button
                type="submit"
                size="sm"
                className="mt-3 w-full"
                disabled={organizer.status === "verified"}
              >
                {organizer.status === "verified" ? "Sudah terverifikasi" : "Kirim pengajuan"}
              </Button>
            </form>
          </Card>
        </aside>
      </div>
    </main>
  );
}
