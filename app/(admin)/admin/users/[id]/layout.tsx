import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Pengguna",
};

export default function UserDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
