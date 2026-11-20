export type CheckInResult = "valid" | "duplicate" | "invalid";

export interface CheckIn {
  id: string;
  ticketId: string;
  eventId: string;
  eventTitle: string;
  holderName: string;
  gate: string;
  staffName: string;
  result: CheckInResult;
  at: string;
}
