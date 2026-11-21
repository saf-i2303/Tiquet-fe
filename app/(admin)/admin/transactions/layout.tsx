import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transaksi Platform",
};

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
