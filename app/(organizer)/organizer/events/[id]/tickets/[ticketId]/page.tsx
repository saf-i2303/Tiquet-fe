"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { notFound, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Price } from "@/components/ui/price";
import { Progress } from "@/components/ui/progress";
import { SummaryRow } from "@/components/ui/summary-row";
import { ApiError, getApiErrorMessage } from "@/lib/api";
import { toDateTimeInput } from "@/lib/utils";
import {
  deleteTicket,
  getOrganizerTicket,
  updateTicket,
  type TicketTypeRecord,
  type UpdateTicketPayload,
} from "@/services/ticketServices";

export default function OrganizerTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string; ticketId: string }>;
}) {
  const { id, ticketId } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketTypeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [missing, setMissing] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    getOrganizerTicket(id, ticketId)
      .then((data) => {
        if (!active) return;
        setTicket(data);
        setErrorMsg("");
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 404) {
          setMissing(true);
          return;
        }
        setErrorMsg(getApiErrorMessage(error, "Gagal memuat data tiket."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, ticketId]);

  if (missing) notFound();

  async function handleUpdate(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const formData = new FormData(formEvent.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const price = Number(formData.get("price"));
    const totalQuota = Number(formData.get("total_quota"));
    const saleStart = String(formData.get("sale_start") ?? "");
    const saleEnd = String(formData.get("sale_end") ?? "");

    if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(totalQuota) || totalQuota <= 0) {
      setErrorMsg("Nama, harga, dan kuota wajib diisi dengan benar.");
      return;
    }
    if (!saleStart || !saleEnd || new Date(saleEnd) <= new Date(saleStart)) {
      setErrorMsg("Periode penjualan tidak valid.");
      return;
    }

    const payload: UpdateTicketPayload = {
      name,
      description: String(formData.get("description") ?? ""),
      price,
      total_quota: totalQuota,
      sale_start: new Date(saleStart).toISOString(),
      sale_end: new Date(saleEnd).toISOString(),
      is_active: formData.get("is_active") === "on",
    };
    const maxPerOrder = String(formData.get("max_per_order") ?? "").trim();
    const sortOrder = String(formData.get("sort_order") ?? "").trim();
    if (maxPerOrder) payload.max_per_order = Number(maxPerOrder);
    if (sortOrder) payload.sort_order = Number(sortOrder);

    try {
      const updated = await updateTicket(id, ticketId, payload);
      setTicket(updated);
      setSavedLocally(true);
      setErrorMsg("");
      router.refresh();
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Gagal menyimpan perubahan tiket."));
    }
  }

  async function handleDelete() {
    if (!window.confirm("Hapus kategori tiket ini? Tindakan ini tidak bisa dibatalkan.")) return;
    setIsDeleting(true);
    setErrorMsg("");
    try {
      await deleteTicket(id, ticketId);
      router.push(`/organizer/events/${id}/tickets`);
      router.refresh();
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Gagal menghapus kategori tiket."));
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <main>
        <Alert tone="info" className="mb-4">Memuat kategori tiket...</Alert>
      </main>
    );
  }
  if (!ticket) {
    return (
      <main>
        <Alert tone="danger" className="mb-4">
          {errorMsg || "Data kategori tiket tidak ditemukan."}
        </Alert>
      </main>
    );
  }

  const sold = ticket.sold ?? 0;
  const reserved = ticket.reserved ?? 0;
  const canDelete = sold === 0 && reserved === 0;

  return (
    <main>
      <BackLink href={`/organizer/events/${id}/tickets`} label="Kembali ke kategori tiket" />

      <PageHeader
        kicker="Kategori tiket"
        title={ticket.name}
        subtitle="Lihat detail kuota dan perbarui informasi kategori tiket."
        className="mt-4"
      />

      {savedLocally && (
        <Alert tone="success" className="mb-5">Perubahan tiket berhasil disimpan.</Alert>
      )}
      {errorMsg && (
        <Alert tone="danger" className="mb-5">{errorMsg}</Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5">
          <CardHeader title="Edit kategori tiket" />
          <form onSubmit={handleUpdate} className="mt-3 space-y-4">
            <Field label="Nama kategori" htmlFor="ticket-name">
              <Input id="ticket-name" name="name" required defaultValue={ticket.name} />
            </Field>
            <Field label="Deskripsi" htmlFor="ticket-description">
              <Textarea
                id="ticket-description"
                name="description"
                rows={3}
                defaultValue={ticket.description ?? ""}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Harga (Rp)" htmlFor="ticket-price">
                <Input
                  id="ticket-price"
                  name="price"
                  type="number"
                  min={0}
                  required
                  defaultValue={ticket.price}
                />
              </Field>
              <Field label="Total kuota" htmlFor="ticket-quota">
                <Input
                  id="ticket-quota"
                  name="total_quota"
                  type="number"
                  min={1}
                  required
                  defaultValue={ticket.total_quota ?? 0}
                />
              </Field>
              <Field label="Mulai penjualan" htmlFor="ticket-sale-start">
                <Input
                  id="ticket-sale-start"
                  name="sale_start"
                  type="datetime-local"
                  required
                  defaultValue={toDateTimeInput(ticket.sale_start)}
                />
              </Field>
              <Field label="Akhir penjualan" htmlFor="ticket-sale-end">
                <Input
                  id="ticket-sale-end"
                  name="sale_end"
                  type="datetime-local"
                  required
                  defaultValue={toDateTimeInput(ticket.sale_end)}
                />
              </Field>
              <Field label="Maks. per order" htmlFor="ticket-max-order">
                <Input
                  id="ticket-max-order"
                  name="max_per_order"
                  type="number"
                  min={1}
                  defaultValue={ticket.max_per_order ?? ""}
                />
              </Field>
              <Field label="Urutan tampil" htmlFor="ticket-sort-order">
                <Input
                  id="ticket-sort-order"
                  name="sort_order"
                  type="number"
                  defaultValue={ticket.sort_order ?? ""}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-navy-900">
              <Checkbox name="is_active" defaultChecked={ticket.is_active ?? true} />
              Kategori aktif dijual
            </label>
            <div className="flex justify-end">
              <Button type="submit" variant="navy">Simpan perubahan</Button>
            </div>
          </form>
        </Card>

        <aside className="h-fit space-y-4">
          <Card className="p-5">
            <CardHeader title="Ringkasan kuota" />
            <div className="mt-3">
              <Progress value={sold} total={ticket.total_quota ?? 0} label={ticket.name} />
            </div>
            <div className="mt-4 space-y-2">
              <SummaryRow label="Harga"><Price value={ticket.price} /></SummaryRow>
              <SummaryRow label="Terjual">{sold.toLocaleString("id-ID")}</SummaryRow>
              <SummaryRow label="Direservasi">{reserved.toLocaleString("id-ID")}</SummaryRow>
              <SummaryRow label="Tersedia">
                {(ticket.available ?? (ticket.total_quota ?? 0) - sold - reserved).toLocaleString("id-ID")}
              </SummaryRow>
              <SummaryRow label="Status penjualan">{ticket.sale_status ?? "—"}</SummaryRow>
            </div>
          </Card>

          {canDelete && (
            <Card className="p-5">
              <CardHeader title="Zona berbahaya" />
              <p className="mt-2 text-xs text-muted">
                Kategori bisa dihapus hanya jika belum ada tiket terjual atau tersimpan.
              </p>
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="mt-3"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus kategori
              </Button>
            </Card>
          )}
        </aside>
      </div>
    </main>
  );
}
