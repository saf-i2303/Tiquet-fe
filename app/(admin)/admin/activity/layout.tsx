import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Aktivitas",
};

export default function ActivityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
