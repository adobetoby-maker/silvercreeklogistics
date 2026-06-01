"use client";

import { useState } from "react";
import {
  MessageSquare, Mail, Phone, Send, Plus, Search, Inbox
} from "lucide-react";

type Message = {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  body: string;
  created_at: string;
};

type Conversation = {
  id: string;
  client_id: string | null;
  channel: "email" | "sms" | "phone";
  last_message_at: string | null;
  unread_count: number;
  client_name: string | null;
  last_message_body: string | null;
  messages: Message[];
};

function channelIcon(channel: string) {
  if (channel === "email") return <Mail size={13} className="text-blue-500" />;
  if (channel === "sms") return <Phone size={13} className="text-green-500" />;
  return <MessageSquare size={13} className="text-gray-400" />;
}

function fmtTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatClient({ conversations }: { conversations: Conversation[] }) {
  const [selected, setSelected] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [search, setSearch] = useState("");
  const [newMsg, setNewMsg] = useState("");

  const filtered = conversations.filter((c) =>
    !search ||
    (c.client_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.last_message_body ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const activeConv = conversations.find((c) => c.id === selected) ?? null;

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-extrabold text-[#1a2744]">Chat Inbox</h1>
            <button className="flex items-center gap-1 px-2.5 py-1.5 bg-[#e8600a] text-white text-xs font-semibold rounded-lg hover:bg-[#c4500a] transition-colors">
              <Plus size={12} /> New
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e8600a]/30 focus:border-[#e8600a]"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs text-gray-400">No conversations yet — messages from customers appear here</p>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                  selected === c.id ? "bg-orange-50 border-r-2 border-[#e8600a]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {channelIcon(c.channel)}
                    <span className="text-xs font-semibold text-[#1a2744] truncate">
                      {c.client_name ?? "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-gray-400">{fmtTime(c.last_message_at)}</span>
                    {c.unread_count > 0 && (
                      <span className="w-4 h-4 bg-[#e8600a] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 truncate mt-1 pl-5">
                  {c.last_message_body ?? "No messages yet"}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeConv ? (
          <>
            {/* Conversation header */}
            <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3">
              {channelIcon(activeConv.channel)}
              <div>
                <div className="font-bold text-sm text-[#1a2744]">
                  {activeConv.client_name ?? "Unknown Client"}
                </div>
                <div className="text-xs text-gray-400 capitalize">{activeConv.channel}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {activeConv.messages.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-8">
                  No messages in this conversation yet.
                </div>
              ) : (
                activeConv.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        m.direction === "outbound"
                          ? "bg-[#e8600a] text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
                      }`}
                    >
                      <p className="leading-relaxed">{m.body}</p>
                      <p className={`text-xs mt-1 ${m.direction === "outbound" ? "text-orange-200" : "text-gray-400"}`}>
                        {fmtTime(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Compose */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newMsg.trim()) setNewMsg(""); }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e8600a]/20 focus:border-[#e8600a]"
                />
                <button
                  onClick={() => setNewMsg("")}
                  disabled={!newMsg.trim()}
                  className="px-3 py-2 bg-[#e8600a] text-white rounded-lg hover:bg-[#c4500a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 font-medium text-sm">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
