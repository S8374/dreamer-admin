"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  User, 
  Star, 
  List, 
  CreditCard, 
  MessageSquare, 
  Briefcase, 
  Clock, 
  Calendar,
  ExternalLink,
  ChevronRight,
  Shield
} from "lucide-react";
import { useGetUserByIdQuery, useAdminSendMessageMutation } from "@/lib/redux/api/userApi";
import Link from "next/link";
import { UserListingsTable } from "@/components/modules/UserManagement/UserListingsTable";
import { UserReviewsTable } from "@/components/modules/UserManagement/UserReviewsTable";
import { toast } from "sonner";

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { data, isLoading, refetch } = useGetUserByIdQuery(id);
  const user = data?.data;

  const [activeTab, setActiveTab] = useState<
    "listings" | "offers" | "received_reviews" | "given_reviews" | "chats" | "subscriptions"
  >("listings");
  
  // Selected conversation state for chats tab
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");
  const [adminSendMessage, { isLoading: isSending }] = useAdminSendMessageMutation();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [peerTypingUser, setPeerTypingUser] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Combine host and guest conversations, then sort by updatedAt desc
  const allConversations = user
    ? [
        ...(user.conversationsHost || []),
        ...(user.conversationsGuest || [])
      ].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    : [];

  // Find active conversation to ensure it has updated messages
  const activeConversation = selectedConversation 
    ? allConversations.find((c: any) => c.id === selectedConversation.id) || selectedConversation
    : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages?.length, peerTypingUser]);

  useEffect(() => {
    if (activeTab !== "chats") return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isUnmounted = false;

    const connect = () => {
      if (isUnmounted) return;
      const wsUrl = `ws://localhost:3030/messages/ws?userId=${id}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Admin WebSocket Connected");
        if (selectedConversation?.id) {
          ws?.send(JSON.stringify({ event: "conversation:join", data: { conversationId: selectedConversation.id } }));
        }
      };

      ws.onmessage = (msg) => {
        try {
          const payload = JSON.parse(msg.data);
          const { event, data } = payload;

          if (event === "presence:update" && data?.onlineUsers) {
            setOnlineUsers(data.onlineUsers);
          }

          if (event === "typing:start") {
            if (data.conversationId === selectedConversation?.id) {
              setPeerTypingUser(data.userId);
            }
          }

          if (event === "typing:stop") {
            if (data.conversationId === selectedConversation?.id) {
              setPeerTypingUser(null);
            }
          }

          if (["message:new", "message:sent", "message:read", "message:updated", "message:deleted"].includes(event)) {
            refetch();
          }
        } catch (err) {
          console.error("Failed to parse websocket message", err);
        }
      };

      ws.onclose = () => {
        console.log("Admin WebSocket Disconnected");
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(() => {
            connect();
          }, 3000);
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [activeTab, selectedConversation?.id, refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin h-8 w-8 border-4 border-[#6b8f84] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-zinc-500">
        User not found.
      </div>
    );
  }

  // Combine requested (sent) and provided (received) offer requests
  const sentOffers = user.requestedOrders || [];
  const receivedOffers = user.providedOrders || [];

  return (
    <div className="space-y-6 mx-auto">
      {/* Header section */}
      <div>
        <button 
          onClick={() => router.push("/user-management")}
          className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Users
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          User Details - {user.fullName || "Unnamed User"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Moderate user profiles, check active offers, review listings, and inspect conversation logs.
        </p>
      </div>

      {/* User Profile Summary Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt="Avatar" 
            className="h-24 w-24 rounded-full object-cover border-4 border-zinc-100 dark:border-zinc-800 shrink-0"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border-4 border-zinc-50 dark:border-zinc-800 shrink-0">
            <User className="h-12 w-12" />
          </div>
        )}
        <div className="space-y-2 flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{user.fullName || "Unnamed User"}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold w-fit mx-auto md:mx-0 ${
              user.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-250 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400"
            }`}>
              {user.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400 pt-1">
            <p><span className="font-semibold text-zinc-900 dark:text-zinc-300">Email:</span> {user.email}</p>
            <p><span className="font-semibold text-zinc-900 dark:text-zinc-300">Phone:</span> {user.phone || "Not Provided"}</p>
            <p><span className="font-semibold text-zinc-900 dark:text-zinc-300">Role:</span> <span className="capitalize">{user.role}</span></p>
            <p><span className="font-semibold text-zinc-900 dark:text-zinc-300">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><span className="font-semibold text-zinc-900 dark:text-zinc-300">Rating:</span> {user.rating?.toFixed(1)} / 5 ({user.reviewCount} reviews)</p>
            <p><span className="font-semibold text-zinc-900 dark:text-zinc-300">Membership Tier:</span> <span className="uppercase text-[#6b8f84] font-bold">{user.membershipTier}</span></p>
            <p className="sm:col-span-2"><span className="font-semibold text-zinc-900 dark:text-zinc-300">Badges:</span> {user.badges?.join(", ") || "None"}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none">
        <nav className="-mb-px flex space-x-6 min-w-max" aria-label="Tabs">
          {[
            { id: "listings", label: "Listings", icon: List },
            { id: "offers", label: `Offers (${sentOffers.length + receivedOffers.length})`, icon: Briefcase },
            { id: "chats", label: `Chat History (${allConversations.length})`, icon: MessageSquare },
            { id: "received_reviews", label: "Received Reviews", icon: Star },
            { id: "given_reviews", label: "Given Reviews", icon: Star },
            { id: "subscriptions", label: "Subscriptions & Boosts", icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "border-[#6b8f84] text-[#6b8f84]"
                    : "border-transparent text-zinc-550 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {/* LISTINGS TAB */}
        {activeTab === "listings" && <UserListingsTable userId={id} />}

        {/* OFFERS TAB */}
        {activeTab === "offers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sent Offers Panel */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <Briefcase className="h-4 w-4 text-[#6b8f84]" /> Offers Sent / Requested ({sentOffers.length})
              </h3>
              {sentOffers.length === 0 ? (
                <p className="text-zinc-500 text-sm py-4">No offers sent by this user.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {sentOffers.map((offer: any) => (
                    <div key={offer.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate max-w-[70%]">
                          Listing: {offer.listing?.title || "Deleted Listing"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                          offer.status === "completed" ? "bg-green-100 text-green-800" :
                          offer.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {offer.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-zinc-500 text-[11px]">
                        <div><strong>Receiver:</strong> {offer.provider?.fullName || "N/A"}</div>
                        <div><strong>Due Date:</strong> {offer.dueDate ? new Date(offer.dueDate).toLocaleDateString() : "Flexible"}</div>
                        {offer.offerText && <div className="col-span-2 mt-1 bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-100 dark:border-zinc-800/65"><strong>Offer Details:</strong> {offer.offerText}</div>}
                      </div>
                      <div className="text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-150/40 flex justify-between">
                        <span>ID: {offer.id}</span>
                        <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Received Offers Panel */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <Briefcase className="h-4 w-4 text-[#6b8f84]" /> Offers Received / Provided ({receivedOffers.length})
              </h3>
              {receivedOffers.length === 0 ? (
                <p className="text-zinc-500 text-sm py-4">No offers received by this user.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {receivedOffers.map((offer: any) => (
                    <div key={offer.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate max-w-[70%]">
                          Listing: {offer.listing?.title || "Deleted Listing"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                          offer.status === "completed" ? "bg-green-100 text-green-800" :
                          offer.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {offer.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-zinc-500 text-[11px]">
                        <div><strong>Requester:</strong> {offer.requester?.fullName || "N/A"}</div>
                        <div><strong>Due Date:</strong> {offer.dueDate ? new Date(offer.dueDate).toLocaleDateString() : "Flexible"}</div>
                        {offer.offerText && <div className="col-span-2 mt-1 bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-100 dark:border-zinc-800/65"><strong>Offer Details:</strong> {offer.offerText}</div>}
                      </div>
                      <div className="text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-150/40 flex justify-between">
                        <span>ID: {offer.id}</span>
                        <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHATS TAB */}
        {activeTab === "chats" && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 min-h-[400px]">
              
              {/* Conversations List (Col 4) */}
              <div className="md:col-span-4 min-w-0 border-r border-zinc-200 dark:border-zinc-800 pr-4 space-y-2 max-h-[450px] overflow-y-auto">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Conversations</span>
                {allConversations.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4">No chat logs found for this user.</p>
                ) : (
                  allConversations.map((chat: any) => {
                    const isUserHost = chat.hostId === id;
                    const peer = isUserHost ? chat.guest : chat.host;
                    const isSelected = selectedConversation?.id === chat.id;
                    const isPeerOnline = onlineUsers.includes(peer?.id);

                    return (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedConversation(chat)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                          isSelected 
                            ? "bg-[#6b8f84]/10 border-[#6b8f84] text-zinc-950 dark:text-white" 
                            : "bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-250/60 dark:border-zinc-800"
                        }`}
                      >
                        <div className="relative shrink-0">
                          {peer?.avatarUrl ? (
                            <img
                              src={peer.avatarUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 text-xs">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                          {isPeerOnline && (
                            <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                          )}
                        </div>
                        <div className="truncate flex-1 min-w-0">
                          <div className="font-semibold text-xs leading-none mb-0.5 truncate">{peer?.fullName || "Unnamed User"}</div>
                          <span className="text-[10px] text-zinc-400 truncate block">
                            {chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : "No messages"}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>

              {/* Chat Viewport (Col 8) */}
              <div className="md:col-span-8 min-w-0 flex flex-col max-h-[450px] overflow-hidden">
                {activeConversation ? (
                  <div className="flex flex-col h-full flex-1 min-h-[350px] overflow-hidden">
                    <div className="border-b border-zinc-200 dark:border-zinc-855 pb-3 mb-4 flex items-center gap-3">
                      {((activeConversation.hostId === id ? activeConversation.guest : activeConversation.host)?.avatarUrl) ? (
                        <div className="relative">
                          <img
                            src={(activeConversation.hostId === id ? activeConversation.guest : activeConversation.host).avatarUrl}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-zinc-200/50"
                          />
                          {onlineUsers.includes((activeConversation.hostId === id ? activeConversation.guest : activeConversation.host)?.id) && (
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-zinc-500 border border-zinc-200/50 text-sm">
                            <User className="h-4 w-4" />
                          </div>
                          {onlineUsers.includes((activeConversation.hostId === id ? activeConversation.guest : activeConversation.host)?.id) && (
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                          )}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold block leading-none text-zinc-900 dark:text-zinc-100">
                            Chat with {(activeConversation.hostId === id ? activeConversation.guest : activeConversation.host)?.fullName}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            onlineUsers.includes((activeConversation.hostId === id ? activeConversation.guest : activeConversation.host)?.id) ? "text-emerald-500" : "text-zinc-400"
                          }`}>
                            {onlineUsers.includes((activeConversation.hostId === id ? activeConversation.guest : activeConversation.host)?.id) ? "Active" : "Offline"}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          ID: {activeConversation.id}
                        </span>
                      </div>
                    </div>
 
                    {/* Chat Logs view */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 pr-2 scrollbar-thin mb-4">
                      {activeConversation.messages && activeConversation.messages.map((message: any) => {
                        const isMainUser = message.senderId === id;
                        const senderName = isMainUser 
                          ? user.fullName 
                          : (activeConversation.hostId === id 
                              ? activeConversation.guest?.fullName 
                              : activeConversation.host?.fullName);

                        return (
                          <div 
                            key={message.id} 
                            className={`flex flex-col gap-1 max-w-[85%] ${
                              isMainUser ? "mr-auto" : "ml-auto items-end"
                            }`}
                          >
                            <span className="text-[10px] text-zinc-400 font-semibold px-1">
                              {senderName} • {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed break-words whitespace-pre-wrap ${
                              isMainUser 
                                ? "bg-zinc-100 text-zinc-855 rounded-tl-none dark:bg-zinc-800 dark:text-zinc-150" 
                                : "bg-[#6b8f84]/15 text-zinc-900 rounded-tr-none dark:bg-[#6b8f84]/35 dark:text-zinc-50"
                            }`}>
                              {message.content}
                            </div>
                          </div>
                        );
                      })}
                      
                      {peerTypingUser && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6b8f84] font-semibold italic animate-pulse py-1">
                          <span className="flex gap-1 items-center justify-center">
                            {peerTypingUser === id 
                              ? user.fullName 
                              : (activeConversation.hostId === id 
                                  ? activeConversation.guest?.fullName 
                                  : activeConversation.host?.fullName)} is typing
                            <span className="flex gap-0.5 items-center justify-center h-3 ml-0.5">
                              <span className="w-1 h-1 rounded-full bg-[#6b8f84] animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-1 h-1 rounded-full bg-[#6b8f84] animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-1 h-1 rounded-full bg-[#6b8f84] animate-bounce" style={{ animationDelay: "300ms" }} />
                            </span>
                          </span>
                        </div>
                      )}
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
                  <div className="flex flex-col items-center justify-center flex-1 text-zinc-400 gap-2 min-h-[300px]">
                    <MessageSquare className="h-8 w-8 text-zinc-300" />
                    <span className="text-xs font-semibold">Select a conversation from the left to view logs</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* RECEIVED REVIEWS TAB */}
        {activeTab === "received_reviews" && <UserReviewsTable userId={id} type="received" />}

        {/* GIVEN REVIEWS TAB */}
        {activeTab === "given_reviews" && <UserReviewsTable userId={id} type="given" />}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === "subscriptions" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
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

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Promotion History (Boosts)</h3>
              </div>
              {user.promotionPurchases && user.promotionPurchases.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
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
                          <tr key={promo.id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">{promo.listing?.title || "Unknown Listing"}</td>
                            <td className="px-6 py-4 font-medium text-zinc-650 dark:text-zinc-350">{promo.promotionPackage?.name || "Unknown Package"}</td>
                            <td className="px-6 py-4 capitalize">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                promo.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                              }`}>
                                {promo.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-zinc-500">{new Date(promo.startsAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-zinc-500">{new Date(promo.endsAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block md:hidden flex-1 p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
                    {user.promotionPurchases.map((promo: any) => (
                      <div key={promo.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm relative space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{promo.listing?.title || "Unknown Listing"}</div>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize shrink-0 ${
                            promo.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                          }`}>
                            {promo.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-zinc-500 block mb-0.5">Package</span>
                            <span className="text-zinc-900 dark:text-zinc-300 font-medium">{promo.promotionPackage?.name || "Unknown Package"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block mb-0.5">Started At</span>
                            <span className="text-zinc-900 dark:text-zinc-300">{new Date(promo.startsAt).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block mb-0.5">Ends At</span>
                            <span className="text-zinc-900 dark:text-zinc-300">{new Date(promo.endsAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-6">
                  <p className="text-zinc-550">No promotion purchases found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
