"use client";

import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useGetWaitlistEntriesQuery } from "@/lib/redux/api/waitlistApi";

export function WaitlistTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading, isFetching } = useGetWaitlistEntriesQuery({
    page,
    limit,
    searchTerm: debouncedSearch,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = data?.meta?.totalPages || 1;
  const entries = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#6b8f84] text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">City</th>
                <th className="px-6 py-4 font-medium">Skill</th>
                <th className="px-6 py-4 font-medium">Offered Services</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#6b8f84] border-t-transparent animate-spin" />
                      Loading entries...
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                    No entries found
                  </td>
                </tr>
              ) : (
                entries.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {entry.firstName} {entry.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                      {entry.email}
                    </td>
                    <td className="px-6 py-4">
                      {entry.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {entry.city || '-'}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {entry.skill || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate" title={entry.offeredServices}>
                        {entry.offeredServices || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {isLoading || isFetching ? (
          <div className="p-8 text-center text-zinc-500 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-[#6b8f84] border-t-transparent animate-spin" />
              Loading entries...
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            No entries found
          </div>
        ) : (
          <>
            {entries.map((entry: any) => (
              <div key={entry.id} className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {entry.firstName} {entry.lastName}
                    </h3>
                    <p className="text-sm text-zinc-500 break-all">{entry.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-2">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-semibold mb-1">Phone</p>
                    <p className="text-zinc-700 dark:text-zinc-300">{entry.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-semibold mb-1">City</p>
                    <p className="text-zinc-700 dark:text-zinc-300">{entry.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-semibold mb-1">Skill</p>
                    <p className="text-zinc-700 dark:text-zinc-300 capitalize">{entry.skill || '-'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-semibold mb-1">Joined Date</p>
                    <p className="text-zinc-700 dark:text-zinc-300">{new Date(entry.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {entry.offeredServices && (
                  <div className="mt-2">
                    <p className="text-zinc-500 text-xs uppercase font-semibold mb-1">Offered Services</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{entry.offeredServices}</p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Mobile Pagination */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-sm text-zinc-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
