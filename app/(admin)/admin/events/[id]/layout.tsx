import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Event",
};

export default function EventDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
