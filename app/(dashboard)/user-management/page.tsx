"use client";

import { UserTable } from "@/components/modules/UserManagement/UserTable";
import { UserStatsCards } from "@/components/modules/UserManagement/UserStatsCards";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">User Management</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Manage all registered users, control their roles, and moderate their accounts.
        </p>
      </div>
      
      <UserStatsCards />
      <UserTable />
    </div>
  );
}
