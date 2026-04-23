import { proxyAuthActionToConvex } from "@convex-dev/auth/nextjs/server";

export async function POST(request: Request) {
  return proxyAuthActionToConvex(request);
}
