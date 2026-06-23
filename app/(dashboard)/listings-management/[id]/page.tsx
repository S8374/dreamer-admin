"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Tag, 
  User, 
  MapPin, 
  Clock, 
  Sparkles, 
  Trash2, 
  Calendar,
  Eye,
  Loader2,
  ExternalLink,
  TrendingUp
} from "lucide-react";
import { 
  useGetListingByIdQuery,
  useAdminUpdateListingMutation,
  useAdminDeleteListingMutation
} from "@/lib/redux/api/listingApi";
import { toast } from "sonner";
import Link from "next/link";

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: response, isLoading, refetch } = useGetListingByIdQuery(id);
  const [updateListing, { isLoading: isUpdating }] = useAdminUpdateListingMutation();
  const [deleteListing, { isLoading: isDeleting }] = useAdminDeleteListingMutation();

  const listing = response?.data || response;

  const handleStatusChange = async (statusValue: string) => {
    try {
      await updateListing({ 
        listingId: id, 
        body: { status: statusValue } 
      }).unwrap();
      toast.success(`Listing status updated to ${statusValue}`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update listing status");
    }
  };

  const handleToggleFeatured = async () => {
    if (!listing) return;
    try {
      const updatedFeatured = !listing.isFeatured;
      await updateListing({
        listingId: id,
        body: { isFeatured: updatedFeatured }
      }).unwrap();
      toast.success(updatedFeatured ? "Listing set to Featured!" : "Listing removed from Featured.");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to toggle featured status");
    }
  };

  const handleToggleBoost = async () => {
    if (!listing) return;
    try {
      const updatedBoosted = !listing.isBoosted;
      await updateListing({
        listingId: id,
        body: { 
          isBoosted: updatedBoosted,
          boostedAt: updatedBoosted ? new Date().toISOString() : null,
          boostedUntil: updatedBoosted ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
          isPromoted: updatedBoosted,
          promotedUntil: updatedBoosted ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        }
      }).unwrap();
      toast.success(updatedBoosted ? "Listing Boosted successfully (30 days)!" : "Listing Boost removed.");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to toggle boost status");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this listing? This action cannot be undone.")) return;
    try {
      await deleteListing(id).unwrap();
      toast.success("Listing deleted successfully");
      router.push("/listings-management");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete listing");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6b8f84]" />
      </div>
    );
  }

  if (!listing || !listing.title) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Listing not found</h2>
        <Link href="/listings-management" className="text-[#6b8f84] hover:underline mt-2 inline-block">
          Go back to listing list
        </Link>
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      ongoing: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      completed: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
      archived: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50",
      deleted: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[status] || "bg-zinc-50 border-zinc-200"}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Link 
          href="/listings-management" 
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Listing Management
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Tag className="h-6 w-6 text-[#6b8f84]" />
              {listing.title}
            </h1>
            <p className="text-zinc-550 dark:text-zinc-400 text-xs mt-1">
              Listing ID: <span className="font-mono">{listing.id}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {listing.isFeatured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-750 border border-yellow-250 dark:bg-yellow-500/10 dark:text-yellow-400">
                <Sparkles className="h-3.5 w-3.5" /> Featured Listing
              </span>
            )}
            {listing.isBoosted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-750 border border-indigo-250 dark:bg-indigo-500/10 dark:text-indigo-400">
                <TrendingUp className="h-3.5 w-3.5" /> Boosted Listing
              </span>
            )}
            {renderStatusBadge(listing.status)}
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Data Details Table */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Listing Specification & Information Sheet</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <tbody>
                  {/* Submitter Info Row */}
                  <tr className="border-b border-zinc-150 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 w-1/4 bg-zinc-50/30 dark:bg-zinc-950/20">Submitter / Owner</td>
                    <td className="px-6 py-4">
                      {listing.user ? (
                        <div className="flex items-center gap-3">
                          {listing.user.avatarUrl ? (
                            <img
                              src={listing.user.avatarUrl}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover border border-zinc-200 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                              <User className="h-5 w-5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              {listing.user.fullName}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#6b8f84]/15 text-[#6b8f84] font-bold">
                                {listing.user.membershipTier}
                              </span>
                            </div>
                            <div className="text-xs text-zinc-500 truncate mt-0.5">{listing.user.email}</div>
                          </div>
                          <Link 
                            href={`/details-user/${listing.userId}`}
                            className="text-xs text-[#6b8f84] hover:underline font-semibold flex items-center gap-1 shrink-0 ml-4 border border-[#6b8f84]/20 hover:bg-[#6b8f84]/5 px-3 py-1.5 rounded-xl transition-all"
                          >
                            Profile <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ) : (
                        <span className="text-zinc-400">Loading owner...</span>
                      )}
                    </td>
                  </tr>

                  {/* Category Row */}
                  <tr className="border-b border-zinc-150 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/20">Category</td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {listing.category}
                    </td>
                  </tr>

                  {/* Exchange Wanted Row */}
                  <tr className="border-b border-zinc-150 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/20">Exchanging For</td>
                    <td className="px-6 py-4 font-semibold text-[#6b8f84] dark:text-[#7ba397]">
                      {listing.neededService || "Flexible Exchange"}
                    </td>
                  </tr>

                  {/* Preferred Tags Row */}
                  <tr className="border-b border-zinc-150 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/20">Preferred Tags</td>
                    <td className="px-6 py-4">
                      {listing.PreferredExchangeTags && listing.PreferredExchangeTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {listing.PreferredExchangeTags.map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md font-medium border border-zinc-200/40 dark:border-zinc-700/30">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">No Tags Selected</span>
                      )}
                    </td>
                  </tr>

                  {/* Timeline Row */}
                  <tr className="border-b border-zinc-150 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/20">Timeline / Due Date</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        {listing.timeline || "Flexible"}
                      </div>
                    </td>
                  </tr>

                  {/* Location Row */}
                  <tr className="border-b border-zinc-150 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/20">Location</td>
                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                        <span>{listing.location || "Not Provided / Remote Exchange"}</span>
                      </div>
                    </td>
                  </tr>

                  {/* Views & Created At Row */}
                  <tr className="border-b border-zinc-150 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/20">Stats & Timeline</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-6 text-zinc-700 dark:text-zinc-300 text-xs">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-zinc-400" /> <strong>{listing.viewCount || 0}</strong> views
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-zinc-400" /> Posted on <strong>{new Date(listing.createdAt).toLocaleDateString()}</strong>
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Description Row */}
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/20 align-top">Description</td>
                    <td className="px-6 py-4 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                      {listing.description}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Media & Moderation Action Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Listing Media Gallery */}
          {listing.images && listing.images.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Listing Media Gallery
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {listing.images.map((img: string, idx: number) => (
                  <a
                    key={idx}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-150 dark:bg-zinc-950 group shadow-xs block"
                  >
                    <img 
                      src={img} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-250" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Moderation Actions Panel */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Moderation Control Panel
            </h3>

            <div className="space-y-4">
              {/* Featured toggle */}
              <button
                onClick={handleToggleFeatured}
                disabled={isUpdating}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  listing.isFeatured
                    ? "bg-yellow-50 text-yellow-750 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400"
                    : "bg-white text-zinc-700 border-zinc-250 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                {listing.isFeatured ? "Remove from Featured" : "Promote to Featured"}
              </button>

              {/* Boost toggle */}
              <button
                onClick={handleToggleBoost}
                disabled={isUpdating}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  listing.isBoosted
                    ? "bg-indigo-50 text-indigo-750 border-indigo-300 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "bg-white text-zinc-700 border-zinc-250 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                {listing.isBoosted ? "Remove Boost" : "Boost Listing (30 Days)"}
              </button>

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Update Status</label>
                <select
                  value={listing.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6b8f84] text-zinc-900 dark:text-white"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="ongoing">Ongoing (Accepted)</option>
                  <option value="completed">Completed (Finalized)</option>
                  <option value="archived">Archived (Hidden)</option>
                  <option value="deleted">Deleted (Moderation Ban)</option>
                </select>
              </div>

              {/* Delete permanently */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Listing Permanently
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
