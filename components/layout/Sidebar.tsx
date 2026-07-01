"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  List,
  CreditCard,
  Briefcase,
  MessageSquare,
  BarChart3,
  Settings,
  X,
  FileText,
  Gift,
  Trophy,
  DollarSign,
  Clock
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navSections = [
  {
    title: "Main",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Users",
    items: [
      { name: "User Management", href: "/user-management", icon: Users },
      { name: "Waitlist Management", href: "/waitlist-management", icon: Clock },
      { name: "Top Users", href: "/top-users", icon: Trophy },
    ]
  },
  {
    title: "Marketplace",
    items: [
      { name: "Listing Management", href: "/listings-management", icon: List },
      { name: "Service Management", href: "/services-management", icon: Briefcase },
    ]
  },
  {
    title: "Billing & Revenue",
    items: [
      { name: "Membership Management", href: "/memberships-management", icon: CreditCard },
      { name: "Promotion Management", href: "/promotion-management", icon: Gift },
      { name: "Payment History", href: "/payment-history", icon: DollarSign },
    ]
  },
  {
    title: "Support & Moderation",
    items: [
      { name: "Document Management", href: "/documents-management", icon: FileText },
      { name: "Support Management", href: "/support-management", icon: MessageSquare },
      { name: "Report Management", href: "/reports-management", icon: BarChart3 },
    ]
  }
];

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Automatically close sidebar when navigating on mobile/tablet (< 1024px)
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-zinc-200 dark:border-zinc-800/50 overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Background Image */}
        <img
          src="/sidebar-bg.png"
          alt="Sidebar Background"
          className="absolute inset-0 h-full w-full object-cover opacity-100 dark:opacity-30 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/50 to-white/90 dark:from-zinc-950/50 dark:via-zinc-950/80 dark:to-zinc-950 pointer-events-none" />

        {/* Header / Logo */}
        <div className="relative z-10 flex h-16 shrink-0 items-center justify-between px-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img src="/logo.png" alt="Dremarr Logo" className="h-8 w-auto object-contain dark:invert" />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Dremarr</span>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-medium transition-all ${
                        isActive
                          ? "bg-[#6b8f84]/10 text-[#6b8f84] dark:bg-[#6b8f84]/20"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }`}
                    >
                      <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive ? "bg-[#6b8f84]/20 text-[#6b8f84] dark:bg-[#6b8f84]/30" : "bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                      }`}>
                        <item.icon className="h-4.5 w-4.5" />
                        {/* Active Indicator Line */}
                        {isActive && (
                          <div className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#6b8f84]" />
                        )}
                      </div>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer / Settings */}
        {/* <div className="relative z-10 p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <Link
            href="/settings"
            className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[14.5px] font-medium transition-all ${
              pathname === "/settings"
                ? "bg-[#6b8f84]/10 text-[#6b8f84] dark:bg-[#6b8f84]/20"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
              pathname === "/settings" ? "bg-[#6b8f84]/20 text-[#6b8f84] dark:bg-[#6b8f84]/30" : "bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-800 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
            }`}>
              <Settings className="h-5 w-5" />
            </div>
            Settings
          </Link>
        </div> */}
      </aside>
    </>
  );
}
