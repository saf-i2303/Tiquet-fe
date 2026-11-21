import { ApiError, api, getUserFromStorage, unwrap } from "@/lib/api";
import { getPublicEvent } from "@/services/eventServices";
import type { ApiResponse, PaginationMeta } from "@/types/api";
import type {
  ApiCreateOrderRequest,
  ApiOrder,
  ApiOrderList,
  ListOrdersParams,
  Order,
} from "@/types/order";
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

export interface OrderListResult {
  items: Order[];
  pagination: PaginationMeta;
}

interface EventMeta {
  eventDate: string;
  venue: string;
}

/** Key dipertahankan selama retry; dihapus setelah order berhasil dibuat. */
const idempotencyKeys = new Map<string, string>();
/** Request cancel yang sedang berjalan di-share agar tidak dobel submit. */
const cancelRequests = new Map<string, Promise<Order | null>>();
let idempotencySequence = 0;

const ORDER_STATUSES = ["pending", "paid", "expired", "cancelled"] as const;

function toOrderStatus(value: string): Order["status"] {
  return ORDER_STATUSES.find((status) => status === value) ?? "pending";
}

function createIdempotencyKey(): string {
  idempotencySequence += 1;
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = (Date.now() + i + idempotencySequence) % 256;
    }
  }
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `ord-${hex}`;
}

function idempotencyScope(input: CreateOrderInput): string {
  const items = input.items
    .map((item) => `${item.ticketTypeId}:${item.qty}`)
    .sort()
    .join(",");
  return `${input.eventId}|${input.customer.id}|${items}`;
}

function currentSession(): SessionUser | null {
  return getUserFromStorage();
}

function mapApiOrder(
  source: ApiOrder,
  session: SessionUser | null,
  eventMeta: EventMeta = { eventDate: "", venue: "" },
): Order {
  return {
    id: source.id,
    eventId: source.event_id,
    eventTitle: source.event_title,
    eventDate: eventMeta.eventDate,
    venue: eventMeta.venue,
    customerId: session?.id ?? "",
    customerName: session?.name ?? "",
    customerEmail: session?.email ?? "",
    customerPhone: session?.phone ?? "",
    status: toOrderStatus(source.status),
    items: source.items.map((item) => ({
      ticketTypeId: item.ticket_type_id,
      ticketTypeName: item.ticket_name,
      price: item.unit_price,
      qty: item.quantity,
      subtotal: item.subtotal,
    })),
    subtotal: source.subtotal,
    serviceFee: source.platform_fee,
    total: source.total,
    createdAt: source.created_at,
    expiresAt: source.expires_at,
    paidAt: source.paid_at ?? undefined,
  };
}

async function fetchEventMeta(eventId: string): Promise<EventMeta> {
  try {
    const event = await getPublicEvent(eventId);
    return { eventDate: event.start_at, venue: event.venue?.name ?? "" };
  } catch {
    return { eventDate: "", venue: "" };
  }
}

async function fetchOrders(
  params: ListOrdersParams,
  session: SessionUser | null,
): Promise<OrderListResult> {
  const data = unwrap(
    await api.get<ApiResponse<ApiOrderList>>("/orders", {
      status: params.status,
      page: params.page,
      limit: params.limit,
    }),
  );

  return {
    items: data.items.map((item) => mapApiOrder(item, session)),
    pagination: data.pagination,
  };
}

export async function createOrder(input: CreateOrderInput): Promise<Order | null> {
  const scope = idempotencyScope(input);
  const idempotencyKey =
    idempotencyKeys.get(scope) ?? createIdempotencyKey();
  idempotencyKeys.set(scope, idempotencyKey);

  const payload: ApiCreateOrderRequest = {
    items: input.items.map((item) => ({
      ticket_type_id: item.ticketTypeId,
      quantity: item.qty,
    })),
  };

  const data = unwrap(
    await api.post<ApiResponse<ApiOrder>>("/orders", payload, {
      headers: { "Idempotency-Key": idempotencyKey },
    }),
  );
  idempotencyKeys.delete(scope);

  return mapApiOrder(data, input.customer);
}

export function listOrders(
  params: ListOrdersParams = {},
): Promise<OrderListResult> {
  return fetchOrders(params, currentSession());
}

export async function getOrdersByCustomer(
  customerId: string,
  params: Pick<ListOrdersParams, "page" | "limit"> = {},
): Promise<Order[]> {
  const fallbackSession: SessionUser = {
    id: customerId,
    name: "",
    email: "",
    role: "customer",
  };
  const result = await fetchOrders(
    { page: params.page ?? 1, limit: params.limit ?? 100 },
    currentSession() ?? fallbackSession,
  );
  return result.items;
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  try {
    const data = unwrap(
      await api.get<ApiResponse<ApiOrder>>(`/orders/${encodeURIComponent(id)}`),
    );
    const eventMeta = await fetchEventMeta(data.event_id);
    return mapApiOrder(data, currentSession(), eventMeta);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

/**
 * Backend belum mengekspos endpoint payment. Helper ini sengaja
 * mengembalikan nilai kosong bertipe agar UI tidak memuat data dummy.
 */
export async function payOrder(_orderId: string, _methodName: string): Promise<Order | null> {
  return null;
}

export function cancelOrder(orderId: string): Promise<Order | null> {
  const inflight = cancelRequests.get(orderId);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      const data = unwrap(
        await api.post<ApiResponse<ApiOrder>>(
          `/orders/${encodeURIComponent(orderId)}/cancel`,
        ),
      );
      const eventMeta = await fetchEventMeta(data.event_id);
      return mapApiOrder(data, currentSession(), eventMeta);
    } finally {
      cancelRequests.delete(orderId);
    }
  })();

  cancelRequests.set(orderId, request);
  return request;
}
