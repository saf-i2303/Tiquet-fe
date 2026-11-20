import type { Metadata } from "next";
import { Ban, Check, ShieldCheck, UserCog, Users } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { TableShell } from "@/components/ui/table-shell";
import { toggleUserStatusAction } from "@/lib/actions/admin.action";
import { roleFilters, roleMeta, userStatusMeta } from "@/lib/constants";
import { requireRole } from "@/lib/guards";
import { formatDate } from "@/lib/utils";
import { getUsers } from "@/services/admin.service";

export const metadata: Metadata = {
  title: "Kelola Pengguna",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string; saved?: string }>;
}) {
  await requireRole("super_admin", "/admin/users");
  const { role = "", q = "", saved } = await searchParams;
  const users = await getUsers();

  const needle = q.trim().toLowerCase();
  const filtered = users.filter((user) => {
    const matchRole = !role || user.role === role;
    const matchQuery =
      !needle ||
      user.name.toLowerCase().includes(needle) ||
      user.email.toLowerCase().includes(needle) ||
      user.city.toLowerCase().includes(needle);
    return matchRole && matchQuery;
  });

  const suspended = users.filter((user) => user.status === "suspended").length;
  const organizers = users.filter((user) => user.role === "organizer").length;

  return (
    <main>
      <PageHeader
        kicker="Manajemen pengguna"
        title="Pengguna platform"
        subtitle="Kelola akun customer, organizer, gate staff, dan admin."
      />

      {saved && (
        <Alert tone="success" className="mb-4">
          Status pengguna berhasil diperbarui.
        </Alert>
      )}

      <div className="stat-grid mb-6">
        <StatTile
          label="Total pengguna"
          value={users.length}
          hint="Semua role"
          icon={<Users className="h-4 w-4" />}
        />
        <StatTile
          label="Organizer"
          value={organizers}
          hint="Akun EO"
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="gold"
        />
        <StatTile
          label="Gate staff"
          value={users.filter((user) => user.role === "gate_staff").length}
          hint="Petugas venue"
          icon={<UserCog className="h-4 w-4" />}
          tone="blue"
        />
        <StatTile
          label="Ditangguhkan"
          value={suspended}
          hint="Akses dibatasi"
          icon={<Ban className="h-4 w-4" />}
        />
      </div>

      <FilterBar
        className="mb-4"
        chips={roleFilters.map((filter) => ({
          label: filter.label,
          href: `/admin/users${filter.value ? `?role=${filter.value}` : ""}`,
          active: role === filter.value,
        }))}
        searchPlaceholder="Nama, email, kota..."
        defaultValue={q}
        hidden={{ role }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Pengguna tidak ditemukan"
          description="Coba ubah filter role atau kata kunci pencarian."
        />
      ) : (
        <Card className="overflow-hidden">
          <TableShell>
            <table className="w-full min-w-[860px]">
              <thead className="bg-surface">
                <tr>
                  <th className="th">Pengguna</th>
                  <th className="th">Role</th>
                  <th className="th">Kota</th>
                  <th className="th">Bergabung</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div className="min-w-0">
                          <div className="font-semibold text-navy-900">{user.name}</div>
                          <div className="text-xs text-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <StatusBadge value={user.role} map={roleMeta} />
                    </td>
                    <td className="td text-sm">{user.city}</td>
                    <td className="td text-xs text-muted">
                      {formatDate(user.joinedAt, { dateStyle: "medium" })}
                    </td>
                    <td className="td">
                      <StatusBadge value={user.status} map={userStatusMeta} />
                    </td>
                    <td className="td">
                      <div className="flex justify-end gap-2">
                        <ButtonLink
                          href={`/admin/users/${user.id}`}
                          variant="outline"
                          size="sm"
                        >
                          Detail
                        </ButtonLink>
                        {user.role !== "super_admin" && (
                          <form action={toggleUserStatusAction}>
                            <input type="hidden" name="userId" value={user.id} />
                            <Button
                              size="sm"
                              variant={user.status === "active" ? "danger" : "outline"}
                            >
                              {user.status === "active" ? (
                                <>
                                  <Ban className="h-3.5 w-3.5" /> Suspend
                                </>
                              ) : (
                                <>
                                  <Check className="h-3.5 w-3.5" /> Aktifkan
                                </>
                              )}
                            </Button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </Card>
      )}
    </main>
  );
}
