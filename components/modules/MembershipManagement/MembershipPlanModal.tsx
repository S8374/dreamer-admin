"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCreateMembershipPlanMutation, useUpdateMembershipPlanMutation } from "@/lib/redux/api/membershipPlanApi";

interface MembershipPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any | null;
}

export function MembershipPlanModal({ isOpen, onClose, plan }: MembershipPlanModalProps) {
  const [createPlan, { isLoading: isCreating }] = useCreateMembershipPlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateMembershipPlanMutation();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    tier: "FREE",
    monthlyPrice: 0,
    yearlyPrice: null as number | null,
    trialDays: 0,
    description: "",
    revenueCatProductId: "",
    isFeaturedMember: false,
    isPopular: false,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        code: plan.code || "",
        name: plan.name || "",
        tier: plan.tier || "FREE",
        monthlyPrice: plan.monthlyPrice || 0,
        yearlyPrice: plan.yearlyPrice !== null ? plan.yearlyPrice : null,
        trialDays: plan.trialDays || 0,
        description: plan.description || "",
        revenueCatProductId: plan.revenueCatProductId || "",
        isFeaturedMember: plan.isFeaturedMember || false,
        isPopular: plan.isPopular || false,
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        sortOrder: plan.sortOrder || 0,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        tier: "FREE",
        monthlyPrice: 0,
        yearlyPrice: null,
        trialDays: 0,
        description: "",
        revenueCatProductId: "",
        isFeaturedMember: false,
        isPopular: false,
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        yearlyPrice: formData.yearlyPrice === null || formData.yearlyPrice === 0 ? null : formData.yearlyPrice,
      };

      if (plan) {
        await updatePlan({ id: plan.id, body: payload }).unwrap();
        toast.success("Membership plan updated successfully");
      } else {
        await createPlan(payload).unwrap();
        toast.success("Membership plan created successfully");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save membership plan");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {plan ? "Edit Membership Plan" : "Create Membership Plan"}
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="membership-plan-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                  placeholder="e.g. basic-plan"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                  placeholder="e.g. Basic Membership"
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
              >
                <option value="FREE">FREE</option>
                <option value="SILVER">SILVER</option>
                <option value="GOLD">GOLD</option>
                <option value="PLATINUM">PLATINUM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Monthly Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Yearly Price (Optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.yearlyPrice || ""}
                onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Trial Days</label>
              <input
                type="number"
                min="0"
                value={formData.trialDays}
                onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Sort Order</label>
              <input
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">RevenueCat Product ID</label>
              <input
                type="text"
                value={formData.revenueCatProductId}
                onChange={(e) => setFormData({ ...formData, revenueCatProductId: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84] min-h-[80px]"
            />
          </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.isFeaturedMember}
                  onChange={(e) => setFormData({ ...formData, isFeaturedMember: e.target.checked })}
                  className="rounded text-[#6b8f84] focus:ring-[#6b8f84]"
                />
                Featured Member
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded text-[#6b8f84] focus:ring-[#6b8f84]"
                />
                Popular Plan
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-[#6b8f84] focus:ring-[#6b8f84]"
                />
                Active
              </label>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="membership-plan-form"
            disabled={isCreating || isUpdating}
            className="px-4 py-2 text-sm font-medium text-white bg-[#6b8f84] rounded-xl hover:bg-[#5a7a70] transition-colors disabled:opacity-50"
          >
            {isCreating || isUpdating ? "Saving..." : "Save Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
