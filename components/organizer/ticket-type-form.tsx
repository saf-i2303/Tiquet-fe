import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { saveTicketTypeAction } from "@/lib/actions/organizer.action";
import { toDateTimeInput } from "@/lib/utils";
import type { TicketType } from "@/types/event";

export function TicketTypeForm({
  eventId,
  ticket,
}: {
  eventId: string;
  ticket?: TicketType;
}) {
  return (
    <form action={saveTicketTypeAction} className="space-y-6">
      <input type="hidden" name="eventId" value={eventId} />
      {ticket && <input type="hidden" name="ticketTypeId" value={ticket.id} />}

      <Card className="space-y-5 p-5 sm:p-6">
        <CardHeader
          title={ticket ? `Edit kategori: ${ticket.name}` : "Tambah kategori tiket"}
          description="Atur harga, kuota, dan masa penjualan kategori ini."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama kategori" htmlFor="name">
            <Input
              id="name"
              name="name"
              required
              defaultValue={ticket?.name}
              placeholder="Regular / VIP / VVIP"
            />
          </Field>

          <Field label="Harga (Rp)" htmlFor="price">
            <Input
              id="price"
              name="price"
              type="number"
              min={1}
              step={1000}
              required
              defaultValue={ticket?.price}
              placeholder="250000"
            />
          </Field>

          <Field label="Kuota" htmlFor="quota">
            <Input
              id="quota"
              name="quota"
              type="number"
              min={1}
              required
              defaultValue={ticket?.quota}
              placeholder="500"
            />
          </Field>

          <Field label="Maks. per transaksi" htmlFor="maxPerOrder" hint="Maksimal 10 tiket per pesanan.">
            <Input
              id="maxPerOrder"
              name="maxPerOrder"
              type="number"
              min={1}
              max={10}
              defaultValue={ticket?.maxPerOrder ?? 4}
            />
          </Field>

          <Field label="Mulai penjualan" htmlFor="salesStart">
            <Input
              id="salesStart"
              name="salesStart"
              type="datetime-local"
              defaultValue={ticket ? toDateTimeInput(ticket.salesStart) : ""}
            />
          </Field>

          <Field label="Akhir penjualan" htmlFor="salesEnd">
            <Input
              id="salesEnd"
              name="salesEnd"
              type="datetime-local"
              defaultValue={ticket ? toDateTimeInput(ticket.salesEnd) : ""}
            />
          </Field>
        </div>

        <Field label="Deskripsi singkat" htmlFor="description">
          <Input
            id="description"
            name="description"
            defaultValue={ticket?.description}
            placeholder="Akses area festival dan standing zone."
          />
        </Field>

        <Field
          label="Benefit (pisahkan dengan koma)"
          htmlFor="benefits"
          hint="Contoh: Masuk area festival, Standing zone"
        >
          <Input
            id="benefits"
            name="benefits"
            defaultValue={ticket?.benefits.join(", ")}
            placeholder="Masuk area festival, Standing zone"
          />
        </Field>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">
          <Plus className="h-4 w-4" aria-hidden="true" /> {ticket ? "Simpan perubahan" : "Tambah kategori"}
        </Button>
      </div>
    </form>
  );
}
