"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { categoryMeta, cities } from "@/lib/constants";
import { getUserFromStorage } from "@/lib/api";
import { requireOrganizerId } from "@/lib/ownership";
import { saveEvent } from "@/services/eventServices";
import { toDateTimeInput } from "@/lib/utils";
import type { Event, EventWithStats } from "@/types/event";

export function EventForm({
  event,
  onSaved,
}: {
  event?: EventWithStats;
  onSaved?: () => void;
}) {
  const router = useRouter();

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const data = new FormData(formEvent.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const venue = String(data.get("venue") ?? "").trim();
    const date = String(data.get("date") ?? "").trim();

    if (!title || !venue || !date) {
      window.alert("Nama event, venue, dan tanggal wajib diisi.");
      return;
    }

    const user = getUserFromStorage();
    if (!user) {
      window.alert("Sesi berakhir. Silakan masuk kembali.");
      return;
    }

    try {
      await saveEvent({
        id: event?.id,
        organizerId: requireOrganizerId(user),
        organizerName: user.name,
        title,
        category: String(data.get("category") ?? "music") as Event["category"],
        city: String(data.get("city") ?? "Jakarta"),
        venue,
        address: String(data.get("address") ?? ""),
        date,
        endDate: String(data.get("endDate") ?? "") || undefined,
        description: String(data.get("description") ?? ""),
        status: String(data.get("status") ?? "draft") as Event["status"],
      });
      onSaved?.();
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Gagal menyimpan event.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {event && <input type="hidden" name="id" value={event.id} />}

      <Card className="space-y-5 p-5 sm:p-6">
        <CardHeader title="Informasi utama" description="Detail dasar yang tampil di halaman event." />

        <Field label="Nama event" htmlFor="title">
          <Input
            id="title"
            name="title"
            required
            defaultValue={event?.title}
            placeholder="Contoh: Neon Nights Festival 2026"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategori" htmlFor="category">
            <Select
              id="category"
              name="category"
              defaultValue={event?.category ?? "music"}
            >
              {Object.entries(categoryMeta).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Kota" htmlFor="city">
            <Select id="city" name="city" defaultValue={event?.city ?? "Jakarta"}>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Venue" htmlFor="venue">
            <Input
              id="venue"
              name="venue"
              required
              defaultValue={event?.venue}
              placeholder="Nama venue"
            />
          </Field>

          <Field
            label="Alamat lengkap"
            htmlFor="address"
            hint="Membantu peserta menemukan lokasi event."
          >
            <Input
              id="address"
              name="address"
              defaultValue={event?.address}
              placeholder="Jl. ..."
            />
          </Field>
        </div>
      </Card>

      <Card className="space-y-5 p-5 sm:p-6">
        <CardHeader title={<>Jadwal &amp; deskripsi</>} description="Atur waktu tayang dan ceritakan acaranya." />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mulai" htmlFor="date">
            <Input
              id="date"
              name="date"
              type="datetime-local"
              required
              defaultValue={event ? toDateTimeInput(event.date) : ""}
            />
          </Field>

          <Field label="Selesai (opsional)" htmlFor="endDate">
            <Input
              id="endDate"
              name="endDate"
              type="datetime-local"
              defaultValue={event?.endDate ? toDateTimeInput(event.endDate) : ""}
            />
          </Field>
        </div>

        <Field
          label="Deskripsi event"
          htmlFor="description"
          hint="Ceritakan lineup, agenda, dan hal yang bikin event ini seru."
        >
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={event?.description}
            placeholder="Ceritakan lineup, agenda, dan hal yang bikin event ini seru."
          />
        </Field>
      </Card>

      <Card className="space-y-5 p-5 sm:p-6">
        <CardHeader title="Status publikasi" description="Tentukan kondisi event setelah disimpan." />
        <div className="grid gap-3 sm:grid-cols-2">
          {event?.status === "published" && (
            <label className="flex cursor-pointer items-start gap-3 rounded-control border border-line p-3 transition has-checked:border-navy-900/30 has-checked:bg-canvas">
              <input
                type="radio"
                name="status"
                value="published"
                defaultChecked
                className="mt-0.5 h-4 w-4 accent-gold-500"
              />
              <span>
                <span className="block text-sm font-semibold text-navy-900">Tetap tayang</span>
                <span className="block text-xs text-muted">
                  Perubahan langsung tampil tanpa moderasi ulang.
                </span>
              </span>
            </label>
          )}
          <label className="flex cursor-pointer items-start gap-3 rounded-control border border-line p-3 transition has-checked:border-navy-900/30 has-checked:bg-canvas">
            <input
              type="radio"
              name="status"
              value="draft"
              defaultChecked={!event || event.status === "draft"}
              className="mt-0.5 h-4 w-4 accent-gold-500"
            />
            <span>
              <span className="block text-sm font-semibold text-navy-900">
                Simpan sebagai draft
              </span>
              <span className="block text-xs text-muted">Bisa diedit kapan saja.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-control border border-line p-3 transition has-checked:border-navy-900/30 has-checked:bg-canvas">
            <input
              type="radio"
              name="status"
              value="pending"
              defaultChecked={event?.status === "pending" || event?.status === "rejected"}
              className="mt-0.5 h-4 w-4 accent-gold-500"
            />
            <span>
              <span className="block text-sm font-semibold text-navy-900">Ajukan moderasi</span>
              <span className="block text-xs text-muted">Super admin akan meninjau event.</span>
            </span>
          </label>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">
          <Save className="h-4 w-4" aria-hidden="true" /> Simpan event
        </Button>
      </div>
    </form>
  );
}
