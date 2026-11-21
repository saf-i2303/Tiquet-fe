import type { Payment, PaymentMethod } from "@/types/payment";

/**
 * Metode pembayaran dan transaksi belum tersedia di backend. Kembalikan
 * nilai kosong bertipe; tidak ada request ke endpoint yang belum ada.
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return [];
}

export function getPaymentMethodById(_id: string): PaymentMethod | undefined {
  return undefined;
}

export async function getPaymentByOrderId(_orderId: string): Promise<Payment | undefined> {
  return undefined;
}
