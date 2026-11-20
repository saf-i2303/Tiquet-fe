import { USE_MOCK, apiFetch } from "@/lib/api";
import { getPaymentMethod, paymentMethods } from "@/lib/mocks/payments";
import { orders } from "@/lib/mocks/orders";
import type { Payment, PaymentMethod } from "@/types/payment";

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  if (!USE_MOCK) {
    return apiFetch<PaymentMethod[]>("/payments/methods");
  }
  return paymentMethods;
}

export function getPaymentMethodById(id: string): PaymentMethod | undefined {
  return getPaymentMethod(id);
}

export async function getPaymentByOrderId(orderId: string): Promise<Payment | undefined> {
  const order = orders.find((item) => item.id === orderId);
  if (!order) return undefined;

  return {
    id: `PAY-${order.id}`,
    orderId: order.id,
    methodId: order.paymentMethod ? "pm-bca-va" : "pm-bca-va",
    methodName: order.paymentMethod ?? "BCA Virtual Account",
    status: order.status === "paid" ? "paid" : order.status === "expired" ? "expired" : "pending",
    amount: order.total,
    expiresAt: order.expiresAt,
    paidAt: order.paidAt,
  };
}
