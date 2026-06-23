"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { 
  useGetPaymentsQuery, 
  useGetPaymentStatsQuery 
} from "@/lib/redux/api/paymentApi";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip 
} from "recharts";

const typeLabelMap: Record<string, string> = {
  subscription: "Subscription Membership",
  boost: "Profile / Listing Boost",
  service_fee: "Platform Service Fee",
};

export default function PaymentHistoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: statsResponse, isLoading: isStatsLoading } = useGetPaymentStatsQuery(undefined, {
    skip: !mounted,
  });
  
  const { data: paymentsResponse, isLoading: isPaymentsLoading, isFetching } = useGetPaymentsQuery(
    {
      page,
      limit: 10,
      search: debouncedSearch,
      paymentType: typeFilter,
    },
    {
      skip: !mounted,
    }
  );

  const stats = statsResponse?.data ?? {
    totalRevenue: 0,
    totalTransactions: 0,
    revenueByType: [],
    monthlyBreakdown: [],
  };

  const payments = paymentsResponse?.data?.transactions ?? [];
  const pagination = paymentsResponse?.data?.pagination ?? { totalPages: 1, total: 0 };

  const getSubTotal = (type: string) => {
    const group = stats.revenueByType?.find((g: any) => g.type === type);
    return group?.amount ?? 0;
  };

  if (!mounted || isStatsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6b8f84]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-[#6b8f84] animate-pulse" /> Financials & Payments
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor your platform's financial transactions, revenue streams, and transaction history.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total revenue */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-505 dark:text-zinc-400">Total Earnings</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
            ${stats.totalRevenue?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <div className="text-[10px] text-zinc-400 mt-1">All time gross income</div>
        </div>

        {/* Membership subscription revenue */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-505 dark:text-zinc-400">Subscriptions</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg text-indigo-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
            ${getSubTotal("subscription")?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <div className="text-[10px] text-zinc-400 mt-1">Membership tiers packages</div>
        </div>

        {/* Promotion revenue */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-505 dark:text-zinc-400">Listing Boosts</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
            ${getSubTotal("boost")?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <div className="text-[10px] text-zinc-400 mt-1">Promotional bump fees</div>
        </div>

        {/* Total transaction count */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-505 dark:text-zinc-400">Transactions</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-purple-600">
              <ArrowUpDown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{stats.totalTransactions}</p>
          <div className="text-[10px] text-zinc-400 mt-1">Processed stripe intents</div>
        </div>
      </div>

      {/* Chart Panel */}
      {stats.monthlyBreakdown && stats.monthlyBreakdown.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Earnings History & Trends</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b8f84" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6b8f84" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <ChartTooltip formatter={(value) => [`$${value}`, "Revenue"]} contentStyle={{ borderRadius: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#6b8f84" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Table Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by providerId, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] transition-all"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
            >
              <option value="all">All Types</option>
              <option value="subscription">Subscriptions</option>
              <option value="boost">Listing Boosts</option>
              <option value="service_fee">Service Fees</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">User / Account</th>
                <th className="px-6 py-4 font-medium">Payment Type</th>
                <th className="px-6 py-4 font-medium">Provider / ID</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {isPaymentsLoading || isFetching ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-[#6b8f84] border-t-transparent rounded-full animate-spin" />
                      Loading transactions...
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* User profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.user?.avatarUrl || "https://placehold.co/100x100/png"}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover border border-zinc-200"
                        />
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {p.user?.fullName || "Unnamed User"}
                          </div>
                          <div className="text-xs text-zinc-500">{p.user?.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Payment Type */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        p.paymentType === "subscription" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400" :
                        p.paymentType === "boost" ? "bg-amber-100 text-amber-850 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}>
                        {typeLabelMap[p.paymentType] || p.paymentType}
                      </span>
                    </td>

                    {/* Provider ID */}
                    <td className="px-6 py-4 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      {p.providerId || "N/A"}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      ${p.amount?.toFixed(2)} <span className="text-[10px] text-zinc-400 font-normal">{p.currency}</span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>

                    {/* Receipt link */}
                    <td className="px-6 py-4 text-right">
                      {p.receiptUrl ? (
                        <a
                          href={p.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6b8f84]/10 text-[#6b8f84] hover:bg-[#6b8f84]/20 rounded-lg transition-colors text-xs font-semibold"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View Receipt
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">No Link</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <span className="text-xs text-zinc-500">
              Showing page {page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
