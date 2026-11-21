import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Daftar gratis sebagai customer atau event organizer di Tiquet.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}