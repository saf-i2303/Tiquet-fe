"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { TableShell } from "@/components/ui/table-shell";
import { TableSkeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api";
import { createVenue, listVenues, type VenueRecord } from "@/services/venueServices";

export default function OrganizerVenuesPage() {
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [savedLocally, setSavedLocally] = useState(false);

  useEffect(() => {
    let active = true;
    listVenues()
      .then((data) => {
        if (!active) return;
        setVenues(data);
        setErrorMsg("");
      })
      .catch((error) => {
        if (!active) return;
        setVenues([]);
        setErrorMsg(getApiErrorMessage(error, "Gagal memuat data venue."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const formData = new FormData(formEvent.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const capacityRaw = String(formData.get("capacity") ?? "").trim();
    const capacity = capacityRaw ? Number(capacityRaw) : undefined;

    if (!name || !address || !city) {
      setErrorMsg("Nama, alamat, dan kota wajib diisi.");
      return;
    }
    if (capacity !== undefined && (!Number.isInteger(capacity) || capacity <= 0)) {
      setErrorMsg("Kapasitas harus berupa bilangan bulat positif.");
      return;
    }

    try {
      const created = await createVenue({
        name,
        address,
        city,
        ...(capacity !== undefined ? { capacity } : {}),
      });
      setVenues((current) => [created, ...current]);
      setSavedLocally(true);
      setErrorMsg("");
      formEvent.currentTarget.reset();
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Gagal menyimpan venue."));
    }
  }

  return (
    <main>
      <PageHeader
        kicker="Lokasi acara"
        title="Venue"
        subtitle="Kelola tempat event yang bisa dipakai saat membuat event baru."
      />

      {savedLocally && (
        <Alert tone="success" className="mb-5">Venue berhasil ditambahkan.</Alert>
      )}
      {errorMsg && (
        <Alert tone="danger" className="mb-5">{errorMsg}</Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <div className="p-5">
            <CardHeader
              title="Daftar venue"
              action={<span className="text-xs text-muted">{venues.length} lokasi</span>}
            />
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : venues.length === 0 ? (
            <div className="p-5 pt-0">
              <EmptyState
                icon={<MapPin className="h-6 w-6" />}
                title="Belum ada venue"
                description="Tambahkan lokasi event pertama menggunakan form di samping."
              />
            </div>
          ) : (
            <TableShell>
              <table className="w-full min-w-[640px]">
                <thead className="bg-surface">
                  <tr>
                    <th className="th">Nama</th>
                    <th className="th">Kota</th>
                    <th className="th">Kapasitas</th>
                    <th className="th">Alamat</th>
                    <th className="th">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue) => (
                    <tr key={venue.id} className="table-row">
                      <td className="td font-semibold text-navy-900">{venue.name}</td>
                      <td className="td text-sm">{venue.city}</td>
                      <td className="td text-sm">
                        {venue.capacity?.toLocaleString("id-ID") ?? "—"}
                      </td>
                      <td className="td max-w-xs truncate text-sm text-muted">
                        {venue.address}
                      </td>
                      <td className="td">
                        <Link
                          href={`/organizer/venues/${venue.id}`}
                          className="text-xs font-semibold text-navy-900 hover:underline"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </Card>

        <aside className="h-fit">
          <Card className="p-5">
            <CardHeader title="Tambah venue" />
            <form onSubmit={handleCreate} className="mt-3 space-y-4">
              <Field label="Nama venue" htmlFor="venue-name">
                <Input id="venue-name" name="name" required placeholder="Istora Senayan" />
              </Field>
              <Field label="Kota" htmlFor="venue-city">
                <Input id="venue-city" name="city" required placeholder="Jakarta" />
              </Field>
              <Field label="Alamat" htmlFor="venue-address">
                <Input
                  id="venue-address"
                  name="address"
                  required
                  placeholder="Jl. Pintu Satu Senayan"
                />
              </Field>
              <Field label="Kapasitas" htmlFor="venue-capacity" hint="Opsional">
                <Input
                  id="venue-capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  placeholder="7000"
                />
              </Field>
              <Button type="submit" variant="navy" className="w-full">
                Simpan venue
              </Button>
            </form>
          </Card>
        </aside>
      </div>
    </main>
  );
}
