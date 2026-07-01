"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X, 
  User
} from "lucide-react";
import { useGetReportsQuery } from "@/lib/redux/api/reportApi";
import Link from "next/link";

const categoriesMap: Record<string, string> = {
  inappropriate_behavior: "Inappropriate Behavior",
  fraudulent_activity: "Fraudulent Activity",
  harassment: "Harassment",
  scam: "Scam",
  offensive_content: "Offensive Content",
  spam: "Spam",
  other: "Other",
};

export default function ReportsManagementPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: reportsResponse, isLoading, isFetching } = useGetReportsQuery({
    search: debouncedSearch,
    status: statusFilter,
    category: categoryFilter,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const reports = reportsResponse?.data || [];

  // Calculate quick stats from loaded reports
  const totalReports = reports.length;
  const openCount = reports.filter((r: any) => r.status === "open").length;
  const actionTakenCount = reports.filter((r: any) => r.status === "action_taken").length;
  const dismissedCount = reports.filter((r: any) => r.status === "dismissed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Reports & Moderation</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Review issues reported by users, inspect proofs, and moderate user accounts.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Total Reports</span>
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{totalReports}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Active (Open)</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{openCount}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Action Taken</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{actionTakenCount}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Dismissed</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/20 rounded-lg text-rose-600">
              <X className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{dismissedCount}</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by title, description, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] transition-all"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="action_taken">Action Taken</option>
              <option value="dismissed">Dismissed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoriesMap).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table Content */}
        <div className="hidden md:block flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3 font-medium">Reporter</th>
                <th className="px-4 py-3 font-medium">Reported User</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-[#6b8f84] border-t-transparent rounded-full animate-spin" />
                      Loading reports...
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* Reported User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={report.reportedUser?.avatarUrl || "https://placehold.co/100x100/png"}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover border border-zinc-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1 max-w-[150px] lg:max-w-[200px]">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={report.reportedUser?.fullName || "Unnamed User"}>
                            {report.reportedUser?.fullName || "Unnamed User"}
                          </div>
                          <div className="text-xs text-zinc-500 truncate max-w-[150px]" title={report.reportedUser?.email}>{report.reportedUser?.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 max-w-[150px] lg:max-w-[200px]">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate" title={report.reporter?.fullName || "Unnamed User"}>
                            {report.reporter?.fullName || "Unnamed User"}
                          </div>
                          <div className="text-xs text-zinc-500 truncate max-w-[150px]" title={report.reporter?.email}>{report.reporter?.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Title */}
                    <td className="px-6 py-4 min-w-[200px]">
                      <div className="text-zinc-900 dark:text-zinc-100 font-semibold">
                        {categoriesMap[report.category] || report.category}
                      </div>
                      <div className="text-xs text-zinc-500 max-w-[200px] truncate">{report.issueTitle}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        report.status === "open" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                        report.status === "action_taken" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                        "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}>
                        {report.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/reports-management/${report.id}`}
                        className="px-3 py-1.5 bg-[#6b8f84]/10 text-[#6b8f84] hover:bg-[#6b8f84]/20 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ml-auto w-fit"
                      >
                        <Eye className="h-3.5 w-3.5" /> Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
          {isLoading || isFetching ? (
            <div className="py-12 text-center text-zinc-500">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="h-6 w-6 border-2 border-[#6b8f84] border-t-transparent rounded-full animate-spin" />
                Loading reports...
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              No reports found.
            </div>
          ) : (
            reports.map((report: any) => (
              <div key={report.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm relative">
                <div className="flex justify-between items-start mb-3 border-b border-zinc-100 dark:border-zinc-800/50 pb-3">
                  <div className="flex items-center gap-3 pr-4 w-full min-w-0">
                    <img
                      src={report.reportedUser?.avatarUrl || "https://placehold.co/100x100/png"}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover border border-zinc-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {report.reportedUser?.fullName || "Unnamed User"}
                      </div>
                      <div className="text-xs text-zinc-500 truncate mt-0.5">
                        {report.reportedUser?.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Reported By</span>
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <div className="h-5 w-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shrink-0">
                      <User className="h-3 w-3" />
                    </div>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300 truncate w-full flex-1">
                      {report.reporter?.fullName || "Unnamed User"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Reason</span>
                    <div className="text-zinc-900 dark:text-zinc-100 font-medium text-xs">
                      {categoriesMap[report.category] || report.category}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">{report.issueTitle}</div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Status</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      report.status === "open" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                      report.status === "action_taken" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {report.status.replace("_", " ")}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Date</span>
                    <span className="text-zinc-600 dark:text-zinc-400 text-xs">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                  <Link
                    href={`/reports-management/${report.id}`}
                    className="px-3 py-1.5 bg-[#6b8f84]/10 text-[#6b8f84] hover:bg-[#6b8f84]/20 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Eye className="h-3.5 w-3.5" /> Review
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
