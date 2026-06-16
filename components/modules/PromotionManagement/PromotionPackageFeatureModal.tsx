"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { 
  useCreatePromotionPackageFeatureMutation, 
  useUpdatePromotionPackageFeatureMutation 
} from "@/lib/redux/api/promotionPackageApi";

interface PromotionPackageFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: any | null;
  promotionPackageId: string;
  nextSortOrder: number;
}

export function PromotionPackageFeatureModal({ isOpen, onClose, feature, promotionPackageId, nextSortOrder }: PromotionPackageFeatureModalProps) {
  const [createFeature, { isLoading: isCreating }] = useCreatePromotionPackageFeatureMutation();
  const [updateFeature, { isLoading: isUpdating }] = useUpdatePromotionPackageFeatureMutation();

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    iconKey: "",
    sortOrder: 0,
  });

  useEffect(() => {
    if (feature) {
      setFormData({
        code: feature.code || "",
        title: feature.title || "",
        description: feature.description || "",
        iconKey: feature.iconKey || "",
        sortOrder: feature.sortOrder || 0,
      });
    } else {
      setFormData({
        code: "",
        title: "",
        description: "",
        iconKey: "",
        sortOrder: nextSortOrder,
      });
    }
  }, [feature, isOpen, nextSortOrder]);

  // Auto-generate code from title if creating a new feature and code is empty
  useEffect(() => {
    if (!feature && formData.title && !formData.code) {
      const generatedCode = formData.title
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .substring(0, 50);
      setFormData((prev) => ({ ...prev, code: generatedCode }));
    }
  }, [formData.title, feature]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.iconKey) delete (payload as any).iconKey;

      if (feature) {
        await updateFeature({
          packageId: promotionPackageId,
          featureId: feature.id,
          body: payload,
        }).unwrap();
        toast.success("Feature updated successfully");
      } else {
        await createFeature({
          packageId: promotionPackageId,
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
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Feature Code (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "") })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                    placeholder="e.g. FEATURED_LISTING"
                  />
                  <button
                    type="button"
                    onClick={() => {
                       const baseText = formData.title || "FEATURE_" + Math.random().toString(36).substring(2, 8);
                       const generated = baseText.toUpperCase().replace(/[^A-Z0-9\s_]/g, "").trim().replace(/\s+/g, "_").substring(0, 50);
                       setFormData((prev) => ({ ...prev, code: generated }));
                    }}
                    className="px-3 py-2 text-xs font-medium text-[#6b8f84] bg-[#6b8f84]/10 rounded-xl hover:bg-[#6b8f84]/20 whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                  placeholder="e.g. Featured Listings"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84] min-h-[100px]"
                  placeholder="e.g. Your listing will appear at the top."
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Icon Key (Optional)</label>
              <input
                type="text"
                value={formData.iconKey}
                onChange={(e) => setFormData({ ...formData, iconKey: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                placeholder="e.g. star"
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
