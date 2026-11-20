export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export type PaymentMethodGroup = "bank" | "ewallet" | "card";

export interface PaymentMethod {
  id: string;
  name: string;
  group: PaymentMethodGroup;
  fee: number;
  instructions: string[];
}

export interface Payment {
  id: string;
  orderId: string;
  methodId: string;
  methodName: string;
  status: PaymentStatus;
  amount: number;
  expiresAt: string;
  paidAt?: string;
}
