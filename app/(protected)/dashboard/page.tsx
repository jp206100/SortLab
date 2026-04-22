"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardClient } from "./dashboard-client";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;
  return <DashboardClient />;
}
