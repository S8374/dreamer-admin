"use client";

import { useGetDocumentStatsQuery } from "@/lib/redux/api/documentApi";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";

export function DocumentStats() {
  const { data, isLoading, isError } = useGetDocumentStatsQuery();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
        {[...Array(5)].map((_, i) => (
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
      title: "Total Documents",
      value: stats.totalDocuments || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Pending Review",
      value: stats.pending || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      title: "Unverified",
      value: stats.unverified || 0,
      icon: FileText,
      color: "text-zinc-600",
      bgColor: "bg-zinc-100 dark:bg-zinc-900/20",
    },
    {
      title: "Verified",
      value: stats.verified || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Rejected",
      value: stats.rejected || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
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
