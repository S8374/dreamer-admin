"use client";

import { useState } from "react";
import { useGrantMembershipPlanAccessMutation, useGetMembershipPlansQuery } from "@/lib/redux/api/membershipPlanApi";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AssignMembershipModalProps {
  user: any;
  onClose: () => void;
}

export function AssignMembershipModal({ user, onClose }: AssignMembershipModalProps) {
  const { data: plansData, isLoading: plansLoading } = useGetMembershipPlansQuery({});
  const [grantMembership, { isLoading: isGranting }] = useGrantMembershipPlanAccessMutation();
  
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [durationDays, setDurationDays] = useState(30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    try {
      await grantMembership({
        userId: user.id,
        membershipPlanId: selectedPlanId,
        durationDays: Number(durationDays),
      }).unwrap();
      
      toast.success("Membership granted successfully!");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to grant membership");
    }
  };

  const plans = Array.isArray(plansData?.data) 
    ? plansData.data 
    : plansData?.data?.plans || plansData?.data?.data || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Assign Membership</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 overflow-y-auto">
          {/* User Info */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Target User</label>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#6b8f84]/10 text-[#6b8f84] font-bold">
                      {user.fullName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user.fullName || "Unnamed User"}</span>
                  <span className="text-xs text-zinc-500 truncate">{user.email}</span>
                </div>
            </div>
          </div>

          {/* Plan Selection */}
          <div className="flex flex-col gap-2">
            <label htmlFor="plan" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Membership Plan</label>
            <select
              id="plan"
              required
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full h-11 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
            >
              <option value="" disabled>Select a plan...</option>
              {plans.map((plan: any) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.tier}) - ${plan.monthlyPrice}/mo
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-2">
            <label htmlFor="duration" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Duration (Days)</label>
            <input
              id="duration"
              type="number"
              min="1"
              required
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full h-11 px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] text-zinc-900 dark:text-zinc-100"
            />
            <p className="text-xs text-zinc-500">How many days will this membership be active?</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGranting || plansLoading || !selectedPlanId}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#6b8f84] text-white hover:bg-[#5a7a70] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
            >
              {isGranting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Grant Membership"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
