"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { memberRoleLabel } from "@/lib/constants";
import { createStaff } from "@/services/organizerServices";

function generatePassword(): string {
  const bytes = new Uint8Array(12);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function InviteMemberForm({ onInvited }: { onInvited?: () => void }) {
  const router = useRouter();

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const data = new FormData(formEvent.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    if (!name || !email) {
      window.alert("Nama dan email anggota wajib diisi.");
      return;
    }

    try {
      await createStaff({
        email,
        password: generatePassword(),
        full_name: name,
      });
      onInvited?.();
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Gagal mengirim undangan.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
