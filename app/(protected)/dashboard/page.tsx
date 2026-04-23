"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardClient } from "./dashboard-client";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-400">Loading…</div>
          {timedOut && (
            <div className="text-xs text-red-500 max-w-xs">
              Taking longer than expected. If you keep seeing this, open browser
              DevTools → Application → Local Storage → clear all entries for this
              site, then try signing in again.
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <DashboardClient />;
}
