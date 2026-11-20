import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { memberRoleLabel } from "@/lib/constants";
import { inviteMemberAction } from "@/lib/actions/organizer.action";

export function InviteMemberForm() {
  return (
    <form action={inviteMemberAction} className="space-y-6">
      <Card className="space-y-5 p-5 sm:p-6">
        <CardHeader
          title="Undang anggota tim"
          description="Tambahkan rekan untuk membantu mengelola event."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Nama" htmlFor="member-name">
            <Input id="member-name" name="name" required placeholder="Nama anggota" />
          </Field>

          <Field label="Email" htmlFor="member-email">
            <Input
              id="member-email"
              name="email"
              type="email"
              required
              placeholder="nama@email.com"
            />
          </Field>

          <Field label="Peran" htmlFor="member-role">
            <Select id="member-role" name="role" defaultValue="staff">
              {["manager", "staff", "gate_staff"].map((role) => (
                <option key={role} value={role}>
                  {memberRoleLabel[role] ?? role}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">
          <UserPlus className="h-4 w-4" aria-hidden="true" /> Kirim undangan
        </Button>
      </div>
    </form>
  );
}
