"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldAlert, 
  ExternalLink, 
  MessageSquare, 
  User, 
  CheckCircle2, 
  Clock, 
  X, 
  Calendar,
  AlertTriangle,
  Loader2,
  FileText
} from "lucide-react";
import { useGetReportByIdQuery, useResolveReportMutation } from "@/lib/redux/api/reportApi";
import { toast } from "sonner";
import Link from "next/link";

const categoriesMap: Record<string, string> = {
  inappropriate_behavior: "Inappropriate Behavior",
  fraudulent_activity: "Fraudulent Activity",
  harassment: "Harassment",
  scam: "Scam",
  offensive_content: "Offensive Content",
  spam: "Spam",
  other: "Other",
};

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: response, isLoading, refetch } = useGetReportByIdQuery(id);
  const [resolveReport, { isLoading: isResolving }] = useResolveReportMutation();

  const report = response?.data;
  const chatHistory = report?.chatHistory || [];

  const handleAction = async (action: "action_taken" | "dismissed") => {
    try {
      await resolveReport({
        id,
        action,
        reviewNotes: reviewNotes.trim() ? reviewNotes.trim() : undefined,
      }).unwrap();

      toast.success(`Report has been resolved as ${action.replace("_", " ")}`);
      refetch();
      router.push("/reports-management");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to resolve report");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6b8f84]" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Report not found</h2>
        <Link href="/reports-management" className="text-[#6b8f84] hover:underline mt-2 inline-block">
          Go back to reports list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation & Page title */}
      <div className="flex flex-col gap-2">
        <Link 
          href="/reports-management" 
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-amber-500" />
              Report Review: {categoriesMap[report.category] || report.category}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Submitted on {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              report.status === "open" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
              report.status === "action_taken" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
              "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400"
            }`}>
              {report.status === "open" && <Clock className="h-3.5 w-3.5 animate-pulse" />}
              {report.status === "action_taken" && <CheckCircle2 className="h-3.5 w-3.5" />}
              {report.status === "dismissed" && <X className="h-3.5 w-3.5" />}
              {report.status.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Report info & Chat History */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Report Details */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Report Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Subject</span>
                <p className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{report.issueTitle}</p>
              </div>
              
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Description / Details</span>
                <p className="text-sm bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800 leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
                  {report.description}
                </p>
              </div>

              {report.proofFileUrl && (
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Uploaded Proof Attachment</span>
                  <div className="flex flex-col gap-3">
                    <a
                      href={report.proofFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b8f84] hover:underline bg-[#6b8f84]/10 px-4 py-2.5 rounded-xl border border-[#6b8f84]/20 transition-all w-fit"
                    >
                      <ExternalLink className="h-4 w-4" /> Open Full Proof Attachment
                    </a>
                    {/* Render Image preview directly if it's likely an image */}
                    <div className="max-w-[400px] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
                      <img src={report.proofFileUrl} alt="Proof" className="w-full h-auto object-contain max-h-[300px]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat History Viewport */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-zinc-500" /> Chat History logs
              </h2>
              <span className="text-xs font-semibold text-zinc-400">
                {chatHistory.length} messages found
              </span>
            </div>

            {chatHistory.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 flex flex-col items-center gap-2">
                <MessageSquare className="h-10 w-10 text-zinc-300" />
                <p className="text-sm font-medium">No chat history exists between these two users.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                {chatHistory.map((message: any) => {
                  const isReporterSender = message.senderId === report.reporterId;
                  const senderName = isReporterSender 
                    ? report.reporter?.fullName 
                    : report.reportedUser?.fullName;

                  return (
                    <div 
                      key={message.id} 
                      className={`flex flex-col gap-1 max-w-[80%] ${
                        isReporterSender ? "mr-auto" : "ml-auto items-end"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                        <span>{senderName}</span>
                        <span>•</span>
                        <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                        isReporterSender 
                          ? "bg-zinc-100 text-zinc-800 rounded-tl-none dark:bg-zinc-800 dark:text-zinc-100" 
                          : "bg-[#6b8f84]/15 text-zinc-900 rounded-tr-none dark:bg-[#6b8f84]/30 dark:text-zinc-50"
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Moderation Actions & Profiles */}
        <div className="lg:col-span-4 space-y-6">

          {/* Involved Users */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Involved Parties
            </h3>

            {/* Reported User */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Reported Account</span>
              <div className="flex items-start gap-3">
                <img
                  src={report.reportedUser?.avatarUrl || "https://placehold.co/100x100/png"}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover border border-zinc-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
                    {report.reportedUser?.fullName || "Unnamed User"}
                  </div>
                  <div className="text-xs text-zinc-500">{report.reportedUser?.email}</div>
                  <div className="flex gap-2.5 items-center mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {report.reportedUser?.role}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold ${
                      report.reportedUser?.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30" : "bg-red-100 text-red-800"
                    }`}>
                      {report.reportedUser?.status}
                    </span>
                  </div>
                </div>
              </div>
              <Link 
                href={`/details-user/${report.reportedUserId}`}
                className="w-full h-10 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-zinc-600 dark:text-zinc-300 mt-2"
              >
                <User className="w-3.5 h-3.5" /> View User Profile
              </Link>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* Reporter */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Reporter</span>
              <div className="flex items-start gap-3">
                <img
                  src={report.reporter?.avatarUrl || "https://placehold.co/100x100/png"}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover border border-zinc-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
                    {report.reporter?.fullName || "Unnamed User"}
                  </div>
                  <div className="text-xs text-zinc-500">{report.reporter?.email}</div>
                  <div className="flex gap-2.5 items-center mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold ${
                      report.reporter?.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30" : "bg-red-100 text-red-800"
                    }`}>
                      {report.reporter?.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Moderator Panel */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Moderator Action Panel
            </h3>

            {report.status === "open" ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Moderator Action Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Provide details about the resolution or reasons..."
                    className="w-full min-h-[100px] p-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-[#6b8f84] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAction("action_taken")}
                    disabled={isResolving}
                    className="w-full py-2.5 bg-[#6b8f84] hover:bg-[#587a70] text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Take Action (Resolve)
                  </button>
                  <button
                    onClick={() => handleAction("dismissed")}
                    disabled={isResolving}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Dismiss Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-zinc-500 font-medium">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    This report has been resolved.
                  </div>
                  <div>
                    <span className="text-zinc-400 block uppercase tracking-wider text-[10px] font-bold">Reviewer</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{report.reviewedBy?.fullName || "Admin"}</span>
                  </div>
                  {report.reviewNotes && (
                    <div>
                      <span className="text-zinc-400 block uppercase tracking-wider text-[10px] font-bold">Action Notes</span>
                      <p className="text-zinc-800 dark:text-zinc-200 italic mt-0.5 whitespace-pre-line bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800">{report.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
