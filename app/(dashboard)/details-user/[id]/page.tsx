"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Star, List, Settings, CreditCard } from "lucide-react";
import { useGetUserByIdQuery } from "@/lib/redux/api/userApi";

import Image from "next/image";
import { UserListingsTable } from "@/components/modules/UserManagement/UserListingsTable";
import { UserReviewsTable } from "@/components/modules/UserManagement/UserReviewsTable";

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { data, isLoading } = useGetUserByIdQuery(id);
  const [activeTab, setActiveTab] = useState<"listings" | "received_reviews" | "given_reviews" | "subscriptions">("listings");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-[#6b8f84] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const user = data?.data;

  if (!user) {
    return (
      <div className="text-center py-20 text-zinc-500">
        User not found.
      </div>
    );
  }

  return (
    <div className="space-y-6  mx-auto">
      {/* Header section matching the design screenshot (similar to "Back to Services") */}
      <div>
        <button 
          onClick={() => router.push("/user-management")}
          className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Users
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">User Details - {user.fullName || "Unnamed User"}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Manage user profile, listings, and reviews.
        </p>
      </div>

      {/* User Profile Summary */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex items-start gap-6">
        <img 
          src={user.avatarUrl || "https://placehold.co/150x150/png"} 
          alt="Avatar" 
          className="h-24 w-24 rounded-full object-cover border-4 border-zinc-50"
        />
        <div className="space-y-2 flex-1">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{user.fullName || "Unnamed User"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p><span className="font-medium text-zinc-900 dark:text-zinc-300">Email:</span> {user.email}</p>
            <p><span className="font-medium text-zinc-900 dark:text-zinc-300">Phone:</span> {user.phone}</p>
            <p><span className="font-medium text-zinc-900 dark:text-zinc-300">Status:</span> {user.status.replace("_", " ")}</p>
            <p><span className="font-medium text-zinc-900 dark:text-zinc-300">Role:</span> {user.role}</p>
            <p><span className="font-medium text-zinc-900 dark:text-zinc-300">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><span className="font-medium text-zinc-900 dark:text-zinc-300">Rating:</span> {user.rating?.toFixed(1)} / 5 ({user.reviewCount} reviews)</p>
            <p><span className="font-medium text-zinc-900 dark:text-zinc-300">Membership Tier:</span> <span className="uppercase text-indigo-600 font-semibold">{user.membershipTier}</span></p>
            <p><span className="font-medium text-zinc-900 dark:text-zinc-300">Badges:</span> {user.badges?.join(", ") || "None"}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("listings")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "listings"
                ? "border-[#6b8f84] text-[#6b8f84]"
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
            }`}
          >
            <List className="h-4 w-4" />
            Listings
          </button>
          <button
            onClick={() => setActiveTab("received_reviews")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "received_reviews"
                ? "border-[#6b8f84] text-[#6b8f84]"
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
            }`}
          >
            <Star className="h-4 w-4" />
            Received Reviews
          </button>
          <button
            onClick={() => setActiveTab("given_reviews")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "given_reviews"
                ? "border-[#6b8f84] text-[#6b8f84]"
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
            }`}
          >
            <Star className="h-4 w-4" />
            Given Reviews
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "subscriptions"
                ? "border-[#6b8f84] text-[#6b8f84]"
                : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Subscriptions & Boosts
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "listings" && <UserListingsTable userId={id} />}
        {activeTab === "received_reviews" && <UserReviewsTable userId={id} type="received" />}
        {activeTab === "given_reviews" && <UserReviewsTable userId={id} type="given" />}
        {activeTab === "subscriptions" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Active Subscription</h3>
              {user.subscription ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Plan Tier</p>
                    <p className="font-semibold text-zinc-900 dark:text-white uppercase">{user.subscription.tier}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Status</p>
                    <p className="font-semibold text-green-600 capitalize">{user.subscription.status}</p>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-500 mb-1">Renews At</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500">No active subscription found.</p>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Promotion History (Boosts)</h3>
              </div>
              {user.promotionPurchases && user.promotionPurchases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium">
                      <tr>
                        <th className="px-6 py-4">Listing</th>
                        <th className="px-6 py-4">Package</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Started At</th>
                        <th className="px-6 py-4">Ends At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {user.promotionPurchases.map((promo: any) => (
                        <tr key={promo.id}>
                          <td className="px-6 py-4 font-medium">{promo.listing?.title || "Unknown Listing"}</td>
                          <td className="px-6 py-4">{promo.promotionPackage?.name || "Unknown Package"}</td>
                          <td className="px-6 py-4 capitalize">
                            <span className={`px-2 py-1 rounded text-xs ${promo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-800'}`}>
                              {promo.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{new Date(promo.startsAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4">{new Date(promo.endsAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6">
                  <p className="text-zinc-500">No promotion purchases found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
