import { requireRole } from "@/lib/guards";
import { getEventById } from "@/services/event.service";
import { getEventAttendees } from "@/services/organizer.service";

function escapeCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await requireRole("organizer");
  const organizerId = session.organizerId ?? "org-001";
  const { id } = await params;

  const event = await getEventById(id, { includeUnpublished: true });
  if (!event || event.organizerId !== organizerId) {
    return new Response("Event tidak ditemukan", { status: 404 });
  }

  const attendees = await getEventAttendees(event.id);

  const rows = [
    ["Nama", "Email", "Kategori Tiket", "Order", "Status", "Waktu Check-in"],
    ...attendees.map((attendee) => [
      attendee.name,
      attendee.email,
      attendee.ticketType,
      attendee.orderId,
      attendee.status === "checked_in" ? "Check-in" : "Belum check-in",
      attendee.checkedInAt ?? "",
    ]),
  ];

  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="peserta-${event.id}.csv"`,
    },
  });
}
