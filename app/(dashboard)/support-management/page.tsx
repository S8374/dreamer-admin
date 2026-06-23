"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Eye, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  X, 
  User, 
  ShieldAlert,
  Loader2
} from "lucide-react";
import { useGetTicketsQuery } from "@/lib/redux/api/supportApi";
import Link from "next/link";

export default function SupportTicketsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: response, isLoading, isFetching } = useGetTicketsQuery();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const tickets = response?.data || [];

  // Filter tickets locally
  const filteredTickets = tickets.filter((ticket: any) => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      ticket.message.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      ticket.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate quick stats
  const totalCount = tickets.length;
  const openCount = tickets.filter((t: any) => t.status === "open").length;
  const inProgressCount = tickets.filter((t: any) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t: any) => t.status === "resolved" || t.status === "closed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Support Management</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          View and resolve user-submitted support tickets, review priorities, and assist members.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Total Tickets</span>
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{totalCount}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Open</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/20 rounded-lg text-rose-600">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{openCount}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">In Progress</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{inProgressCount}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500">Resolved / Closed</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{resolvedCount}</p>
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
              placeholder="Search by name, subject, message..."
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
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Submitter Name</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Issue Type</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Submitted</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-[#6b8f84] border-t-transparent rounded-full animate-spin" />
                      Loading support tickets...
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    No support tickets found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* Submitter Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ticket.user?.avatarUrl || "https://placehold.co/100x100/png"}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover border border-zinc-200"
                        />
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {ticket.name || ticket.user?.fullName || "Guest Submitter"}
                          </div>
                          <div className="text-xs text-zinc-500">{ticket.user?.email || "No account email"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 max-w-[220px] truncate">
                        {ticket.subject}
                      </div>
                      <div className="text-xs text-zinc-400 max-w-[220px] truncate">{ticket.message}</div>
                    </td>

                    {/* Issue Type */}
                    <td className="px-6 py-4 capitalize text-zinc-700 dark:text-zinc-300">
                      {ticket.issueType.replace("_", " ")}
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      {ticket.isPriority ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md border border-red-150">
                          <ShieldAlert className="h-3.5 w-3.5" /> Priority
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">Normal</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        ticket.status === "open" ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400" :
                        ticket.status === "in_progress" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/support-management/${ticket.id}`}
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
      </div>
    </div>
  );
}
