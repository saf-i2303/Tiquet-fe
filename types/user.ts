export type Role = "customer" | "organizer" | "gate_staff" | "super_admin";

export type UserStatus = "active" | "suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: Role;
  status: UserStatus;
  joinedAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role: Role;
  /** Role dari JWT backend; dipakai untuk redirect/authorization UX. */
  roles?: Role[];
  organizerId?: string;
}
