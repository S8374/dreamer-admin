"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCreatePromotionPackageMutation, useUpdatePromotionPackageMutation, useGetPromotionPackagesQuery } from "@/lib/redux/api/promotionPackageApi";

interface PromotionPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageItem: any | null;
}

export function PromotionPackageModal({ isOpen, onClose, packageItem }: PromotionPackageModalProps) {
  const [createPackage, { isLoading: isCreating }] = useCreatePromotionPackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePromotionPackageMutation();
  const { data: packagesRes } = useGetPromotionPackagesQuery({ includeInactive: true }, { skip: !isOpen });

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    durationDays: 1,
    price: 0,
    currency: "USD",
    billingType: "month",
    description: "",
    sortOrder: 0,
    isActive: true,
    revenueCatProductId: "",
  });

  useEffect(() => {
    if (packageItem) {
      setFormData({
        code: packageItem.code || "",
        name: packageItem.name || "",
        durationDays: packageItem.durationDays || 1,
        price: packageItem.price || 0,
        currency: packageItem.currency || "USD",
        billingType: packageItem.billingType || "month",
        description: packageItem.description || "",
        sortOrder: packageItem.sortOrder || 0,
        isActive: packageItem.isActive !== undefined ? packageItem.isActive : true,
      });
    } else {
      const packagesList = packagesRes?.data || packagesRes || [];
      const currentCount = Array.isArray(packagesList) ? packagesList.length : packagesList.data?.length || 0;
      setFormData({
        code: `PROMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        name: "",
        durationDays: 1,
        price: 0,
        currency: "USD",
        billingType: "month",
        description: "",
        sortOrder: currentCount + 1,
        isActive: true,
      });
    }
  }, [packageItem, isOpen, packagesRes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (packageItem) {
        await updatePackage({ id: packageItem.id, body: formData }).unwrap();
        toast.success("Promotion package updated successfully");
      } else {
        await createPackage(formData).unwrap();
        toast.success("Promotion package created successfully");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save promotion package");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {packageItem ? "Edit Promotion Package" : "Create Promotion Package"}
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="promotion-package-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, code: `PROMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}` })}
                    className="px-3 py-2 text-sm font-medium text-[#6b8f84] bg-[#6b8f84]/10 rounded-xl hover:bg-[#6b8f84]/20 transition-colors whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                  placeholder="e.g. 1 Month Promotion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  required
                  disabled={formData.billingType === "month"}
                  value={formData.billingType === "month" ? 30 : formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                  className={`w-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84] ${formData.billingType === "month" ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-zinc-50 dark:bg-zinc-950'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Currency</label>
                <input
                  type="text"
                  maxLength={3}
                  value={formData.currency}
                  readOnly
                  className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Billing Type</label>
                <select
                  value={formData.billingType}
                  onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                >
                  <option value="day">Day</option>
                  <option value="month">Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Sort Order</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
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

            <div className="pt-2">
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
            form="promotion-package-form"
            disabled={isCreating || isUpdating}
            className="px-4 py-2 text-sm font-medium text-white bg-[#6b8f84] rounded-xl hover:bg-[#5a7a70] transition-colors disabled:opacity-50"
          >
            {isCreating || isUpdating ? "Saving..." : "Save Package"}
          </button>
        </div>
      </div>
    </div>
  );
}
