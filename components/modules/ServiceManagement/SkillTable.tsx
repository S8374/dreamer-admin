"use client";

import { useState, useEffect } from "react";
import { Search, Plus, MoreVertical, Edit, Trash2, Power, PowerOff, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  useGetServiceSkillsQuery, 
  useUpdateSkillMutation, 
  useDeleteSkillMutation 
} from "@/lib/redux/api/serviceApi";
import { toast } from "sonner";
import { SkillModal } from "./SkillModal";

export function SkillTable({ serviceId }: { serviceId: string }) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);

  const { data, isLoading, isFetching } = useGetServiceSkillsQuery({
    serviceId,
    page,
    limit,
    search: debouncedSearch,
    includeInactive: true
  });

  const [updateSkill] = useUpdateSkillMutation();
  const [deleteSkill] = useDeleteSkillMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateSkill({ serviceId, skillSuggestionId: id, body: { isActive: !currentStatus } }).unwrap();
      toast.success(`Skill ${!currentStatus ? "activated" : "deactivated"} successfully`);
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleTogglePopular = async (id: string, currentStatus: boolean) => {
    try {
      await updateSkill({ serviceId, skillSuggestionId: id, body: { isPopular: !currentStatus } }).unwrap();
      toast.success(`Skill marked as ${!currentStatus ? "popular" : "normal"} successfully`);
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to update popularity");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    try {
      await deleteSkill({ serviceId, skillSuggestionId: id }).unwrap();
      toast.success("Skill deleted successfully");
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to delete skill");
    }
  };

  const openCreateModal = () => {
    setEditingSkill(null);
    setIsModalOpen(true);
  };

  const openEditModal = (skill: any) => {
    setEditingSkill(skill);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const skills = data?.data || [];
  const totalPages = data?.meta?.pagination?.totalPages || 1;
  const maxSortOrder = skills.length > 0 ? Math.max(...skills.map((s: any) => s.sortOrder || 0)) : 0;
  const nextSortOrder = maxSortOrder + 1;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] transition-all"
          />
        </div>
        
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2 bg-[#6b8f84] hover:bg-[#5a7a70] text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Skill
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Skill Name</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium text-center">Sort Order</th>
              <th className="px-6 py-4 font-medium">Popularity</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="h-6 w-6 border-2 border-[#6b8f84] border-t-transparent rounded-full animate-spin" />
                    Loading skills...
                  </div>
                </td>
              </tr>
            ) : skills.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No skills found for this service.
                </td>
              </tr>
            ) : (
              skills.map((skill: any) => (
                <tr key={skill.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                    {skill.name}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{skill.slug}</td>
                  <td className="px-6 py-4 text-center text-zinc-500 font-mono">{skill.sortOrder}</td>
                  <td className="px-6 py-4">
                    {skill.isPopular ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Star className="w-3 h-3 mr-1 fill-amber-500" /> Popular
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      skill.isActive ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {skill.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === skill.id ? null : skill.id)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenu === skill.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-8 top-10 z-20 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden py-1">
                          
                          <button onClick={() => handleTogglePopular(skill.id, skill.isPopular)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 flex items-center gap-2">
                            <Star className={`h-4 w-4 ${skill.isPopular ? 'text-zinc-400' : 'text-amber-500'}`} /> 
                            {skill.isPopular ? "Remove Popular" : "Make Popular"}
                          </button>
                          
                          <div className="h-px bg-zinc-200 my-1" />

                          <button onClick={() => openEditModal(skill)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 flex items-center gap-2">
                            <Edit className="h-4 w-4" /> Edit Skill
                          </button>
                          
                          <button onClick={() => handleToggleActive(skill.id, skill.isActive)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 flex items-center gap-2">
                            {skill.isActive ? <><PowerOff className="h-4 w-4" /> Deactivate</> : <><Power className="h-4 w-4 text-green-600" /> Activate</>}
                          </button>
                          
                          <div className="h-px bg-zinc-200 my-1" />
                          
                          <button onClick={() => handleDelete(skill.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                            <Trash2 className="h-4 w-4" /> Delete Skill
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
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
        <span className="text-sm text-zinc-500">
          Showing page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-500"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <SkillModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        skill={editingSkill} 
        serviceId={serviceId}
        nextSortOrder={nextSortOrder}
      />
    </div>
  );
}
