import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/register-form";
import { redirectIfAuthenticated } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Daftar gratis sebagai customer atau event organizer di Tiquet.",
};

export default async function RegisterPage() {
  await redirectIfAuthenticated();

  return <RegisterForm />;
}