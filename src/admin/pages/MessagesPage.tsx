import React, { useEffect, useState } from "react";
import { API_BASE } from "../../lib/api.ts";
import { Mail, Trash2, CheckCircle, Clock, RefreshCw, Inbox } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string; // UNREAD, READ, REPLIED
  createdAt: string;
}

export const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchMessages = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/admin/messages`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${localStorage.getItem("cipher_token")}` },
    })
      .then((r) => r.json())
      .then((d) => { setMessages(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id: string) => {
    await fetch(`${API_BASE}/api/admin/messages/${id}/read`, {
      method: "PATCH",
      credentials: "include",
      headers: { Authorization: `Bearer ${localStorage.getItem("cipher_token")}` },
    });
    fetchMessages();
  };

  const deleteMsg = async (id: string) => {
    if (!window.confirm("Delete this message?")) return;
    await fetch(`${API_BASE}/api/admin/messages/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { Authorization: `Bearer ${localStorage.getItem("cipher_token")}` },
    });
    if (selected?.id === id) setSelected(null);
    fetchMessages();
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread") return m.status === "UNREAD";
    if (filter === "read") return m.status !== "UNREAD";
    return true;
  });

  const unreadCount = messages.filter((m) => m.status === "UNREAD").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Inbox className="w-6 h-6 text-[#00ff66]" /> Contact Messages
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All messages read"}
          </p>
        </div>
        <button onClick={fetchMessages} className="flex items-center gap-2 px-4 py-2 bg-[#00ff66]/10 border border-[#00ff66]/30 rounded-lg text-[#00ff66] text-sm hover:bg-[#00ff66]/20 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-2">
        {(["all", "unread", "read"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded text-xs font-mono uppercase tracking-wider border transition-colors ${filter === f ? "bg-[#00ff66] text-[#030804] border-[#00ff66]" : "text-gray-400 border-gray-700 hover:border-[#00ff66]/40"}`}>
            {f} {f === "unread" && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          {loading ? (
            <div className="text-gray-500 text-sm py-8 text-center">Loading messages...</div>
          ) : filtered.length === 0 ? (
            <div className="text-gray-500 text-sm py-8 text-center border border-dashed border-gray-700 rounded-lg">No messages found.</div>
          ) : filtered.map((msg) => (
            <div key={msg.id}
              onClick={() => { setSelected(msg); if (msg.status === "UNREAD") markRead(msg.id); }}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${selected?.id === msg.id ? "border-[#00ff66]/60 bg-[#00ff66]/5" : "border-gray-700/50 bg-gray-900/50 hover:border-gray-600"} ${msg.status === "UNREAD" ? "border-l-[3px] border-l-[#00ff66]" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {msg.status === "UNREAD" && <span className="w-2 h-2 rounded-full bg-[#00ff66] flex-shrink-0 animate-pulse" />}
                    <span className="text-white text-sm font-semibold truncate">{msg.name}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{msg.email}</span>
                  {msg.subject && <p className="text-gray-300 text-xs mt-1 font-medium">{msg.subject}</p>}
                  <p className="text-gray-500 text-xs mt-1 truncate">{msg.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-gray-600 text-[10px]">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteMsg(msg.id); }} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-6">
          {selected ? (
            <div className="border border-gray-700 rounded-lg bg-gray-900/50 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white font-bold text-lg">{selected.name}</h2>
                  <a href={`mailto:${selected.email}`} className="text-[#00ff66] text-sm hover:underline">{selected.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  {selected.status !== "UNREAD" ? (
                    <span className="flex items-center gap-1 text-gray-500 text-xs"><CheckCircle className="w-3.5 h-3.5" /> Read</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#00ff66] text-xs"><Clock className="w-3.5 h-3.5" /> Unread</span>
                  )}
                  <button onClick={() => deleteMsg(selected.id)} className="text-red-400 hover:text-red-300 ml-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {selected.subject && (
                <div className="border border-gray-700 rounded px-3 py-2">
                  <span className="text-gray-400 text-xs uppercase tracking-wider">Subject: </span>
                  <span className="text-white text-sm">{selected.subject}</span>
                </div>
              )}
              <div className="border border-gray-700 rounded p-4 bg-[#030804]">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="text-gray-500 text-xs">Received: {new Date(selected.createdAt).toLocaleString()}</div>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your message to Cipher"}`}
                className="inline-flex items-center gap-2 w-full justify-center py-2.5 bg-[#00ff66]/10 border border-[#00ff66]/30 rounded text-[#00ff66] text-sm font-mono hover:bg-[#00ff66]/20 transition-colors">
                <Mail className="w-4 h-4" /> Reply via Email
              </a>
            </div>
          ) : (
            <div className="border border-dashed border-gray-700 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500 text-sm text-center">Select a message to read it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
