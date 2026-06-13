"use client";

import { useState } from "react";
import { Search, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { 
  useGetMembershipPlanFeaturesQuery, 
  useDeleteMembershipPlanFeatureMutation 
} from "@/lib/redux/api/membershipPlanApi";
import { MembershipPlanFeatureModal } from "./MembershipPlanFeatureModal";

export function MembershipPlanFeatureTable({ membershipPlanId }: { membershipPlanId: string }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);

  const { data, isLoading, isFetching } = useGetMembershipPlanFeaturesQuery(membershipPlanId);

  const [deleteFeature] = useDeleteMembershipPlanFeatureMutation();

  const handleDelete = async (featureId: string) => {
    if (!window.confirm("Are you sure you want to delete this feature?")) return;
    try {
      await deleteFeature({ membershipPlanId, featureId }).unwrap();
      toast.success("Feature deleted successfully");
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to delete feature");
    }
  };

  const openCreateModal = () => {
    setEditingFeature(null);
    setIsModalOpen(true);
  };

  const openEditModal = (feature: any) => {
    setEditingFeature(feature);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const features = data?.data || [];
  
  const filteredFeatures = features.filter((feature: any) => 
    feature.details.toLowerCase().includes(search.toLowerCase())
  );

  const maxSortOrder = features.length > 0 ? Math.max(...features.map((f: any) => f.sortOrder || 0)) : 0;
  const nextSortOrder = maxSortOrder + 1;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search features..."
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
          Add Feature
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Feature Details</th>
              <th className="px-6 py-4 font-medium">Limit</th>
              <th className="px-6 py-4 font-medium text-center">Sort Order</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="h-6 w-6 border-2 border-[#6b8f84] border-t-transparent rounded-full animate-spin" />
                    Loading features...
                  </div>
                </td>
              </tr>
            ) : filteredFeatures.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  No features found for this membership plan.
                </td>
              </tr>
            ) : (
              filteredFeatures.map((feature: any) => (
                <tr key={feature.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap max-w-md">
                      {feature.details}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {feature.isUnlimited ? "Unlimited" : feature.limitValue !== null ? `Limit: ${feature.limitValue}` : "No limit specified"}
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-500 font-mono">{feature.sortOrder}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === feature.id ? null : feature.id)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenu === feature.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-8 top-10 z-20 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden py-1">
                          
                          <button onClick={() => openEditModal(feature)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 flex items-center gap-2">
                            <Edit2 className="h-4 w-4" /> Edit Feature
                          </button>
                          
                          <div className="h-px bg-zinc-200 my-1" />
                          
                          <button onClick={() => handleDelete(feature.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                            <Trash2 className="h-4 w-4" /> Delete Feature
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

      <MembershipPlanFeatureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        feature={editingFeature} 
        membershipPlanId={membershipPlanId}
        nextSortOrder={nextSortOrder}
      />
    </div>
  );
}
