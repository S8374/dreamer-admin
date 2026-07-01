"use client";

import { useState } from "react";
import { MoreVertical, Trash2, Edit, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useGetUserReviewsQuery, useAdminDeleteReviewMutation } from "@/lib/redux/api/userApi";
import { toast } from "sonner";

export function UserReviewsTable({ userId, type }: { userId: string; type: "received" | "given" }) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetUserReviewsQuery({ id: userId, type, page, limit });
  const [deleteReview] = useAdminDeleteReviewMutation();

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview({ reviewId, userId, type }).unwrap();
      toast.success("Review deleted successfully");
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const reviews = data?.data?.reviews || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
      {/* Desktop Table */}
      <div className="hidden md:block flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">{type === "received" ? "Reviewer" : "Reviewee"}</th>
              <th className="px-6 py-4 font-medium">Rating</th>
              <th className="px-6 py-4 font-medium">Comment</th>
              <th className="px-6 py-4 font-medium">Listing</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  Loading reviews...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No reviews found.
                </td>
              </tr>
            ) : (
              reviews.map((review: any, index: number) => {
                const otherUser = type === "received" ? review.reviewer : review.reviewee;
                return (
                  <tr key={review.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <img src={otherUser?.avatarUrl || "https://placehold.co/40x40/png"} className="h-8 w-8 rounded-full" alt="" />
                      {otherUser?.fullName || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-yellow-500">
                        {review.rating} <Star className="h-3 w-3 ml-1 fill-current" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 truncate max-w-[200px]" title={review.comment}>
                      {review.comment || "-"}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {review.listing?.title || "-"}
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 text-right relative ${activeMenu === review.id ? 'z-50' : 'z-10'}`}>
                      <button 
                        onClick={() => setActiveMenu(activeMenu === review.id ? null : review.id)}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {activeMenu === review.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                          <div className={`absolute right-8 ${index >= 7 ? 'bottom-8' : 'top-10'} z-50 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden py-1`}>
                            <button onClick={() => toast.info("Review Update is currently limited.")} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                              <Edit className="h-4 w-4" /> Edit
                            </button>
                            <button onClick={() => handleDelete(review.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
        {isLoading || isFetching ? (
          <div className="py-12 text-center text-zinc-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">No reviews found.</div>
        ) : (
          reviews.map((review: any) => {
            const otherUser = type === "received" ? review.reviewer : review.reviewee;
            return (
              <div key={review.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm relative space-y-3">
                <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                  <div className="flex items-center gap-2 w-full min-w-0 pr-4">
                    <img src={otherUser?.avatarUrl || "https://placehold.co/40x40/png"} className="h-8 w-8 rounded-full shrink-0 object-cover" alt="" />
                    <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate flex-1">
                      {otherUser?.fullName || "Unknown"}
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveMenu(activeMenu === review.id ? null : review.id)}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">{type === "received" ? "Reviewer" : "Reviewee"}</span>
                    <div className="flex items-center text-yellow-500">
                      {review.rating} <Star className="h-3 w-3 ml-1 fill-current" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-500">Comment</span>
                    <span className="text-zinc-900 dark:text-zinc-300 italic">"{review.comment || "-"}"</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Listing</span>
                    <span className="text-zinc-900 dark:text-zinc-300 truncate max-w-[150px]">{review.listing?.title || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Date</span>
                    <span className="text-zinc-900 dark:text-zinc-300">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {activeMenu === review.id && (
                  <div className="absolute right-4 top-10 z-50 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 py-1">
                    <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                    <div className="relative z-50">
                      <button onClick={() => toast.info("Review Update is currently limited.")} className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2">
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button onClick={() => handleDelete(review.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
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
