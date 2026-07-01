"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Calendar, 
  Tag, 
  User, 
  MapPin, 
  Clock, 
  Sparkles,
  Edit,
  Star
} from "lucide-react";
import { 
  useGetListingsQuery,
  useAdminUpdateListingMutation,
  useAdminDeleteListingMutation
} from "@/lib/redux/api/listingApi";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

export default function ListingsManagementPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  // Selected listing for details modal
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  
  // Modal for changing listing status
  const [statusChangeListing, setStatusChangeListing] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState("active");

  const { data, isLoading, isFetching, refetch } = useGetListingsQuery({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter,
    sort: sortBy
  });

  const [updateListing, { isLoading: isUpdating }] = useAdminUpdateListingMutation();
  const [deleteListing, { isLoading: isDeleting }] = useAdminDeleteListingMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusUpdate = async (listingId: string, statusValue: string) => {
    try {
      await updateListing({ 
        listingId, 
        body: { status: statusValue } 
      }).unwrap();
      toast.success(`Listing status updated to ${statusValue}`);
      setStatusChangeListing(null);
      // Update selected listing in view if open
      if (selectedListing && selectedListing.id === listingId) {
        setSelectedListing({ ...selectedListing, status: statusValue });
      }
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update listing status");
    }
  };

  const handleToggleFeatured = async (listing: any) => {
    try {
      const updatedFeatured = !listing.isFeatured;
      await updateListing({
        listingId: listing.id,
        body: { isFeatured: updatedFeatured }
      }).unwrap();
      toast.success(updatedFeatured ? "Listing set to Featured!" : "Listing removed from Featured.");
      if (selectedListing && selectedListing.id === listing.id) {
        setSelectedListing({ ...selectedListing, isFeatured: updatedFeatured });
      }
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to toggle featured status");
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this listing? This action cannot be undone.")) return;
    try {
      await deleteListing(listingId).unwrap();
      toast.success("Listing deleted successfully");
      setSelectedListing(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete listing");
    }
  };

  const listings = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };
  const totalListings = pagination.total || 0;
  const totalPages = pagination.totalPages || 1;

  // Render status badge helper
  const renderStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      ongoing: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      completed: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
      archived: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50",
      deleted: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[status] || "bg-zinc-50 border-zinc-200"}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Listing Management</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor and moderate marketplace service listings, toggle featured statuses, and manage active offers.
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search listings, users, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] transition-all text-zinc-900 dark:text-white"
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
              <option value="deleted">Deleted</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] text-zinc-800 dark:text-zinc-200"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="boosted">Sort: Boosted / Promoted</option>
            </select>
          </div>
        </div>

        {/* Desktop Table Content */}
        <div className="hidden md:block flex-1 overflow-x-auto scrollbar-none">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Listing Details</th>
                <th className="px-6 py-4 font-medium w-48">Owner</th>
                <th className="px-6 py-4 font-medium w-32">Status</th>
                <th className="px-6 py-4 font-medium w-36">Created Date</th>
                <th className="px-6 py-4 font-medium text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <div className="h-6 w-6 border-2 border-[#6b8f84] border-t-transparent rounded-full animate-spin" />
                      Loading listings...
                    </div>
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No listings found matching your criteria.
                  </td>
                </tr>
              ) : (
                listings.map((listing: any) => (
                  <tr key={listing.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* Title & Preview Image */}
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex items-center gap-3 w-full">
                        <div className="h-10 w-10 relative rounded-lg bg-zinc-100 dark:bg-zinc-850 overflow-hidden flex-shrink-0 border border-zinc-200/50">
                          {listing.images && listing.images[0] ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-zinc-400">
                              <Tag className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-zinc-950 dark:text-zinc-50 truncate">
                            {listing.title}
                          </div>
                          <div className="text-xs text-zinc-500 truncate mt-0.5">
                            {listing.description}
                          </div>
                          <div className="flex flex-wrap gap-1.5 items-center mt-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                              {listing.category}
                            </span>
                            {listing.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold border border-yellow-200 dark:border-yellow-500/25">
                                <Sparkles className="h-2.5 w-2.5" /> Featured
                              </span>
                            )}
                            {(listing.activeBoost || listing.isBoosted) && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200 dark:border-indigo-500/25">
                                Boosted
                              </span>
                            )}
                            {(listing.activePromotion || listing.isPromoted) && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-[10px] font-bold border border-violet-200 dark:border-violet-500/25">
                                Promoted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {listing.user?.avatarUrl ? (
                          <img
                            src={listing.user.avatarUrl}
                            alt={listing.user.fullName || "User"}
                            className="h-6 w-6 rounded-full object-cover border border-zinc-200"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                            <User className="h-3 w-3" />
                          </div>
                        )}
                        <div className="truncate max-w-[150px]">
                          <div className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold truncate">
                            {listing.user?.fullName || "Unknown Submitter"}
                          </div>
                          <div className="text-zinc-400 text-[10px] truncate">
                            {listing.user?.email || "No Email"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {renderStatusBadge(listing.status)}
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/listings-management/${listing.id}`}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setStatusChangeListing(listing);
                            setNewStatus(listing.status);
                          }}
                          className="p-1.5 text-[#6b8f84] hover:bg-[#6b8f84]/10 rounded-lg transition-colors"
                          title="Change Status"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
                Loading listings...
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              No listings found matching your criteria.
            </div>
          ) : (
            listings.map((listing: any) => (
              <div key={listing.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm relative">
                {/* Title & Preview Image */}
                <div className="flex items-start gap-3 w-full border-b border-zinc-100 dark:border-zinc-800/50 pb-3 mb-3">
                  <div className="h-12 w-12 relative rounded-lg bg-zinc-100 dark:bg-zinc-850 overflow-hidden flex-shrink-0 border border-zinc-200/50">
                    {listing.images && listing.images[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-400">
                        <Tag className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-zinc-950 dark:text-zinc-50 truncate">
                      {listing.title}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate mt-0.5 max-w-[200px]">
                      {listing.description}
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center mt-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        {listing.category}
                      </span>
                      {listing.isFeatured && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold border border-yellow-200 dark:border-yellow-500/25">
                          <Sparkles className="h-2.5 w-2.5" /> Featured
                        </span>
                      )}
                      {(listing.activeBoost || listing.isBoosted) && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200 dark:border-indigo-500/25">
                          Boosted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {/* Owner */}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Owner</span>
                    <div className="flex items-center gap-2">
                      {listing.user?.avatarUrl ? (
                        <img
                          src={listing.user.avatarUrl}
                          alt={listing.user.fullName || "User"}
                          className="h-5 w-5 rounded-full object-cover border border-zinc-200"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                          <User className="h-3 w-3" />
                        </div>
                      )}
                      <div className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold truncate max-w-[100px]">
                        {listing.user?.fullName || "Unknown"}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1">Status</span>
                    {renderStatusBadge(listing.status)}
                  </div>
                </div>

                {/* Actions & Date */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/listings-management/${listing.id}`}
                      className="p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        setStatusChangeListing(listing);
                        setNewStatus(listing.status);
                      }}
                      className="p-1.5 text-[#6b8f84] hover:bg-[#6b8f84]/10 rounded-lg transition-colors"
                      title="Change Status"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page}</span> of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalPages || 1}</span> ({totalListings || 0} total listings)
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                // Logic to show pages around current page
                let pageNum = i + 1;
                if ((totalPages || 1) > 5 && page > 3) {
                  pageNum = page - 3 + i + (page + 1 >= (totalPages || 1) ? -1 : 0);
                  pageNum = Math.min(pageNum, (totalPages || 1) - 4 + i);
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 text-xs font-semibold rounded-lg transition-colors ${
                      page === pageNum
                        ? "bg-[#6b8f84] text-white"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page >= (totalPages || 1)}
              onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
              className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>


      {/* Change Status Modal */}
      {statusChangeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Modify Listing Status
              </h3>
              <button
                onClick={() => setStatusChangeListing(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-500">
              Change status for: <strong className="text-zinc-700 dark:text-zinc-300">{statusChangeListing.title}</strong>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 block">Select Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b8f84] text-zinc-900 dark:text-white"
              >
                <option value="active">Active (Visible to Users)</option>
                <option value="ongoing">Ongoing (Offer Accepted)</option>
                <option value="completed">Completed (Exchange Finalized)</option>
                <option value="archived">Archived (Soft Hidden)</option>
                <option value="deleted">Deleted (Moderation Ban)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusChangeListing(null)}
                className="px-4 py-2 border border-zinc-250 dark:border-zinc-850 hover:bg-zinc-50 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(statusChangeListing.id, newStatus)}
                disabled={isUpdating}
                className="px-4 py-2 bg-[#6b8f84] text-white rounded-xl text-xs font-medium hover:bg-[#688a7f] transition-all disabled:opacity-50"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
