export type OrganizerStatus = "pending" | "verified" | "rejected" | "suspended";

export type OrganizerDocumentStatus = "pending" | "approved" | "rejected";

export interface OrganizerDocument {
  id: string;
  type: string;
  name: string;
  uploadedAt: string;
  status: OrganizerDocumentStatus;
}

export type OrganizerMemberRole = "owner" | "manager" | "staff" | "gate_staff";
export type OrganizerMemberStatus = "active" | "invited";

export interface OrganizerMember {
  id: string;
  name: string;
  email: string;
  role: OrganizerMemberRole;
  status: OrganizerMemberStatus;
  assignedEvents?: string[];
}

export interface Organizer {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  description: string;
  status: OrganizerStatus;
  joinedAt: string;
  verifiedAt?: string;
  documents: OrganizerDocument[];
  members: OrganizerMember[];
  events: number;
  revenue: number;
}

export interface OrganizerPayout {
  id: string;
  organizerId: string;
  period: string;
  amount: number;
  fee: number;
  net: number;
  status: "pending" | "processing" | "paid";
  requestedAt: string;
  paidAt?: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  orderId: string;
  status: "checked_in" | "not_checked_in";
  checkedInAt?: string;
}
