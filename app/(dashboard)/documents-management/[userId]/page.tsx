"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, FileText, CheckCircle, XCircle, Clock, ExternalLink, MapPin, Mail, Phone, Calendar, Star, Briefcase, Award } from "lucide-react";
import { useGetUserByIdQuery } from "@/lib/redux/api/userApi";
import { useUpdateVerificationStatusMutation } from "@/lib/redux/api/documentApi";
import { toast } from "sonner";
import Link from "next/link";

export default function DocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [activeTab, setActiveTab] = useState<"personal" | "expertise" | "documents">("documents");

  const { data, isLoading } = useGetUserByIdQuery(userId);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateVerificationStatusMutation();

  const user = data?.data;

  const handleStatusUpdate = async (status: string) => {
    try {
      await updateStatus({ userId, status }).unwrap();
      toast.success(`Document status marked as ${status}`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-40 w-full bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">User not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-[#6b8f84] hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "text-green-600 bg-green-100";
      case "rejected": return "text-red-600 bg-red-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      default: return "text-zinc-600 bg-zinc-100";
    }
  };

  return (
    <div className="space-y-6  mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link 
          href="/documents-management" 
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-zinc-500" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex flex-wrap items-center gap-2 sm:gap-3">
            Review Documents
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${getStatusColor(user.isDocVerified)}`}>
              {user.isDocVerified}
            </span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Review identity and professional documents for {user.fullName || user.email}</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 shadow-sm">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.fullName || "User"} className="h-20 w-20 rounded-full object-cover border border-zinc-200" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl font-medium text-zinc-500">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?')}
          </div>
        )}
        <div className="flex-1 w-full">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{user.fullName || "Unnamed User"}</h2>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-start justify-center sm:justify-start gap-2 sm:gap-4 mt-3 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> <span className="truncate max-w-[200px] sm:max-w-none">{user.email}</span></span>
            {user.phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {user.phone}</span>}
            {user.city && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {user.city}</span>}
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 flex gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "documents" 
              ? "border-[#6b8f84] text-[#6b8f84]" 
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <FileText className="h-4 w-4" /> Document Verification
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "personal" 
              ? "border-[#6b8f84] text-[#6b8f84]" 
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <User className="h-4 w-4" /> Personal Details
        </button>
        <button
          onClick={() => setActiveTab("expertise")}
          className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "expertise" 
              ? "border-[#6b8f84] text-[#6b8f84]" 
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          <Briefcase className="h-4 w-4" /> Expertise & Skills
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "personal" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Role</p>
                <p className="font-medium capitalize text-zinc-900 dark:text-zinc-100">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Account Status</p>
                <p className="font-medium capitalize text-zinc-900 dark:text-zinc-100">{user.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Email Verified</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.isEmailVerified ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Pro Member</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.isPro ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Featured Member</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.isFeaturedMember ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Language</p>
                <p className="font-medium uppercase text-zinc-900 dark:text-zinc-100">{user.language || "EN"}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Stripe Customer</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.stripeCustomerId ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 mb-1">Heard About Us</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.hearedAboutUs || "N/A"}</p>
              </div>
            </div>
          </div>
          
          {user.bio && (
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Bio</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-4xl">{user.bio}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "expertise" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Professional Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Primary Service Category</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.service || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Skills & Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills && user.skills.length > 0 ? (
                      user.skills.map((skill: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-[#6b8f84]/10 text-[#6b8f84] rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-400 text-sm">No skills listed</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Current Needs</p>
                  <div className="flex flex-wrap gap-2">
                    {user.needs && user.needs.length > 0 ? (
                      user.needs.map((need: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm font-medium">
                          {need}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-400 text-sm">No needs listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Reputation & Badges</h3>
              <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <Star className="h-6 w-6 fill-current" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">{user.rating.toFixed(1)}</p>
                    <p className="text-xs text-zinc-500">{user.reviewCount} Reviews</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white">{user.badges?.length || 0}</p>
                    <p className="text-xs text-zinc-500">Badges</p>
                  </div>
                </div>
              </div>
              
              {user.badges && user.badges.length > 0 && (
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Earned Badges</p>
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map((badge: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-medium">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {user.workedSampleFileUrl && user.workedSampleFileUrl.length > 0 && (
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Work Samples</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {user.workedSampleFileUrl.map((url: string, index: number) => (
                  <a 
                    key={`sample-${index}`} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="aspect-square bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-[#6b8f84] transition-colors group relative"
                  >
                    <img src={url} alt={`Work Sample ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="h-6 w-6 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {user.portfolios && user.portfolios.length > 0 && (
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Portfolio Files</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {user.portfolios.map((portfolio: any) => (
                  <a 
                    key={portfolio.id} 
                    href={portfolio.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="aspect-square bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-[#6b8f84] transition-colors group relative"
                  >
                    {portfolio.fileUrl.toLowerCase().endsWith('.pdf') ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
                        <FileText className="h-10 w-10 text-zinc-400 mb-2" />
                        <span className="text-xs text-zinc-500 font-medium">PDF File</span>
                      </div>
                    ) : (
                      <img src={portfolio.fileUrl} alt="Portfolio" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="h-6 w-6 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              Review the documents below to verify this user's identity and professional credentials.
            </p>
            <div className="flex flex-wrap md:flex-nowrap gap-2 sm:gap-3 w-full md:w-auto">
              <button
                onClick={() => handleStatusUpdate("pending")}
                disabled={isUpdating || user.isDocVerified === "pending"}
                className="flex-1 md:flex-none justify-center px-4 sm:px-5 py-2.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-xl text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Clock className="h-4 w-4 shrink-0" /> <span className="truncate">Mark Pending</span>
              </button>
              <button
                onClick={() => handleStatusUpdate("rejected")}
                disabled={isUpdating || user.isDocVerified === "rejected"}
                className="flex-1 md:flex-none justify-center px-4 sm:px-5 py-2.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <XCircle className="h-4 w-4 shrink-0" /> <span className="truncate">Reject</span>
              </button>
              <button
                onClick={() => handleStatusUpdate("verified")}
                disabled={isUpdating || user.isDocVerified === "verified"}
                className="w-full md:w-auto justify-center px-4 sm:px-5 py-2.5 bg-[#6b8f84] text-white hover:bg-[#5a7a70] rounded-xl text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 shrink-0" /> <span className="truncate">Approve & Verify</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ID Document */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Government ID
                </h3>
                {user.idType && <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">{user.idType}</span>}
              </div>
              
              <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800">
                {user.idFileUrl && user.idFileUrl.length > 0 ? (
                  <>
                    <div className="w-full flex justify-end p-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <a href={user.idFileUrl[0]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Open Full Screen <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="w-full h-[500px] flex items-center justify-center p-2">
                      {user.idFileUrl[0].toLowerCase().endsWith('.pdf') ? (
                        <iframe src={user.idFileUrl[0]} className="w-full h-full rounded-lg" title="ID Document" />
                      ) : (
                        <img src={user.idFileUrl[0]} alt="ID Document" className="max-h-full max-w-full object-contain rounded-lg" />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-zinc-400 text-sm">
                    No Government ID provided
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Document */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Professional Certificate
                </h3>
                {user.certificateType && <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">{user.certificateType}</span>}
              </div>
              
              <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800">
                {user.certFileUrl && user.certFileUrl.length > 0 ? (
                  <>
                    <div className="w-full flex justify-end p-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                      <a href={user.certFileUrl[0]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Open Full Screen <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="w-full h-[500px] flex items-center justify-center p-2">
                      {user.certFileUrl[0].toLowerCase().endsWith('.pdf') ? (
                        <iframe src={user.certFileUrl[0]} className="w-full h-full rounded-lg" title="Certificate Document" />
                      ) : (
                        <img src={user.certFileUrl[0]} alt="Certificate Document" className="max-h-full max-w-full object-contain rounded-lg" />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-zinc-400 text-sm">
                    No Certificate provided
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
