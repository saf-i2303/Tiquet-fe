import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Pengguna",
};

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
