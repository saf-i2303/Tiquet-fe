import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Organizer",
};

export default function OrganizerDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
