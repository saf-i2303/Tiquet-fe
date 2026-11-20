import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";
import { redirectIfAuthenticated } from "@/lib/guards";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun untuk mengelola tiket dan pesanan Anda.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  await redirectIfAuthenticated();
  const { next } = await searchParams;

  return <LoginForm next={next} />;
}
