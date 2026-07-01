"use client";

import { useState, useEffect } from "react";
import { Search, Plus, MoreVertical, Edit, Trash2, Power, PowerOff, ListPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  useGetServicesQuery, 
  useUpdateServiceMutation, 
  useDeleteServiceMutation 
} from "@/lib/redux/api/serviceApi";
import { toast } from "sonner";
import { ServiceModal } from "./ServiceModal";
import { useRouter } from "next/navigation";

export function ServiceTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const { data, isLoading, isFetching } = useGetServicesQuery({
    page,
    limit,
    search: debouncedSearch,
    includeInactive: true
  });

  const [updateService] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateService({ serviceId: id, body: { isActive: !currentStatus } }).unwrap();
      toast.success(`Service ${!currentStatus ? "activated" : "deactivated"} successfully`);
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service? This cannot be undone.")) return;
    try {
      await deleteService(id).unwrap();
      toast.success("Service deleted successfully");
      setActiveMenu(null);
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service: any) => {
    setEditingService(service);
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const services = data?.data || [];
  const totalPages = data?.meta?.pagination?.totalPages || 1;
  const maxSortOrder = services.length > 0 ? Math.max(...services.map((s: any) => s.sortOrder || 0)) : 0;
  const nextSortOrder = maxSortOrder + 1;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      {/* Toolbar */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search services..."
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
          Add Service
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block flex-1 overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Service</th>
              <th className="px-6 py-4 font-medium">Slug</th>
              <th className="px-6 py-4 font-medium text-center">Sort Order</th>
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
                    Loading services...
                  </div>
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                  No services found.
                </td>
              </tr>
            ) : (
              services.map((service: any) => (
                <tr key={service.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {service.name}
                    </div>
                    {service.description && (
                      <div className="text-xs text-zinc-500 truncate max-w-xs">
                        {service.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{service.slug}</td>
                  <td className="px-6 py-4 text-center text-zinc-500 font-mono">{service.sortOrder}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.isActive ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === service.id ? null : service.id)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenu === service.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                        <div className="absolute right-8 top-10 z-20 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden py-1">
                          
                          <button 
                            onClick={() => router.push(`/services-management/${service.id}`)} 
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-zinc-50 flex items-center gap-2 font-medium"
                          >
                            <ListPlus className="h-4 w-4" /> Manage Skills
                          </button>
                          
                          <div className="h-px bg-zinc-200 my-1" />

                          <button onClick={() => openEditModal(service)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 flex items-center gap-2">
                            <Edit className="h-4 w-4" /> Edit Service
                          </button>
                          
                          <button onClick={() => handleToggleActive(service.id, service.isActive)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 flex items-center gap-2">
                            {service.isActive ? <><PowerOff className="h-4 w-4" /> Deactivate</> : <><Power className="h-4 w-4 text-green-600" /> Activate</>}
                          </button>
                          
                          <div className="h-px bg-zinc-200 my-1" />
                          
                          <button onClick={() => handleDelete(service.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                            <Trash2 className="h-4 w-4" /> Delete Service
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
              Loading services...
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            No services found.
          </div>
        ) : (
          services.map((service: any) => (
            <div key={service.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm relative">
              <div className="flex justify-between items-start mb-3 border-b border-zinc-100 dark:border-zinc-800/50 pb-3">
                <div className="pr-8">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {service.name}
                  </div>
                  {service.description && (
                    <div className="text-xs text-zinc-500 mt-1 max-w-[200px] line-clamp-2">
                      {service.description}
                    </div>
                  )}
                </div>
                
                <div className="absolute right-3 top-3">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === service.id ? null : service.id)}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {activeMenu === service.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                      <div className="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden py-1">
                        <button 
                          onClick={() => router.push(`/services-management/${service.id}`)} 
                          className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-zinc-50 flex items-center gap-2 font-medium"
                        >
                          <ListPlus className="h-4 w-4" /> Manage Skills
                        </button>
                        
                        <div className="h-px bg-zinc-200 my-1" />

                        <button onClick={() => openEditModal(service)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 flex items-center gap-2">
                          <Edit className="h-4 w-4" /> Edit Service
                        </button>
                        
                        <button onClick={() => handleToggleActive(service.id, service.isActive)} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 flex items-center gap-2">
                          {service.isActive ? <><PowerOff className="h-4 w-4" /> Deactivate</> : <><Power className="h-4 w-4 text-green-600" /> Activate</>}
                        </button>
                        
                        <div className="h-px bg-zinc-200 my-1" />
                        
                        <button onClick={() => handleDelete(service.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">
                          <Trash2 className="h-4 w-4" /> Delete Service
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Slug</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-mono text-xs">{service.slug}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    service.isActive ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Sort Order</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-mono text-xs">{service.sortOrder}</span>
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

      <ServiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        service={editingService} 
        nextSortOrder={nextSortOrder}
      />
    </div>
  );
}
