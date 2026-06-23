"use client";

import { Menu, Bell, User, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { useAdminLogoutMutation } from "@/lib/redux/api/authApi";
import { useGetNotificationsQuery, useMarkNotificationAsReadMutation } from "@/lib/redux/api/notificationApi";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminLogout] = useAdminLogoutMutation();

  const { data: notificationsRes } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();

  const notifications = notificationsRes?.data ?? [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleNotificationClick = async (notification: any) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id).unwrap();
      }
      setShowNotifications(false);
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout().unwrap();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout:", error);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 sm:px-6 lg:px-8">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 lg:hidden dark:text-zinc-400 dark:hover:text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 justify-end items-center gap-4 sm:gap-6">
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-zinc-400 hover:text-zinc-650 transition-colors dark:hover:text-zinc-300"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-50">
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-2 px-3 mb-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-150">Notifications</span>
                {unreadCount > 0 && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">{unreadCount} unread</span>}
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1 scrollbar-thin">
                {notifications.length === 0 ? (
                  <p className="text-center text-zinc-400 text-xs py-6">No notifications found.</p>
                ) : (
                  notifications.map((n: any) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-0.5 border border-transparent ${
                        !n.isRead 
                          ? "bg-[#6b8f84]/5 dark:bg-[#6b8f84]/10 border-l-2 border-l-[#6b8f84] text-zinc-900 dark:text-zinc-100" 
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-400"
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight block">{n.title}</span>
                      <span className="text-[10px] leading-relaxed block truncate max-w-full text-zinc-500 dark:text-zinc-400">{n.body}</span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden text-sm font-medium text-zinc-700 sm:block dark:text-zinc-300 pr-2">
              Admin User
            </span>
            <ChevronDown className="hidden h-4 w-4 text-zinc-400 sm:block pr-2" />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-zinc-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
