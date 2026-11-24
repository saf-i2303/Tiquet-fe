import type { Role } from "@/types/user";

/** Halaman profil akun per role (bukan profil bisnis organizer). */
export const accountProfileRoutes: Record<Role, string> = {
  customer: "/profile",
  organizer: "/organizer/account",
  gate_staff: "/gate/profile",
  super_admin: "/admin/profile",
};

export const routes = {
  home: "/",
  events: "/events",
  event: (id: string) => `/events/${id}`,
  eventTickets: (id: string) => `/events/${id}/tickets`,

  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",

  checkout: (orderId: string) => `/checkout/${orderId}`,
  checkoutStatus: (orderId: string, status?: string) =>
    status ? `/checkout/${orderId}/status?status=${status}` : `/checkout/${orderId}/status`,

  tickets: "/tickets",
  ticket: (id: string) => `/tickets/${id}`,
  orders: "/orders",
  order: (id: string) => `/orders/${id}`,
  profile: "/profile",
  accountProfile: accountProfileRoutes,

  organizer: {
    dashboard: "/organizer",
    profile: "/organizer/profile",
    account: accountProfileRoutes.organizer,
    verification: "/organizer/verification",
    events: "/organizer/events",
    eventNew: "/organizer/events/new",
    event: (id: string) => `/organizer/events/${id}`,
    eventEdit: (id: string) => `/organizer/events/${id}/edit`,
    eventTickets: (id: string) => `/organizer/events/${id}/tickets`,
    eventAttendees: (id: string) => `/organizer/events/${id}/attendees`,
    reports: "/organizer/reports",
    transactions: "/organizer/transactions",
    team: "/organizer/team",
    payouts: "/organizer/payouts",
  },

  gate: {
    profile: accountProfileRoutes.gate_staff,
  },

  admin: {
    dashboard: "/admin",
    users: "/admin/users",
    user: (id: string) => `/admin/users/${id}`,
    organizers: "/admin/organizers",
    organizer: (id: string) => `/admin/organizers/${id}`,
    events: "/admin/events",
    event: (id: string) => `/admin/events/${id}`,
    transactions: "/admin/transactions",
    refunds: "/admin/refunds",
    refund: (id: string) => `/admin/refunds/${id}`,
    payouts: "/admin/payouts",
    activity: "/admin/activity",
    settings: "/admin/settings",
    profile: accountProfileRoutes.super_admin,
  },
} as const;
