import { API_BASE } from "../../lib/api.ts";
import React, { useState, useEffect } from "react";
import {
  UserCheck, Search, Mail, Phone, GraduationCap, Clock,
  CheckCircle, XCircle, AlertCircle, Trash2, Loader2,
  ExternalLink, Check, MessageSquare,
} from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog.tsx";
import { useToast } from "../context/ToastContext.tsx";

interface Application {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  usn?: string | null;
  semester?: string | null;
  domain?: string | null;
  reason: string;
  skills?: string | null;
  status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED";
  adminNotes?: string | null;
  createdAt: string;
}

const STATUS_BADGES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  PENDING: {
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-400",
    icon: <Clock className="w-3 h-3" />,
  },
  REVIEWED: {
    bg: "bg-blue-500/10 border-blue-500/30",
    text: "text-blue-400",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  ACCEPTED: {
    bg: "bg-green-500/10 border-green-500/30",
    text: "text-green-400",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  REJECTED: {
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-400",
    icon: <XCircle className="w-3 h-3" />,
  },
};

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const { success, error } = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/applications`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications(data.data || []);
      } else {
        error(data.error || "Failed to load applications");
      }
    } catch {
      error("Network error loading applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success(`Status updated to ${newStatus}`);
        load();
      } else {
        error(data.error || "Failed to update status");
      }
    } catch {
      error("Network error updating application");
    }
  };

  const saveNotes = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminNotes: noteText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success("Admin note saved");
        setEditingNotesId(null);
        load();
      }
    } catch {
      error("Failed to save note");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/applications/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success("Application deleted");
        setDeleteId(null);
        load();
      }
    } catch {
      error("Failed to delete application");
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      (app.domain || "").toLowerCase().includes(search.toLowerCase()) ||
      (app.usn || "").toLowerCase().includes(search.toLowerCase()) ||
      app.reason.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#00ff66]" /> Join Cipher Applications
          </h1>
          <p className="font-mono text-xs text-[#88aa90] mt-1">
            {applications.length} total applications · {pendingCount} pending review
          </p>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {["ALL", "PENDING", "REVIEWED", "ACCEPTED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs tracking-wider transition-all whitespace-nowrap ${
                statusFilter === s
                  ? "bg-[#00ff66] text-black font-bold shadow-[0_0_15px_rgba(0,255,102,0.4)]"
                  : "bg-[#041006] text-[#88aa90] hover:text-[#00ff66] border border-[#00ff66]/20"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#88aa90] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant name, email, USN..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#041006] border border-[#00ff66]/25 rounded-xl font-mono text-xs text-white placeholder-[#88aa90]/60 focus:outline-none focus:border-[#00ff66]"
          />
        </div>
      </div>

      {/* ── List ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 text-[#00ff66] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 font-mono">
          <UserCheck className="w-10 h-10 text-[#00ff66]/30 mx-auto mb-3" />
          <p className="text-[#88aa90] text-sm">
            {search ? "No applications match your search." : "No join applications received yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const badge = STATUS_BADGES[app.status] || STATUS_BADGES.PENDING;
            return (
              <div
                key={app.id}
                className="rounded-xl bg-[#040e06] border border-[#00ff66]/15 hover:border-[#00ff66]/40 transition-all p-5 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-base font-bold text-white">
                        {app.name}
                      </span>
                      {app.domain && (
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 font-semibold uppercase">
                          {app.domain}
                        </span>
                      )}
                      {app.semester && (
                        <span className="font-mono text-[10px] text-[#88aa90] flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-[#00ff66]" /> {app.semester}
                        </span>
                      )}
                      {app.usn && (
                        <span className="font-mono text-[10px] text-[#88aa90]/80">
                          USN: {app.usn}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono text-[#88aa90] flex-wrap">
                      <a
                        href={`mailto:${app.email}?subject=CIPHER%20Club%20Application%20Response`}
                        className="flex items-center gap-1 hover:text-[#00ff66] transition-colors"
                      >
                        <Mail className="w-3 h-3 text-[#00ff66]" /> {app.email}
                      </a>
                      {app.phone && (
                        <a
                          href={`tel:${app.phone}`}
                          className="flex items-center gap-1 hover:text-[#00ff66] transition-colors"
                        >
                          <Phone className="w-3 h-3 text-[#00ff66]" /> {app.phone}
                        </a>
                      )}
                      <span className="text-[10px] text-[#88aa90]/60">
                        Submitted: {new Date(app.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold border ${badge.bg} ${badge.text} bg-[#020703] focus:outline-none`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="REVIEWED">REVIEWED</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>

                    <a
                      href={`mailto:${app.email}?subject=CIPHER%20Application%20Update&body=Hi%20${encodeURIComponent(app.name)},%0A%0AThank%20you%20for%20applying%20to%20CIPHER!`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 hover:bg-[#00ff66] hover:text-black font-mono text-xs font-semibold transition-colors"
                      title="Send email reply"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>

                    <button
                      onClick={() => setDeleteId(app.id)}
                      className="p-1.5 rounded-lg text-[#88aa90] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Reason & Statement */}
                <div className="bg-[#020703] p-3.5 rounded-lg border border-[#00ff66]/15 space-y-2">
                  <p className="font-mono text-xs text-[#00ff66] font-semibold">// WHY I WANT TO JOIN:</p>
                  <p className="font-mono text-xs text-white leading-relaxed whitespace-pre-wrap">
                    {app.reason}
                  </p>
                  {app.skills && (
                    <div className="pt-2 border-t border-[#00ff66]/10 text-[11px] font-mono text-[#88aa90]">
                      <span className="text-[#00ff66]">Skills / Interests:</span> {app.skills}
                    </div>
                  )}
                </div>

                {/* Admin Notes Row */}
                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  {editingNotesId === app.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add internal review note..."
                        className="flex-1 px-3 py-1.5 bg-[#020703] border border-[#00ff66]/30 rounded text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => saveNotes(app.id)}
                        className="px-3 py-1.5 bg-[#00ff66] text-black font-bold rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="px-2 py-1.5 text-[#88aa90] text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full text-[#88aa90] text-[11px]">
                      <span>
                        <MessageSquare className="w-3 h-3 inline mr-1 text-[#00ff66]" />
                        {app.adminNotes ? (
                          <span className="text-white italic">{app.adminNotes}</span>
                        ) : (
                          <span className="opacity-60">No admin notes</span>
                        )}
                      </span>
                      <button
                        onClick={() => {
                          setEditingNotesId(app.id);
                          setNoteText(app.adminNotes || "");
                        }}
                        className="text-[#00ff66] hover:underline"
                      >
                        {app.adminNotes ? "Edit note" : "+ Add note"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirmation ────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Application"
        message="Are you sure you want to delete this applicant's record? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
