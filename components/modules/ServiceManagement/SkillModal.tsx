"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCreateSkillMutation, useUpdateSkillMutation } from "@/lib/redux/api/serviceApi";
import { toast } from "sonner";

export function SkillModal({ isOpen, onClose, skill, serviceId, nextSortOrder }: { isOpen: boolean, onClose: () => void, skill: any, serviceId: string, nextSortOrder: number }) {
  const [name, setName] = useState("");
  const [nameEs, setNameEs] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  const [createSkill, { isLoading: isCreating }] = useCreateSkillMutation();
  const [updateSkill, { isLoading: isUpdating }] = useUpdateSkillMutation();

  useEffect(() => {
    if (skill) {
      setName(skill.name);
      setNameEs(skill.nameEs || "");
      setSlug(skill.slug || "");
      setSortOrder(skill.sortOrder?.toString() || "0");
      setIsActive(skill.isActive);
      setIsPopular(skill.isPopular);
      setIsSlugManuallyEdited(!!skill.slug);
    } else {
      setName("");
      setNameEs("");
      setSlug("");
      setSortOrder(nextSortOrder.toString());
      setIsActive(true);
      setIsPopular(false);
      setIsSlugManuallyEdited(false);
    }
  }, [skill, isOpen, nextSortOrder]);

  useEffect(() => {
    if (!skill && !isSlugManuallyEdited && name) {
      setSlug(
        name
          .toLowerCase()
          .trim()
          .replace(/["'`]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    } else if (!skill && !isSlugManuallyEdited && !name) {
      setSlug("");
    }
  }, [name, skill, isSlugManuallyEdited]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name,
      nameEs: nameEs || undefined,
      slug: slug || undefined,
      sortOrder: parseInt(sortOrder) || 0,
      isActive,
      isPopular
    };

    try {
      if (skill) {
        await updateSkill({ serviceId, skillSuggestionId: skill.id, body: payload }).unwrap();
        toast.success("Skill updated successfully");
      } else {
        await createSkill({ serviceId, body: payload }).unwrap();
        toast.success("Skill created successfully");
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
            {skill ? "Edit Skill" : "Add New Skill"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-2">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Skill Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
                placeholder="e.g. 3D Logo Design"
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
              placeholder="e.g. 3d-logo (auto-generates)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84]"
              />
            </div>
            
            <div className="flex flex-col justify-center gap-3 mt-4">
              <label className="flex items-center cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-[#6b8f84] focus:ring-[#6b8f84]"
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Active Status</span>
              </label>

              <label className="flex items-center cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mark as Popular</span>
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
              {isCreating || isUpdating ? "Saving..." : "Save Skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
