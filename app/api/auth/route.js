import { proxyAuthActionToConvex } from "@convex-dev/auth/dist/nextjs/server/proxy.js";

export async function POST(request) {
  return proxyAuthActionToConvex(request, {
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
  });
}
