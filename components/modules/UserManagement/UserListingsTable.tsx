"use client";

import { useState } from "react";
import { MoreVertical, Trash2, Edit, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetUserListingsQuery, useAdminDeleteListingMutation } from "@/lib/redux/api/userApi";
import { toast } from "sonner";

export function UserListingsTable({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetUserListingsQuery({ id: userId, page, limit });
  const [deleteListing] = useAdminDeleteListingMutation();

  const handleDelete = async (listingId: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteListing({ listingId, userId }).unwrap();
      toast.success("Listing deleted successfully");
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to delete listing");
    }
  };

  const listings = data?.data?.listings || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Listing Title</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Created At</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  Loading listings...
                </td>
              </tr>
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No listings found.
                </td>
              </tr>
            ) : (
              listings.map((listing: any, index: number) => (
                <tr key={listing.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                    {listing.title}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{listing.category}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 text-right relative ${activeMenu === listing.id ? 'z-50' : 'z-10'}`}>
                    <button 
                      onClick={() => setActiveMenu(activeMenu === listing.id ? null : listing.id)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {activeMenu === listing.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                        <div className={`absolute right-8 ${index >= 7 ? 'bottom-8' : 'top-10'} z-50 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden py-1`}>
                          <button onClick={() => toast.info("Listing Update is currently limited.")} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                            <Edit className="h-4 w-4" /> Edit
                          </button>
                          <button onClick={() => handleDelete(listing.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50">
        <span className="text-sm text-zinc-500">Showing page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-100 disabled:opacity-50 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-100 disabled:opacity-50 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
