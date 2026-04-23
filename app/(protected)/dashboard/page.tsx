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
    const warn = setTimeout(() => setTimedOut(true), 5000);
    // Full page reload resets the stuck in-memory auth ref inside @convex-dev/auth
    const bail = setTimeout(() => { window.location.href = "/sign-in"; }, 10000);
    return () => { clearTimeout(warn); clearTimeout(bail); };
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="text-sm text-gray-400">Loading…</div>
          {timedOut && (
            <>
              <div className="text-xs text-red-500 max-w-xs">
                Auth is taking too long. Redirecting to sign-in…
              </div>
              <button
                className="text-xs text-blue-600 underline"
                onClick={() => { window.location.href = "/sign-in"; }}
              >
                Go now
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <DashboardClient />;
}
