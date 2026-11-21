import type { Paginated } from "@/types/api";

export type OrderStatus = "pending" | "paid" | "expired" | "cancelled";

/* ------------------------- Backend wire shapes ------------------------- */

export interface ApiCreateOrderItemRequest {
  ticket_type_id: string;
  quantity: number;
}

export interface ApiCreateOrderRequest {
  items: ApiCreateOrderItemRequest[];
}

export interface ApiOrderItem {
  ticket_type_id: string;
  ticket_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

/** `order.OrderResponse` dari backend. Field UI-only tidak dikirim backend. */
export interface ApiOrder {
  id: string;
  event_id: string;
  event_title: string;
  status: string;
  items: ApiOrderItem[];
  subtotal: number;
  platform_fee: number;
  tax: number;
  total: number;
  currency: string;
  expires_at: string;
  paid_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
}

/** `order.PaginatedOrdersResponse`: data.items + data.pagination. */
export type ApiOrderList = Paginated<ApiOrder>;

export interface ListOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

/* --------------------------- Frontend model --------------------------- */

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
