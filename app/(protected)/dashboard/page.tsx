import { redirect } from "next/navigation";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/sign-in");
  }
  return <DashboardClient />;
}
