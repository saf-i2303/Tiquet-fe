"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Ban, Check, Mail, MapPin, Phone, Receipt } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardHeader } from "@/components/ui/card";
import { DetailHeader } from "@/components/ui/detail-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { StatTile } from "@/components/ui/stat-tile";
import { SummaryRow } from "@/components/ui/summary-row";
import { TableShell } from "@/components/ui/table-shell";
import { orderStatusMeta, roleMeta, userStatusMeta } from "@/lib/constants";
import { formatDate, formatDateTime, formatRupiah } from "@/lib/utils";
import {
  getAllOrders,
  getOrganizersList,
  getUserById,
} from "@/services/adminServices";

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<Awaited<ReturnType<typeof getUserById>>>(undefined);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getAllOrders>>>([]);
  const [organizers, setOrganizers] = useState<
    Awaited<ReturnType<typeof getOrganizersList>>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getUserById(id), getAllOrders(), getOrganizersList()])
      .then(([nextUser, nextOrders, nextOrganizers]) => {
        if (!active) return;
        setUser(nextUser);
        setOrders(nextOrders);
        setOrganizers(nextOrganizers);
        setErrorMsg("");
      })
      .catch(() => {
        if (!active) return;
        setUser(undefined);
        setOrders([]);
        setOrganizers([]);
        setErrorMsg("Gagal memuat data admin");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <main>
        <Alert tone="info" className="mb-4">
          Memuat data...
        </Alert>
      </main>
    );
  }
  if (errorMsg) {
    return (
      <main>
        <Alert tone="danger" className="mb-4">
          {errorMsg}
        </Alert>
      </main>
    );
  }
  if (!user) notFound();

  const userOrders = orders.filter((order) => order.customerId === user.id);
  const paidOrders = userOrders.filter((order) => order.status === "paid");
  const spent = paidOrders.reduce((total, order) => total + order.total, 0);
  const linkedOrganizer = organizers.find(
    (organizer) => organizer.email === user.email || organizer.ownerName === user.name,
  );

  return (
    <main>
      <DetailHeader
        backHref="/admin/users"
        backLabel="Kembali ke daftar pengguna"
        title={user.name}
        subtitle={`ID ${user.id} · bergabung ${formatDate(user.joinedAt)}`}
        badge={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge value={user.role} map={roleMeta} />
            <StatusBadge value={user.status} map={userStatusMeta} />
          </span>
        }
        actions={
          user.role !== "super_admin" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                alert("Fitur belum tersedia");
              }}
            >
              <input type="hidden" name="userId" value={user.id} />
              <Button variant={user.status === "active" ? "danger" : "outline"}>
                {user.status === "active" ? (
                  <>
                    <Ban className="h-3.5 w-3.5" /> Suspend akun
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" /> Aktifkan akun
                  </>
                )}
              </Button>
            </form>
          ) : undefined
        }
      />

      {user.status === "suspended" && (
        <Alert tone="danger" className="mb-4">
          Akun ini sedang ditangguhkan. Pengguna tidak bisa login sampai diaktifkan kembali.
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <StatTile
          label="Total transaksi"
          value={userOrders.length}
          hint="Sebagai pembeli"
          icon={<Receipt className="h-4 w-4" />}
        />
        <StatTile
          label="Order lunas"
          value={paidOrders.length}
          hint="Pembayaran berhasil"
          tone="green"
        />
        <StatTile label="Total belanja" value={formatRupiah(spent)} hint="Dari order lunas" tone="gold" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="section-stack">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size="lg" />
              <div className="min-w-0">
                <div className="truncate font-semibold text-navy-900">{user.name}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <StatusBadge value={user.role} map={roleMeta} />
                  <StatusBadge value={user.status} map={userStatusMeta} />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <SummaryRow
                label={
                  <span className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-navy-600" /> Email
                  </span>
                }
              >
                <span className="block max-w-[12rem] truncate">{user.email}</span>
              </SummaryRow>
              <SummaryRow
                label={
                  <span className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-navy-600" /> Telepon
                  </span>
                }
              >
                {user.phone}
              </SummaryRow>
              <SummaryRow
                label={
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-navy-600" /> Kota
                  </span>
                }
              >
                {user.city}
              </SummaryRow>
            </div>
          </Card>

          {linkedOrganizer && (
            <Card className="p-5">
              <CardHeader title="Profil organizer" description={linkedOrganizer.name} />
              <ButtonLink
                href={`/admin/organizers/${linkedOrganizer.id}`}
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                Buka profil EO
              </ButtonLink>
            </Card>
          )}
        </aside>

        <Card className="overflow-hidden">
          <CardHeader
            title="Riwayat transaksi"
            className="p-4"
            action={<span className="text-xs text-muted">{userOrders.length} order</span>}
          />
          {userOrders.length === 0 ? (
            <EmptyState
              title="Pengguna ini belum pernah bertransaksi."
              className="m-4"
            />
          ) : (
            <TableShell>
              <table className="w-full min-w-[680px]">
                <thead className="bg-surface">
                  <tr>
                    <th className="th">Order</th>
                    <th className="th">Event</th>
                    <th className="th">Tanggal</th>
                    <th className="th">Total</th>
                    <th className="th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userOrders.map((order) => (
                    <tr key={order.id} className="table-row">
                      <td className="td font-mono text-xs">{order.id}</td>
                      <td className="td">
                        <div className="max-w-52 truncate text-sm">{order.eventTitle}</div>
                      </td>
                      <td className="td text-xs text-muted">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="td">
                        <Price value={order.total} />
                      </td>
                      <td className="td">
                        <StatusBadge value={order.status} map={orderStatusMeta} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </Card>
      </div>
    </main>
  );
}
