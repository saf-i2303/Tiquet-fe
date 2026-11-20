import { organizers } from "@/lib/mocks/organizers";
import { mockCredentials, users } from "@/lib/mocks/users";
import type { LoginPayload, RegisterPayload } from "@/types/auth";
import type { Role, SessionUser } from "@/types/user";

const roleKey: Record<string, keyof typeof mockCredentials> = {
  customer: "customer",
  organizer: "organizer",
  super_admin: "super_admin",
  gate_staff: "gate_staff",
};

export async function mockLogin(payload: LoginPayload): Promise<SessionUser> {
  const key = roleKey[payload.role as Role] ?? "customer";
  const user = users.find((item) => item.id === mockCredentials[key]) ?? users[0];
  const organizer =
    payload.role === "organizer"
      ? organizers.find((item) => item.ownerName === user.name)
      : undefined;

  return {
    id: user.id,
    name: user.name,
    email: payload.email || user.email,
    phone: user.phone,
    city: user.city,
    role: payload.role,
    organizerId: organizer?.id,
  };
}

export async function mockRegister(payload: RegisterPayload): Promise<SessionUser> {
  return {
    id: `usr-${Date.now().toString().slice(-4)}`,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    city: "Jakarta",
    role: payload.role,
    organizerId: payload.role === "organizer" ? "org-001" : undefined,
  };
}
