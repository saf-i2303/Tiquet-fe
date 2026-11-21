import type { CheckIn } from "@/types/checkin";

/** Endpoint check-in belum tersedia; kembalikan data kosong bertipe. */
export async function getCheckIns(_eventId?: string): Promise<CheckIn[]> {
  return [];
}

export async function getCheckInSummary(_eventId?: string) {
  return {
    valid: 0,
    duplicate: 0,
    invalid: 0,
    total: 0,
  };
}
