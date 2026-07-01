"use client";

import { useState } from "react";
import { Search, Plus, MoreVertical, Edit2, Trash2, CheckCircle2, XCircle, Power, ChevronLeft, ChevronRight, List } from "lucide-react";
import { toast } from "sonner";
import { useGetPromotionPackagesQuery, useDeletePromotionPackageMutation, useSetPromotionPackageStatusMutation } from "@/lib/redux/api/promotionPackageApi";
import { useRouter } from "next/navigation";
import { PromotionPackageModal } from "./PromotionPackageModal";

export function PromotionPackageTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);

  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useGetPromotionPackagesQuery({
    page,
    limit,
    includeInactive: true,
  });

  const [deletePackage] = useDeletePromotionPackageMutation();
  const [setStatus] = useSetPromotionPackageStatusMutation();

  const handleEdit = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await setStatus({ id, isActive: !currentStatus }).unwrap();
      toast.success(`Package ${!currentStatus ? "activated" : "deactivated"} successfully`);
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this promotion package?")) return;
    try {
      await deletePackage(id).unwrap();
      toast.success("Promotion package deleted successfully");
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to delete promotion package");
    }
  };

  const openCreateModal = () => {
    setSelectedPackage(null);
    setIsModalOpen(true);
  };

  const packages = data?.data || [];
  
  const filteredPackages = packages.filter((pkg: any) => 
    pkg.name.toLowerCase().includes(search.toLowerCase()) || 
    pkg.code.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Search packages..."
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
          Create Package
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Code & Name</th>
              <th className="px-6 py-4 font-medium">Duration</th>
              <th className="px-6 py-4 font-medium">Price</th>
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
                    Loading packages...
                  </div>
                </td>
              </tr>
            ) : filteredPackages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No promotion packages found.
                </td>
              </tr>
            ) : (
              filteredPackages.map((pkg: any, index: number) => (
                <tr key={pkg.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{pkg.name}</div>
                    <div className="text-xs text-zinc-500">{pkg.code}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {pkg.durationDays} Days
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-900 dark:text-zinc-100">{pkg.price} {pkg.currency}</div>
                    <div className="text-xs text-zinc-500 capitalize">{pkg.billingType}ly</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5">
                      {pkg.isActive ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <span className={pkg.isActive ? "text-green-700" : "text-red-700"}>{pkg.isActive ? "Active" : "Inactive"}</span>
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right relative ${activeMenu === pkg.id ? 'z-50' : 'z-10'}`}>
                    <button 
                      onClick={() => setActiveMenu(activeMenu === pkg.id ? null : pkg.id)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenu === pkg.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                        <div className={`absolute right-8 ${index >= 7 ? 'bottom-8' : 'top-10'} z-50 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden py-1`}>
                          <button 
                            onClick={() => router.push(`/promotion-management/${pkg.id}`)} 
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 font-medium"
                          >
                            <List className="h-4 w-4" /> Manage Features
                          </button>
                          
                          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                          <button onClick={() => handleEdit(pkg)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                            <Edit2 className="h-4 w-4" /> Edit Package
                          </button>
                          
                          <button onClick={() => handleToggleStatus(pkg.id, pkg.isActive)} className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 ${pkg.isActive ? 'text-red-600' : 'text-green-600'}`}>
                            <Power className="h-4 w-4" /> {pkg.isActive ? "Deactivate" : "Activate"}
                          </button>

                          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                          <button onClick={() => handleDelete(pkg.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2">
                            <Trash2 className="h-4 w-4" /> Delete Package
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

      {/* Mobile Card View */}
      <div className="block md:hidden flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
        {isLoading || isFetching ? (
          <div className="py-12 text-center text-zinc-500">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="h-6 w-6 border-2 border-[#6b8f84] border-t-transparent rounded-full animate-spin" />
              Loading packages...
            </div>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            No promotion packages found.
          </div>
        ) : (
          filteredPackages.map((pkg: any, index: number) => (
            <div key={pkg.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm relative">
              <div className="flex justify-between items-start mb-3 border-b border-zinc-100 dark:border-zinc-800/50 pb-3">
                <div className="pr-8">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">{pkg.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{pkg.code}</div>
                </div>
                
                <div className="absolute right-3 top-3">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === pkg.id ? null : pkg.id)}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {activeMenu === pkg.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                      <div className="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden py-1">
                        <button 
                          onClick={() => router.push(`/promotion-management/${pkg.id}`)} 
                          className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 font-medium"
                        >
                          <List className="h-4 w-4" /> Manage Features
                        </button>
                        
                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

                        <button onClick={() => handleEdit(pkg)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                          <Edit2 className="h-4 w-4" /> Edit Package
                        </button>
                        
                        <button onClick={() => handleToggleStatus(pkg.id, pkg.isActive)} className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 ${pkg.isActive ? 'text-red-600' : 'text-green-600'}`}>
                          <Power className="h-4 w-4" /> {pkg.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                        <button onClick={() => handleDelete(pkg.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2">
                          <Trash2 className="h-4 w-4" /> Delete Package
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Duration</span>
                  <span className="text-zinc-600 dark:text-zinc-400 text-xs">{pkg.durationDays} Days</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Status</span>
                  <span className="flex items-center gap-1.5 text-xs">
                    {pkg.isActive ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                    <span className={pkg.isActive ? "text-green-700 font-medium" : "text-red-700 font-medium"}>{pkg.isActive ? "Active" : "Inactive"}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Price</span>
                  <div className="text-zinc-900 dark:text-zinc-100 font-medium text-xs">{pkg.price} {pkg.currency}</div>
                  <div className="text-[10px] text-zinc-500 capitalize">{pkg.billingType}ly</div>
                </div>
              </div>
            </div>
          ))
        )}
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

      <PromotionPackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageItem={selectedPackage}
      />
    </div>
  );
}
