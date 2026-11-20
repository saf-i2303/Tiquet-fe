import { NextResponse } from "next/server";

/**
 * Next.js 16 memakai proxy.ts menggantikan middleware.ts.
 * Semua URL dibuka langsung tanpa validasi login/register.
 */
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tickets/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/organizer/:path*",
    "/admin/:path*",
  ],
};
