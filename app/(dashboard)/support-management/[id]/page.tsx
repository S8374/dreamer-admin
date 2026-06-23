"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MessageSquare, 
  ExternalLink, 
  User, 
  CheckCircle2, 
  Clock, 
  X, 
  Calendar,
  AlertTriangle,
  Loader2,
  FileText,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { useGetTicketByIdQuery, useUpdateTicketStatusMutation } from "@/lib/redux/api/supportApi";
import { useAdminSendMessageMutation } from "@/lib/redux/api/userApi";
import { toast } from "sonner";
import Link from "next/link";

export default function SupportTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"chats" | "orders">("chats");
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: response, isLoading, refetch } = useGetTicketByIdQuery(id);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateTicketStatusMutation();
  const [adminSendMessage, { isLoading: isSending }] = useAdminSendMessageMutation();

  const ticket = response?.data;
  const userOrders = ticket?.userOrders || [];
  const userChats = ticket?.userChats || [];

  const activeConversation = selectedConversation 
    ? userChats.find((c: any) => c.id === selectedConversation.id) || selectedConversation
    : null;

  const handleStatusChange = async (status: "in_progress" | "resolved" | "closed") => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Ticket status updated to ${status.replace("_", " ")}`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update ticket status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6b8f84]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Support ticket not found</h2>
        <Link href="/support-management" className="text-[#6b8f84] hover:underline mt-2 inline-block">
          Go back to tickets list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link & Title */}
      <div className="flex flex-col gap-2">
        <Link 
          href="/support-management" 
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Support Tickets
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-[#6b8f84]" />
              Support Ticket: {ticket.subject}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Issue Type: <span className="font-semibold capitalize">{ticket.issueType.replace("_", " ")}</span> • Submitted on {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {ticket.isPriority && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400 border border-red-200">
                <AlertTriangle className="h-3.5 w-3.5" /> Priority Support
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              ticket.status === "open" ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400" :
              ticket.status === "in_progress" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
              "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            }`}>
              {ticket.status === "open" && <Clock className="h-3.5 w-3.5 animate-pulse" />}
              {ticket.status === "in_progress" && <Clock className="h-3.5 w-3.5" />}
              {ticket.status === "resolved" && <CheckCircle2 className="h-3.5 w-3.5" />}
              {ticket.status === "closed" && <X className="h-3.5 w-3.5" />}
              {ticket.status.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Submitter Ticket details & Tabs (Chats/Orders) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Submitter message */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Submitter Inquiry</h2>
            <div className="space-y-4">
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Message</span>
                <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line">
                  {ticket.message}
                </p>
              </div>

              {ticket.attachment && (
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Screenshot Attachment</span>
                  <div className="flex flex-col gap-3">
                    <a
                      href={ticket.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b8f84] hover:underline bg-[#6b8f84]/10 px-4 py-2.5 rounded-xl border border-[#6b8f84]/20 transition-all w-fit"
                    >
                      <ExternalLink className="h-4 w-4" /> Open Full Screenshot
                    </a>
                    <div className="max-w-[400px] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
                      <img src={ticket.attachment} alt="Attachment" className="w-full h-auto object-contain max-h-[300px]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details Tabs (Conversations & Orders) */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            {/* Tabs Selector Header */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <button
                onClick={() => { setActiveTab("chats"); setSelectedConversation(null); }}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "chats" 
                    ? "border-[#6b8f84] text-[#6b8f84]" 
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Conversations / Chat Logs
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === "orders" 
                    ? "border-[#6b8f84] text-[#6b8f84]" 
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Order History ({userOrders.length})
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 flex-1 flex flex-col">
              
              {/* CHATS TAB */}
              {activeTab === "chats" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
                  
                  {/* Conversations list (Left side of tab) */}
                  <div className="md:col-span-4 border-r border-zinc-150 dark:border-zinc-800 pr-4 space-y-2 max-h-[450px] overflow-y-auto">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">User Conversations</span>
                    {userChats.length === 0 ? (
                      <p className="text-xs text-zinc-400">No active conversations found.</p>
                    ) : (
                      userChats.map((chat: any) => {
                        const isSubmitterHost = chat.hostId === ticket.userId;
                        const peer = isSubmitterHost ? chat.guest : chat.host;
                        const isSelected = selectedConversation?.id === chat.id;

                        return (
                          <button
                            key={chat.id}
                            onClick={() => setSelectedConversation(chat)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                              isSelected 
                                ? "bg-[#6b8f84]/10 border-[#6b8f84] text-zinc-950 dark:text-white" 
                                : "bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                            }`}
                          >
                            <img
                              src={peer?.avatarUrl || "https://placehold.co/100x100/png"}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                            <div className="truncate">
                              <div className="font-semibold text-xs leading-none mb-0.5">{peer?.fullName || "Unnamed User"}</div>
                              <span className="text-[10px] text-zinc-400 truncate block">
                                {chat.messages[chat.messages.length - 1]?.content || "No messages"}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Selected Chat Log viewport (Right side of tab) */}
                  <div className="md:col-span-8 flex flex-col min-h-[300px] max-h-[450px]">
                    {activeConversation ? (
                      <div className="flex flex-col h-full flex-1">
                        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                          <img
                            src={
                              (activeConversation.hostId === ticket.userId 
                                ? activeConversation.guest?.avatarUrl 
                                : activeConversation.host?.avatarUrl) || "https://placehold.co/100x100/png"
                            }
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <span className="text-xs font-bold block leading-none">
                              Chat with {activeConversation.hostId === ticket.userId 
                                ? activeConversation.guest?.fullName 
                                : activeConversation.host?.fullName}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              Updated {new Date(activeConversation.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Messages logs view */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin mb-4">
                          {activeConversation.messages.map((message: any) => {
                            const isSubmitterSender = message.senderId === ticket.userId;
                            const senderName = isSubmitterSender 
                              ? ticket.user?.fullName 
                              : (activeConversation.hostId === ticket.userId 
                                  ? activeConversation.guest?.fullName 
                                  : activeConversation.host?.fullName);

                            return (
                              <div 
                                key={message.id} 
                                className={`flex flex-col gap-1 max-w-[85%] ${
                                  isSubmitterSender ? "mr-auto" : "ml-auto items-end"
                                }`}
                              >
                                <span className="text-[10px] text-zinc-400 font-semibold px-1">
                                  {senderName} • {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                  isSubmitterSender 
                                    ? "bg-zinc-100 text-zinc-800 rounded-tl-none dark:bg-zinc-855 dark:text-zinc-100" 
                                    : "bg-[#6b8f84]/15 text-zinc-900 rounded-tr-none dark:bg-[#6b8f84]/30 dark:text-zinc-50"
                                }`}>
                                  {message.content}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Admin Message Send Input Form */}
                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!messageText.trim()) return;
                            try {
                              await adminSendMessage({ conversationId: activeConversation.id, content: messageText }).unwrap();
                              setMessageText("");
                              toast.success("Message sent successfully");
                              refetch();
                            } catch (err: any) {
                              toast.error(err?.data?.message || "Failed to send message");
                            }
                          }}
                          className="border-t border-zinc-200 dark:border-zinc-850 pt-3 flex gap-2"
                        >
                          <input 
                            type="text" 
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type an official admin message to interfere..."
                            disabled={isSending}
                            className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 focus:outline-hidden focus:border-[#6b8f84] transition-colors"
                          />
                          <button 
                            type="submit" 
                            disabled={isSending || !messageText.trim()}
                            className="px-4 py-2 bg-[#6b8f84] hover:bg-[#587a70] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors shrink-0"
                          >
                            {isSending ? "Sending..." : "Send"}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 text-zinc-400 gap-2">
                        <MessageSquare className="h-8 w-8 text-zinc-300" />
                        <span className="text-xs font-medium">Select a conversation from the left to view logs</span>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Involved Transactions / Orders</span>
                  {userOrders.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 flex flex-col items-center gap-2">
                      <Briefcase className="h-8 w-8 text-zinc-300" />
                      <span className="text-xs font-medium">No order history found for this user.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userOrders.map((order: any) => {
                        const isSubmitterSender = order.senderId === ticket.userId;

                        return (
                          <div 
                            key={order.id} 
                            className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-3 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold bg-[#6b8f84]/10 text-[#6b8f84] px-2 py-0.5 rounded-full uppercase">
                                {isSubmitterSender ? "Sent Offer" : "Received Offer"}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold ${
                                order.status === "completed" ? "bg-green-100 text-green-800" :
                                order.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                              <div>
                                <span className="font-semibold block text-[10px] text-zinc-400">Offer Detail</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{order.whatYouBring || "Trade Offer"}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <div>
                                  <span className="font-semibold block text-[10px] text-zinc-400">Client / Sender</span>
                                  <span>{order.sender?.fullName}</span>
                                </div>
                                <div>
                                  <span className="font-semibold block text-[10px] text-zinc-400">Receiver</span>
                                  <span>{order.receiver?.fullName}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-800 flex justify-between items-center">
                              <span>ID: {order.id.slice(0, 8)}...</span>
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Submitter Profile & Action Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Submitter User profile card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Submitter Profile
            </h3>

            {ticket.user ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={ticket.user.avatarUrl || "https://placehold.co/100x100/png"}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover border border-zinc-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
                      {ticket.user.fullName || ticket.name}
                    </div>
                    <div className="text-xs text-zinc-500">{ticket.user.email}</div>
                    <div className="flex gap-2.5 items-center mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold ${
                        ticket.user.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30" : "bg-red-100 text-red-800"
                      }`}>
                        {ticket.user.status}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Joined {new Date(ticket.user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/details-user/${ticket.userId}`}
                  className="w-full h-10 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-zinc-600 dark:text-zinc-300 mt-2"
                >
                  <User className="w-3.5 h-3.5" /> View User Profile
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">{ticket.name}</div>
                <div className="text-xs text-zinc-400">Guest submission (No account linked)</div>
              </div>
            )}
          </div>

          {/* Action resolution panel */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-2">
              Action Panel
            </h3>

            <div className="flex flex-col gap-2">
              {ticket.status !== "in_progress" && ticket.status !== "resolved" && ticket.status !== "closed" && (
                <button
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={isUpdating}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                  Mark In Progress
                </button>
              )}

              {ticket.status !== "resolved" && (
                <button
                  onClick={() => handleStatusChange("resolved")}
                  disabled={isUpdating}
                  className="w-full py-2.5 bg-[#6b8f84] hover:bg-[#587a70] text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Mark Resolved
                </button>
              )}

              {ticket.status !== "closed" && (
                <button
                  onClick={() => handleStatusChange("closed")}
                  disabled={isUpdating}
                  className="w-full py-2.5 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Close Ticket
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
