"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

export default function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const workshopId = id as Id<"workshops">;
  const data = useQuery(api.workshops.getForAdmin, { id: workshopId });
  const router = useRouter();

  useEffect(() => {
    if (data && data.workshop.status === "draft") {
      router.replace(`/workshops/${id}/edit`);
    }
  }, [data, id, router]);

  if (data === undefined) {
    return (
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center text-sm text-gray-400">
          Loading workshop…
        </div>
      </main>
    );
  }

  if (data === null) {
    return (
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Workshop not found
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            It may have never existed or you don&apos;t have access to it.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </main>
    );
  }

  const w = data.workshop;

  if (w.status === "draft") {
    return (
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center text-sm text-gray-400">
          Redirecting to editor…
        </div>
      </main>
    );
  }

  if (w.status === "deleted") {
    return (
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            This workshop has been deleted
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Magic links resolve to a “workshop has ended” page for participants.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </main>
    );
  }

  // phase1_active — minimal cockpit placeholder. Full cockpit lands in chunk 4.
  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
        Back to dashboard
      </Link>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl font-semibold text-gray-900">{w.name}</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Phase 1 active
          </span>
        </div>
        {w.description && (
          <p className="text-sm text-gray-500 mt-1.5">{w.description}</p>
        )}
        <p className="text-xs text-gray-500 mt-3">
          {data.participants.length} participant
          {data.participants.length === 1 ? "" : "s"}
          {w.launchedAt
            ? ` · launched ${new Date(w.launchedAt).toLocaleDateString()}`
            : ""}
        </p>
      </div>

      <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-500">
        Cockpit is wired up in the next chunk — full participant table with
        invite-status, retry, and soft-delete.
      </div>
    </main>
  );
}
