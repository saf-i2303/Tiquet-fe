import type { Refund } from "@/types/refund";

/** Endpoint refund/admin belum tersedia; kembalikan data kosong bertipe. */
export async function getRefunds(): Promise<Refund[]> {
  return [];
}

export async function getRefundById(_id: string): Promise<Refund | undefined> {
  return undefined;
}

export async function getRefundStats() {
  return {
    total: 0,
    requested: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
  };
}
