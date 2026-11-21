import type { NextConfig } from "next";

const upstream = (process.env.API_UPSTREAM_URL || "http://localhost:8080")
  .trim()
  .replace(/\/+$/, "");
const upstreamBase = upstream.endsWith("/api/v1")
  ? upstream
  : `${upstream}/api/v1`;

const nextConfig: NextConfig = {
  // Fallback untuk NEXT_PUBLIC_API_URL="/api/v1" atau pemanggilan sisi server
  // yang masih memakai path relatif. Mode utama kini direct call via CORS.
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${upstreamBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
