import { checkIns } from "@/lib/mocks/checkins";
import type { CheckIn } from "@/types/checkin";

export async function getCheckIns(eventId?: string): Promise<CheckIn[]> {
  const list = eventId ? checkIns.filter((checkIn) => checkIn.eventId === eventId) : checkIns;
  return [...list].sort((a, b) => b.at.localeCompare(a.at));
}

export async function getCheckInSummary(eventId?: string) {
  const list = await getCheckIns(eventId);
  return {
    valid: list.filter((checkIn) => checkIn.result === "valid").length,
    duplicate: list.filter((checkIn) => checkIn.result === "duplicate").length,
    invalid: list.filter((checkIn) => checkIn.result === "invalid").length,
    total: list.length,
  };
}
