"use client";

import { TopUsersLeaderboard } from "@/components/modules/UserManagement/TopUsersLeaderboard";


export default function TopUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Top Users</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          View the top users ranked by their rating and total review count.
        </p>
      </div>
      
      <TopUsersLeaderboard />
    </div>
  );
}
