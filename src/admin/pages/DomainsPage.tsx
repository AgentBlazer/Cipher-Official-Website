import React, { useState, useEffect } from "react";
import { API_BASE } from "../../lib/api.ts";
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, Loader2, Code2, Crown, Users, Rocket, Cpu, Terminal, Shield, Sparkles } from "lucide-react";
import { Modal } from "../components/Modal.tsx";
import { ConfirmDialog } from "../components/ConfirmDialog.tsx";
import { useToast } from "../context/ToastContext.tsx";

const AVAILABLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Crown,
  Users,
  Rocket,
  Cpu,
  Terminal,
  Shield,
  Sparkles,
};

interface Domain {
  id: string;
  name: string;
  sessionsLabel: string;
  description: string;
  iconName: string;
  additionalInfo?: string | null;
  displayOrder: number;
  isPublished: boolean;
}

export const DomainsPage: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sessionsLabel: "5 SESSIONS",
    description: "",
    iconName: "Code2",
    additionalInfo: "",
    displayOrder: 0,
    isPublished: true,
  });

  const { success, error } = useToast();

  const loadDomains = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/domains`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setDomains(data.data || []);
      }
    } catch {
      error("Failed to load domains.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const openAddModal = () => {
    setEditingDomain(null);
    setFormData({
      name: "",
      sessionsLabel: "4 SESSIONS",
      description: "",
      iconName: "Code2",
      additionalInfo: "",
      displayOrder: domains.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d: Domain) => {
    setEditingDomain(d);
    setFormData({
      name: d.name,
      sessionsLabel: d.sessionsLabel,
      description: d.description,
      iconName: d.iconName,
      additionalInfo: d.additionalInfo || "",
      displayOrder: d.displayOrder,
      isPublished: d.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      error("Domain name and description are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingDomain ? `${API_BASE}/api/admin/domains/${editingDomain.id}` : `${API_BASE}/api/admin/domains`;
      const method = editingDomain ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(editingDomain ? "Domain updated!" : "Domain created!");
        setIsModalOpen(false);
        loadDomains();
      } else {
        error(data.message || "Failed to save domain.");
      }
    } catch {
      error("Network error saving domain.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/domains/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        success("Domain deleted.");
        setDeleteId(null);
        loadDomains();
      }
    } catch {
      error("Failed to delete domain.");
    }
  };

  const togglePublish = async (d: Domain) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/domains/${d.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isPublished: !d.isPublished }),
      });
      if (res.ok) {
        success(`Domain ${!d.isPublished ? "published" : "hidden"}.`);
        loadDomains();
      }
    } catch {
      error("Failed to update status.");
    }
  };

  const filtered = domains.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white">Domains &amp; Pillars</h2>
          <p className="font-mono text-xs text-[#88aa90]">
            Manage the core operational domains (Technical, Leadership, Events, Industry)
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#00ff66] hover:bg-[#00e65b] text-[#030804] font-mono font-bold text-xs tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" /> ADD DOMAIN
        </button>
      </div>

      <div className="flex items-center gap-4 bg-[#030905] p-3 rounded-xl border border-[#00ff66]/20">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-[#88aa90] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search domains..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#020603] border border-[#00ff66]/20 focus:border-[#00ff66] rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-white/20 focus:outline-none"
          />
        </div>
        <span className="font-mono text-xs text-[#88aa90]">
          {filtered.length} {filtered.length === 1 ? "domain" : "domains"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00ff66] animate-spin" />
            <p className="font-mono text-xs text-[#88aa90]">Loading domains...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 py-16 text-center">
            <p className="font-mono text-sm text-[#88aa90]">No domains created.</p>
          </div>
        ) : (
          filtered.map((d) => {
            const IconComponent = AVAILABLE_ICONS[d.iconName] || Code2;
            return (
              <div
                key={d.id}
                className="p-5 rounded-xl bg-[#040e06] border border-[#00ff66]/20 hover:border-[#00ff66]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/30 flex items-center justify-center text-[#00ff66]">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base font-mono">{d.name}</h4>
                        <span className="text-[10px] font-mono text-[#00ff66] tracking-widest px-2 py-0.5 rounded bg-[#00ff66]/5 border border-[#00ff66]/20">
                          {d.sessionsLabel}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => togglePublish(d)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] tracking-wider transition-colors ${
                        d.isPublished
                          ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/40"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {d.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {d.isPublished ? "Active" : "Draft"}
                    </button>
                  </div>

                  <p className="font-mono text-xs text-[#a0c0a8] leading-relaxed mb-4">
                    {d.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#00ff66]/15 text-xs font-mono text-[#88aa90]">
                  <span>Order: #{d.displayOrder}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(d)}
                      className="p-1 rounded text-[#88aa90] hover:text-[#00ff66] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(d.id)}
                      className="p-1 rounded text-[#88aa90] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDomain ? "Edit Domain" : "Add Domain"}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Domain Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Technical Skill Building"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Sessions Badge Label
              </label>
              <input
                type="text"
                value={formData.sessionsLabel}
                onChange={(e) => setFormData({ ...formData, sessionsLabel: e.target.value })}
                placeholder="e.g. 5 SESSIONS"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
              Select Card Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(AVAILABLE_ICONS).map((iconKey) => {
                const Icon = AVAILABLE_ICONS[iconKey];
                const isSelected = formData.iconName === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setFormData({ ...formData, iconName: iconKey })}
                    className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66] shadow-[0_0_10px_#00ff66]"
                        : "bg-[#020603] border-[#00ff66]/20 text-[#88aa90] hover:text-white hover:border-[#00ff66]/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-mono truncate w-full text-center">
                      {iconKey}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Card description text..."
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="domActive"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded bg-black border-[#00ff66]/30 text-[#00ff66]"
              />
              <label htmlFor="domActive" className="font-mono text-xs text-white">
                Show on public website
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-mono text-xs text-[#88aa90]">Order:</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                }
                className="w-16 bg-[#020603] border border-[#00ff66]/30 rounded px-2 py-1 text-xs font-mono text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#00ff66]/20">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg font-mono text-xs text-[#88aa90] hover:text-white border border-[#00ff66]/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#00ff66] hover:bg-[#00e65b] text-black font-mono font-bold text-xs tracking-wider px-5 py-2 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Domain"
        message="Are you sure you want to delete this domain card from the website?"
      />
    </div>
  );
};