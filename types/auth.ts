import type { Role } from "./user";

export interface LoginPayload {
  email: string;
  password: string;
  role: Role;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Extract<Role, "customer" | "organizer">;
}

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface ProfileFormState {
  error?: string;
  success?: string;
}
