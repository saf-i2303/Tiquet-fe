import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderasi Event",
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
