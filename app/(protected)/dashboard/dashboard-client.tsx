"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function DashboardClient() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const greeting = useQuery(api.hello.hello);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold tracking-tight text-gray-900">SortLab</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Workshops</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your card sorting sessions</p>
          </div>
          <Button disabled title="Coming in M2" className="opacity-50 cursor-not-allowed">
            + New workshop
          </Button>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center bg-white border border-dashed border-gray-200 rounded-2xl py-20 px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 text-3xl">
            🃏
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">No workshops yet</h2>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
            When you create a workshop, it&apos;ll appear here. You&apos;ll invite participants,
            run them through four phases, and export a content map.
          </p>
          <Button disabled title="Coming in M2" className="opacity-50 cursor-not-allowed">
            + Create your first workshop
          </Button>
          <p className="text-xs text-gray-400 mt-3">Workshop creation coming in M2</p>
        </div>

        {/* Convex connection check */}
        {greeting && (
          <p className="mt-6 text-center text-xs text-gray-400">{greeting}</p>
        )}
      </main>
    </div>
  );
}
