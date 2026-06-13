"use client";

import { useGetServiceStatsQuery } from "@/lib/redux/api/serviceApi";
import { LayoutList, CheckCircle, XCircle, Sparkles } from "lucide-react";

export function ServiceStats() {
  const { data, isLoading, isError } = useGetServiceStatsQuery();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24 mb-4"></div>
              <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
            </div>
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Services",
      value: stats.totalServices || 0,
      icon: LayoutList,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Active Services",
      value: stats.activeServices || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Inactive Services",
      value: stats.inactiveServices || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      title: "Total Skills",
      value: stats.totalSkills || 0,
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.title}</h3>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">
              {stat.value.toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
