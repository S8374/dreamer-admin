"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCreateServiceMutation, useUpdateServiceMutation } from "@/lib/redux/api/serviceApi";
import { toast } from "sonner";

export function ServiceModal({ isOpen, onClose, service, nextSortOrder }: { isOpen: boolean, onClose: () => void, service: any, nextSortOrder: number }) {
  const [name, setName] = useState("");
  const [nameEs, setNameEs] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [descriptionEs, setDescriptionEs] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [existingIcon, setExistingIcon] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();

  useEffect(() => {
    if (service) {
      setName(service.name);
      setNameEs(service.nameEs || "");
      setSlug(service.slug || "");
      setDescription(service.description || "");
      setDescriptionEs(service.descriptionEs || "");
      setExistingIcon(service.icon || "");
      setIconFile(null);
      setSortOrder(service.sortOrder?.toString() || "");
      setIsActive(service.isActive);
      setIsSlugManuallyEdited(!!service.slug);
    } else {
      setName("");
      setNameEs("");
      setSlug("");
      setDescription("");
      setDescriptionEs("");
      setExistingIcon("");
      setIconFile(null);
      setSortOrder(nextSortOrder.toString());
      setIsActive(true);
      setIsSlugManuallyEdited(false);
    }
  }, [service, isOpen, nextSortOrder]);

  useEffect(() => {
    if (!service && !isSlugManuallyEdited && name) {
      setSlug(
        name
          .toLowerCase()
          .trim()
          .replace(/["'`]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    } else if (!service && !isSlugManuallyEdited && !name) {
      setSlug("");
    }
  }, [name, service, isSlugManuallyEdited]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("name", name);
    if (nameEs) formData.append("nameEs", nameEs);
    if (slug) formData.append("slug", slug);
    if (description) formData.append("description", description);
    if (descriptionEs) formData.append("descriptionEs", descriptionEs);
    
    const parsedSortOrder = parseInt(sortOrder);
    if (!isNaN(parsedSortOrder) && parsedSortOrder !== 0) {
      formData.append("sortOrder", parsedSortOrder.toString());
    }
    
    formData.append("isActive", isActive.toString());
    
    if (iconFile) {
      formData.append("icon", iconFile);
    }

    try {
      if (service) {
        await updateService({ serviceId: service.id, body: formData }).unwrap();
        toast.success("Service updated successfully");
      } else {
        await createService(formData).unwrap();
        toast.success("Service created successfully");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {service ? "Edit Service" : "Create New Service"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-2">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Service Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                placeholder="e.g. Logo Design"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setIsSlugManuallyEdited(true);
              }}
              disabled
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-500 cursor-not-allowed focus:outline-none"
              placeholder="e.g. logo-design (auto-generates)"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] min-h-[100px]"
                placeholder="Brief description..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Service Icon (Image/SVG)</label>
            <div className="flex items-center gap-4">
              {existingIcon && !iconFile && (
                <div className="h-10 w-10 shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src={existingIcon} alt="Current Icon" className="h-full w-full object-cover" />
                </div>
              )}
              {iconFile && (
                <div className="h-10 w-10 shrink-0 bg-[#6b8f84]/20 rounded-xl flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-bold text-[#6b8f84]">NEW</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*,.svg"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#6b8f84]/10 file:text-[#6b8f84] hover:file:bg-[#6b8f84]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Sort Order (Auto-generates if empty)</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                placeholder="Auto"
              />
            </div>
            
            <div className="flex items-center mt-6">
              <label className="flex items-center cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-[#6b8f84] focus:ring-[#6b8f84]"
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Active Status</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex-1 px-4 py-2 bg-[#6b8f84] hover:bg-[#5a7a70] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isCreating || isUpdating ? "Saving..." : "Save Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
