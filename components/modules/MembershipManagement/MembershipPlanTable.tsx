"use client";

import { useState } from "react";
import { Search, Plus, MoreVertical, Edit2, Trash2, CheckCircle2, XCircle, List, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useGetMembershipPlansQuery, useDeleteMembershipPlanMutation } from "@/lib/redux/api/membershipPlanApi";
import { useRouter } from "next/navigation";
import { MembershipPlanModal } from "./MembershipPlanModal";

export function MembershipPlanTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useGetMembershipPlansQuery({
    page,
    limit,
    includeInactive: true,
  });

  const [deletePlan] = useDeleteMembershipPlanMutation();

  const handleEdit = (plan: any) => {
    setSelectedPlan(plan);
    setIsPlanModalOpen(true);
    setActiveMenu(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this membership plan?")) return;
    try {
      await deletePlan(id).unwrap();
      toast.success("Membership plan deleted successfully");
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to delete membership plan");
    }
  };

  const openCreateModal = () => {
    setSelectedPlan(null);
    setIsPlanModalOpen(true);
  };

  const plans = data?.data || [];
  
  // Client-side filtering if search is used, since backend might not support it
  const filteredPlans = plans.filter((plan: any) => 
    plan.name.toLowerCase().includes(search.toLowerCase()) || 
    plan.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] transition-all"
          />
        </div>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2 bg-[#6b8f84] text-white rounded-xl text-sm font-medium hover:bg-[#5a7a70] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Plan
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Plan Code & Name</th>
              <th className="px-6 py-4 font-medium">Tier</th>
              <th className="px-6 py-4 font-medium">Pricing</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="h-6 w-6 border-2 border-[#6b8f84] border-t-transparent rounded-full animate-spin" />
                    Loading plans...
                  </div>
                </td>
              </tr>
            ) : filteredPlans.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No membership plans found.
                </td>
              </tr>
            ) : (
              filteredPlans.map((plan: any, index: number) => (
                <tr key={plan.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      {plan.name}
                      {plan.isPopular && <span className="bg-orange-100 text-orange-800 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">Popular</span>}
                    </div>
                    <div className="text-xs text-zinc-500">{plan.code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                      plan.tier === 'PLATINUM' ? 'bg-indigo-100 text-indigo-800' :
                      plan.tier === 'SILVER' ? 'bg-zinc-100 text-zinc-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {plan.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-900 dark:text-zinc-100">${plan.monthlyPrice}/mo</div>
                    {plan.yearlyPrice && <div className="text-xs text-zinc-500">${plan.yearlyPrice}/yr</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5">
                      {plan.isActive ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <span className={plan.isActive ? "text-green-700" : "text-red-700"}>{plan.isActive ? "Active" : "Inactive"}</span>
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right relative ${activeMenu === plan.id ? 'z-50' : 'z-10'}`}>
                    <button 
                      onClick={() => setActiveMenu(activeMenu === plan.id ? null : plan.id)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenu === plan.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                        <div className={`absolute right-8 ${index >= 7 ? 'bottom-8' : 'top-10'} z-50 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden py-1`}>
                          
                          <button 
                            onClick={() => router.push(`/memberships-management/${plan.id}`)} 
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 font-medium"
                          >
                            <List className="h-4 w-4" /> Manage Features
                          </button>
                          
                          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                          <button onClick={() => handleEdit(plan)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                            <Edit2 className="h-4 w-4" /> Edit Plan
                          </button>
                          
                          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                          
                          <button onClick={() => handleDelete(plan.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2">
                            <Trash2 className="h-4 w-4" /> Delete Plan
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

      <MembershipPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
}
