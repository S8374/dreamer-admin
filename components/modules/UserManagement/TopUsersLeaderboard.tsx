"use client";

import { useState } from "react";
import { useGetUsersQuery } from "@/lib/redux/api/userApi";
import { Trophy, Star, Award, Medal, Crown, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function TopUsersLeaderboard() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useGetUsersQuery({
    page,
    limit,
    sortBy: "rating"
  });

  const users = data?.data?.users || [];
  const meta = data?.data?.pagination || data?.meta?.pagination;
  const totalPages = meta?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-12 text-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-[#6b8f84] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center gap-3">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Leaderboard</h2>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-4">
          {users.map((user: any, index: number) => {
            const isTop3 = index < 3;
            let RankIcon = null;
            let iconColor = "";
            let bgColor = "";

            if (index === 0) {
              RankIcon = Crown;
              iconColor = "text-yellow-500";
              bgColor = "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20";
            } else if (index === 1) {
              RankIcon = Medal;
              iconColor = "text-zinc-400";
              bgColor = "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700";
            } else if (index === 2) {
              RankIcon = Award;
              iconColor = "text-amber-600";
              bgColor = "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30";
            } else {
              bgColor = "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800";
            }

            return (
              <div 
                key={user.id} 
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-md ${bgColor}`}
              >
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-12 flex flex-col items-center justify-center">
                  {RankIcon ? (
                    <RankIcon className={`h-8 w-8 ${iconColor}`} />
                  ) : (
                    <span className="text-xl font-bold text-zinc-400">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative">
                  <img 
                    src={user.avatarUrl || "https://placehold.co/100x100/png"} 
                    alt={user.fullName}
                    className={`h-12 w-12 rounded-full object-cover ${isTop3 ? 'ring-2 ring-offset-2 ring-[#6b8f84] dark:ring-offset-zinc-900' : 'border border-zinc-200 dark:border-zinc-700'}`}
                  />
                  {user.isFeaturedMember && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5 border-2 border-white dark:border-zinc-900">
                      <Star className="h-3 w-3 fill-current" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-2">
                    {user.fullName || "Unnamed User"}
                    {isTop3 && <span className="text-xs px-2 py-0.5 rounded-full bg-[#6b8f84]/10 text-[#6b8f84] font-medium">Top Rated</span>}
                  </h3>
                  <p className="text-sm text-zinc-500 truncate">{user.email}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 px-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{user.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Reviews</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{user.reviewCount || 0}</span>
                  </div>
                </div>

                {/* Membership Tier & Action */}
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.membershipTier === 'PLATINUM' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      user.membershipTier === 'GOLD' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      user.membershipTier === 'SILVER' ? 'bg-zinc-100 text-zinc-800 border border-zinc-200' :
                      'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {user.membershipTier || 'FREE'}
                    </span>
                  </div>

                  <Link 
                    href={`/details-user/${user.id}`} 
                    className="flex items-center justify-center p-2 text-zinc-400 hover:text-[#6b8f84] hover:bg-[#6b8f84]/10 rounded-lg transition-colors"
                    title="View Full Details"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            );
          })}

          {users.length === 0 && !isLoading && (
            <div className="text-center py-12 text-zinc-500">
              No users found to display on the leaderboard.
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <span className="text-sm text-zinc-500">
            Showing page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-600 dark:text-zinc-400"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-600 dark:text-zinc-400"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
