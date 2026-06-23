"use client";

import { useState, useEffect } from "react";
import { useGetUserStatsQuery } from "@/lib/redux/api/userApi";
import { 
  Users, 
  ShieldAlert, 
  Clock, 
  UserCheck, 
  Sparkles
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

export default function DashboardOverviewPage() {
  const { data: statsRes, isLoading } = useGetUserStatsQuery();
  const [selectedMetric, setSelectedMetric] = useState<"users" | "listings" | "revenue">("users");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-2" />
          <div className="h-4 w-96 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
              <div className="h-10 w-10 rounded-xl bg-zinc-150 dark:bg-zinc-800 mb-4" />
              <div className="h-4 w-24 rounded bg-zinc-150 dark:bg-zinc-800 mb-2" />
              <div className="h-8 w-16 rounded bg-zinc-150 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 h-80 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="lg:col-span-4 h-80 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  // Extract statistics from success payload wrapper
  const stats = statsRes?.data ?? { totalUsers: 0, activeUsers: 0, suspendedUsers: 0, pendingUsers: 0, growth: [] };
  const total = stats.totalUsers || 1;
  const activePercent = Math.round((stats.activeUsers / total) * 100);
  const suspendedPercent = Math.round((stats.suspendedUsers / total) * 100);
  const pendingPercent = Math.round((stats.pendingUsers / total) * 100);

  // Compute Recharts datasets dynamically
  const growthData = (stats.growth && stats.growth.length > 0) ? stats.growth : [
    { name: "Jan", users: 0, listings: 0, revenue: 0 },
    { name: "Feb", users: 0, listings: 0, revenue: 0 },
    { name: "Mar", users: 0, listings: 0, revenue: 0 },
    { name: "Apr", users: 0, listings: 0, revenue: 0 },
    { name: "May", users: 0, listings: 0, revenue: 0 },
    { name: "Jun", users: 0, listings: 0, revenue: 0 },
  ];

  // Map metric key to label
  const metricLabel = {
    users: "Users",
    listings: "Listings",
    revenue: "Est. Revenue"
  }[selectedMetric];

  // Donut chart datasets
  const donutData = [
    { name: "Active Users", value: stats.activeUsers || 0, color: "#10b981" },
    { name: "Pending Approval", value: stats.pendingUsers || 0, color: "#fbbf24" },
    { name: "Suspended Account", value: stats.suspendedUsers || 0, color: "#f43f5e" }
  ].filter(d => d.value > 0);

  // Fallback if no user standings exist
  const finalDonutData = donutData.length > 0 ? donutData : [{ name: "No Users", value: 1, color: "#e4e4e7" }];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-[#6b8f84] animate-pulse" /> Dashboard Overview
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Welcome to the Dremarr command center. Here is your real-time platform diagnostics summary.
          </p>
        </div>
      </div>

      {/* Real-time stats cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full">+12% MoM</span>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Registered</span>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{stats.totalUsers}</h3>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <UserCheck className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full">{activePercent}% Ratio</span>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Members</span>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{stats.activeUsers}</h3>
          </div>
        </div>

        {/* Suspended Accounts */}
        <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 px-2 py-0.5 rounded-full">{suspendedPercent}% Rate</span>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Suspended Users</span>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{stats.suspendedUsers}</h3>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 transition-all hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded-full">{pendingPercent}% Backlog</span>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Verification Pending</span>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{stats.pendingUsers}</h3>
          </div>
        </div>
      </div>

      {/* Charts Panels */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Recharts Area Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between min-h-[360px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Platform Growth Diagnostics</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs">Visualize monthly performance metrics below.</p>
            </div>
            <div className="flex bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-250/60 dark:border-zinc-800">
              <button 
                onClick={() => setSelectedMetric("users")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMetric === "users" ? "bg-[#6b8f84] text-white shadow-xs" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Users
              </button>
              <button 
                onClick={() => setSelectedMetric("listings")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMetric === "listings" ? "bg-[#6b8f84] text-white shadow-xs" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Listings
              </button>
              <button 
                onClick={() => setSelectedMetric("revenue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMetric === "revenue" ? "bg-[#6b8f84] text-white shadow-xs" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Est. Revenue
              </button>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b8f84" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6b8f84" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  stroke="#a1a1aa" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#a1a1aa" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => selectedMetric === "revenue" ? `$${val}` : val}
                />
                <ChartTooltip 
                  contentStyle={{ 
                    backgroundColor: "#18181b", 
                    border: "none", 
                    borderRadius: "8px", 
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                  itemStyle={{ color: "#6b8f84" }}
                  formatter={(value) => [selectedMetric === "revenue" ? `$${value}` : value, metricLabel]}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#6b8f84" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Account Ratio Diagnostics */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Account Standings</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs">Verify current verification proportions.</p>
          </div>

          {/* Recharts Pie/Donut Chart */}
          <div className="relative flex justify-center items-center h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {finalDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  contentStyle={{ 
                    backgroundColor: "#18181b", 
                    border: "none", 
                    borderRadius: "8px", 
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Core Label */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Active</span>
              <span className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100 leading-none mt-0.5">{activePercent || 0}%</span>
            </div>
          </div>

          {/* Legend list */}
          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Active Users</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-200">{stats.activeUsers} ({activePercent || 0}%)</span>
            </div>
            <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /> Pending Approval</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-200">{stats.pendingUsers} ({pendingPercent || 0}%)</span>
            </div>
            <div className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" /> Suspended Account</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-200">{stats.suspendedUsers} ({suspendedPercent || 0}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
