"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { 
  useCreateMembershipPlanFeatureMutation, 
  useUpdateMembershipPlanFeatureMutation 
} from "@/lib/redux/api/membershipPlanApi";

interface MembershipPlanFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: any | null;
  membershipPlanId: string;
  nextSortOrder: number;
}

export function MembershipPlanFeatureModal({ isOpen, onClose, feature, membershipPlanId, nextSortOrder }: MembershipPlanFeatureModalProps) {
  const [createFeature, { isLoading: isCreating }] = useCreateMembershipPlanFeatureMutation();
  const [updateFeature, { isLoading: isUpdating }] = useUpdateMembershipPlanFeatureMutation();

  const [formData, setFormData] = useState({
    details: "",
    limitValue: null as number | null,
    isUnlimited: false,
    sortOrder: 0,
  });

  useEffect(() => {
    if (feature) {
      setFormData({
        details: feature.details || "",
        limitValue: feature.limitValue !== null ? feature.limitValue : null,
        isUnlimited: feature.isUnlimited || false,
        sortOrder: feature.sortOrder || 0,
      });
    } else {
      setFormData({
        details: "",
        limitValue: null,
        isUnlimited: false,
        sortOrder: nextSortOrder,
      });
    }
  }, [feature, isOpen, nextSortOrder]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        limitValue: formData.isUnlimited ? null : formData.limitValue,
      };

      if (feature) {
        await updateFeature({
          membershipPlanId,
          featureId: feature.id,
          body: payload,
        }).unwrap();
        toast.success("Feature updated successfully");
      } else {
        await createFeature({
          membershipPlanId,
          body: payload,
        }).unwrap();
        toast.success("Feature created successfully");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save feature");
    }
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {feature ? "Edit Feature" : "Create Feature"}
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="feature-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Feature Details</label>
              <textarea
                required
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84] min-h-[100px]"
                placeholder="e.g. Can view premium listings"
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="unlimited"
                checked={formData.isUnlimited}
                onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked, limitValue: e.target.checked ? null : formData.limitValue })}
                className="rounded text-[#6b8f84] focus:ring-[#6b8f84]"
              />
              <label htmlFor="unlimited" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Unlimited Usage
              </label>
            </div>

            {!formData.isUnlimited && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Numeric Limit (Optional)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.limitValue || ""}
                  onChange={(e) => setFormData({ ...formData, limitValue: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                  placeholder="e.g. 5"
                />
              </div>
            )}

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
            form="feature-form"
            disabled={isCreating || isUpdating}
            className="px-4 py-2 text-sm font-medium text-white bg-[#6b8f84] rounded-xl hover:bg-[#5a7a70] transition-colors disabled:opacity-50"
          >
            {isCreating || isUpdating ? "Saving..." : "Save Feature"}
          </button>
        </div>
      </div>
    </div>
  );
}
