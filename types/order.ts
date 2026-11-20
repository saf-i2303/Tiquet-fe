export type OrderStatus = "pending" | "paid" | "expired" | "cancelled";

export interface OrderItem {
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  paymentMethod?: string;
}
