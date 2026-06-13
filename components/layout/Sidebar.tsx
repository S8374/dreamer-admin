"use client";

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
  Gift
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "Listing Management", href: "/listings-management", icon: List },
  { name: "Membership Management", href: "/memberships-management", icon: CreditCard },
  { name: "Promotion Management", href: "/promotion-management", icon: Gift },
  { name: "Service Management", href: "/services-management", icon: Briefcase },
  { name: "Document Management", href: "/documents-management", icon: FileText },
  { name: "Support Management", href: "/support-management", icon: MessageSquare },
  { name: "Report Management", href: "/reports-management", icon: BarChart3 },
];

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

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
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white text-zinc-600 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-zinc-200 overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Background Image */}
        <img
          src="/sidebar-bg.png"
          alt="Sidebar Background"
          className="absolute inset-0 h-full w-full object-cover opacity-100 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/50 to-white/90 pointer-events-none" />

        {/* Header / Logo */}
        <div className="relative z-10 flex h-16 shrink-0 items-center justify-between px-6 border-b border-zinc-200/50">
          <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img src="/logo.png" alt="Dremarr Logo" className="h-8 w-auto object-contain" />
            <span className="text-xl font-bold tracking-tight text-zinc-900">Dremarr</span>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 -mr-2 text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[14.5px] font-medium transition-all ${
                  isActive
                    ? "bg-[#6b8f84]/10 text-[#6b8f84]"
                    : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
                }`}
              >
                <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive ? "bg-[#6b8f84]/20 text-[#6b8f84]" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-900"
                }`}>
                  <item.icon className="h-5 w-5" />
                  {/* Active Indicator Line */}
                  {isActive && (
                    <div className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#6b8f84]" />
                  )}
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Settings */}
        <div className="relative z-10 p-4 border-t border-zinc-200/50">
          <Link
            href="/settings"
            className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[14.5px] font-medium transition-all ${
              pathname === "/settings"
                ? "bg-[#6b8f84]/10 text-[#6b8f84]"
                : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"
            }`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
              pathname === "/settings" ? "bg-[#6b8f84]/20 text-[#6b8f84]" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-900"
            }`}>
              <Settings className="h-5 w-5" />
            </div>
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
