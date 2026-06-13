"use client";

import { useState, useEffect } from "react";
import { Search, MoreVertical, ShieldAlert, ShieldCheck, UserX, Trash2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  useGetUsersQuery, 
  useUpdateUserStatusMutation, 
  useUpdateUserRoleMutation, 
  useDeleteUserMutation 
} from "@/lib/redux/api/userApi";
import { toast } from "sonner";
import Image from "next/image";

export function UserTable() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    page,
    limit,
    search: debouncedSearch,
    role: roleFilter,
    status: statusFilter
  });

  const [updateStatus] = useUpdateUserStatusMutation();
  const [updateRole] = useUpdateUserRoleMutation();
  const [deleteUser] = useDeleteUserMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`User status updated to ${status}`);
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await updateRole({ id, role }).unwrap();
      toast.success(`User role updated to ${role}`);
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await deleteUser({ id }).unwrap();
      toast.success("User deleted successfully");
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const users = data?.data?.users || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] transition-all"
          />
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending_verification">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="h-6 w-6 border-2 border-[#6b8f84] border-t-transparent rounded-full animate-spin" />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No users found matching your filters.
                </td>
              </tr>
            ) : (
              users.map((user: any, index: number) => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatarUrl || "https://placehold.co/100x100/png"} 
                        alt="" 
                        className="h-10 w-10 rounded-full object-cover border border-zinc-200"
                      />
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          {user.fullName || "Unnamed User"}
                          {user.isEmailVerified && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                        </div>
                        <div className="text-xs text-zinc-500">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-900 dark:text-zinc-100">{user.email}</div>
                    <div className="text-xs text-zinc-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 
                      user.status === 'suspended' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 text-right relative ${activeMenu === user.id ? 'z-50' : 'z-10'}`}>
                    <button 
                      onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {/* Action Dropdown Menu */}
                    {activeMenu === user.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                        <div className={`absolute right-8 ${index >= 7 ? 'bottom-8' : 'top-10'} z-50 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden py-1`}>
                          {user.status === 'active' ? (
                            <button onClick={() => handleStatusChange(user.id, 'suspended')} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-zinc-50 flex items-center gap-2">
                              <UserX className="h-4 w-4" /> Suspend User
                            </button>
                          ) : (
                            <button onClick={() => handleStatusChange(user.id, 'active')} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-zinc-50 flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4" /> Activate User
                            </button>
                          )}
                          
                          {user.role === 'user' ? (
                            <button onClick={() => handleRoleChange(user.id, 'admin')} className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-zinc-50 flex items-center gap-2">
                              <ShieldAlert className="h-4 w-4" /> Make Admin
                            </button>
                          ) : (
                            <button onClick={() => handleRoleChange(user.id, 'user')} className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-zinc-50 flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4" /> Remove Admin
                            </button>
                          )}
                          
                          <div className="h-px bg-zinc-200 my-1" />
                          
                          <button onClick={() => handleDelete(user.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                            <Trash2 className="h-4 w-4" /> Delete Account
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50">
        <span className="text-sm text-zinc-500">
          Showing page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
