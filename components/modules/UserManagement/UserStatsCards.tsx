"use client";

import { useGetUserStatsQuery } from "@/lib/redux/api/userApi";
import { Users, UserCheck, UserX, UserPlus, ShieldAlert } from "lucide-react";

export function UserStatsCards() {
  const { data, isLoading, isFetching } = useGetUserStatsQuery();

  const stats = [
    {
      label: "Total Users",
      value: data?.data?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      bgLight: "bg-blue-50 dark:bg-blue-500/10",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      label: "Active Users",
      value: data?.data?.activeUsers || 0,
      icon: UserCheck,
      color: "bg-green-500",
      bgLight: "bg-green-50 dark:bg-green-500/10",
      textColor: "text-green-600 dark:text-green-400"
    },
    {
      label: "Pending Verification",
      value: data?.data?.pendingUsers || 0,
      icon: UserPlus,
      color: "bg-yellow-500",
      bgLight: "bg-yellow-50 dark:bg-yellow-500/10",
      textColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
      label: "Suspended",
      value: data?.data?.suspendedUsers || 0,
      icon: UserX,
      color: "bg-red-500",
      bgLight: "bg-red-50 dark:bg-red-500/10",
      textColor: "text-red-600 dark:text-red-400"
    }
  ];

  if (isLoading || isFetching) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2 animate-pulse" />
                <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={i} 
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 duration-200"
          >
            <div className="flex flex-col gap-3">
              <div className={`h-10 w-10 rounded-xl ${stat.bgLight} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${stat.textColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
                  {stat.value.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
