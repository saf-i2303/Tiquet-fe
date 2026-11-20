import { USE_MOCK, apiFetch } from "@/lib/api";
import { MAX_TICKETS_PER_ORDER, SERVICE_FEE } from "@/lib/constants";
import { events } from "@/lib/mocks/events";
import { orders } from "@/lib/mocks/orders";
import type { Order, OrderItem } from "@/types/order";
import type { SessionUser } from "@/types/user";

export interface CreateOrderItemInput {
  ticketTypeId: string;
  qty: number;
}

export interface CreateOrderInput {
  eventId: string;
  customer: SessionUser;
  items: CreateOrderItemInput[];
  customerPhone?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<Order | null> {
  const event = events.find((item) => item.id === input.eventId && item.status === "published");
  if (!event) return null;

  const items: OrderItem[] = [];

  for (const requested of input.items) {
    const ticketType = event.ticketTypes.find((ticket) => ticket.id === requested.ticketTypeId);
    if (!ticketType) continue;

    const remaining = ticketType.quota - ticketType.sold;
    const qty = Math.min(
      Math.max(0, requested.qty),
      remaining,
      ticketType.maxPerOrder,
      MAX_TICKETS_PER_ORDER,
    );
    if (qty <= 0) continue;

    items.push({
      ticketTypeId: ticketType.id,
      ticketTypeName: ticketType.name,
      price: ticketType.price,
      qty,
      subtotal: ticketType.price * qty,
    });
  }

  if (items.length === 0) return null;

  const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);

  const order: Order = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    venue: event.venue,
    customerId: input.customer.id,
    customerName: input.customer.name,
    customerEmail: input.customer.email,
    customerPhone: input.customerPhone ?? input.customer.phone ?? "-",
    status: "pending",
    items,
    subtotal,
    serviceFee: SERVICE_FEE,
    total: subtotal + SERVICE_FEE,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  for (const item of items) {
    const ticketType = event.ticketTypes.find((ticket) => ticket.id === item.ticketTypeId);
    if (ticketType) ticketType.sold += item.qty;
  }

  orders.unshift(order);
  return order;
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  if (!USE_MOCK) {
    return apiFetch<Order>(`/orders/${id}`);
  }
  return orders.find((order) => order.id === id);
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  if (!USE_MOCK) {
    return apiFetch<Order[]>(`/orders?customerId=${customerId}`);
  }
  return orders
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function payOrder(orderId: string, methodName: string): Promise<Order | null> {
  const order = orders.find((item) => item.id === orderId);
  if (!order || order.status !== "pending") return order ?? null;

  if (new Date(order.expiresAt).getTime() < Date.now()) {
    order.status = "expired";
    return order;
  }

  order.status = "paid";
  order.paidAt = new Date().toISOString();
  order.paymentMethod = methodName;

  return order;
}

export async function cancelOrder(orderId: string): Promise<Order | null> {
  const order = orders.find((item) => item.id === orderId);
  if (!order || order.status !== "pending") return null;
  order.status = "cancelled";
  return order;
}
