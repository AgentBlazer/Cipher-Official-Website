import { API_BASE } from "../../lib/api.ts";
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Calendar, Image as ImageIcon, Eye, EyeOff, Loader2, PlusCircle, X, Save, Sparkles } from "lucide-react";
import { Modal } from "../components/Modal.tsx";
import { ConfirmDialog } from "../components/ConfirmDialog.tsx";
import { ImageUploader } from "../components/ImageUploader.tsx";
import { useToast } from "../context/ToastContext.tsx";

interface EventSlide {
  id: string;
  imageUrl: string;
  order: number;
  caption?: string | null;
}

interface EventItem {
  id: string;
  title: string;
  tag: string;
  dateTag: string;
  cardSub?: string | null;
  subTitle?: string | null;
  slug?: string | null;
  shortDesc: string;
  description?: string | null;
  fullDescription?: string | null;
  posterUrl?: string | null;
  venue?: string | null;
  registrationUrl?: string | null;
  category: string;
  status: string;
  displayOrder: number;
  isPublished: boolean;
  featuredOnHome?: boolean;
  slides: EventSlide[];
}

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Events Page Header Configuration State
  const [headerBadge, setHeaderBadge] = useState("WORKSHOPS & CONTESTS");
  const [headerTitle, setHeaderTitle] = useState("Events & Workshops");
  const [headerSubtitle, setHeaderSubtitle] = useState(
    "From AI prompt engineering hackathons to formal department galas — explore milestone gatherings hosted by the Cipher Student Association at SJEC."
  );
  const [isSavingHeader, setIsSavingHeader] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    tag: "WORKSHOP",
    dateTag: "25 MAR 2026",
    cardSub: "",
    subTitle: "",
    shortDesc: "",
    description: "",
    fullDescription: "",
    posterUrl: "",
    venue: "Kalam Auditorium",
    registrationUrl: "",
    category: "Workshop",
    status: "UPCOMING",
    displayOrder: 0,
    isPublished: true,
    featuredOnHome: true,
    slides: [] as string[],
  });

  const [newSlideUrl, setNewSlideUrl] = useState("");

  const { success, error } = useToast();

  const loadHeaderSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/public/content`);
      const data = await res.json();
      if (res.ok && data.map) {
        if (data.map.events_badge) setHeaderBadge(data.map.events_badge);
        if (data.map.events_title) setHeaderTitle(data.map.events_title);
        if (data.map.events_subtitle) setHeaderSubtitle(data.map.events_subtitle);
      }
    } catch {}
  };

  const saveHeaderSettings = async () => {
    try {
      setIsSavingHeader(true);
      const res = await fetch(`${API_BASE}/api/admin/content/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: [
            { key: "events_badge", value: headerBadge, section: "events", label: "Events Top Badge" },
            { key: "events_title", value: headerTitle, section: "events", label: "Events Main Title" },
            { key: "events_subtitle", value: headerSubtitle, section: "events", label: "Events Subtitle" },
          ],
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        success("Events page header updated successfully!");
      } else {
        error(data.message || "Failed to update header.");
      }
    } catch {
      error("Network error updating header.");
    } finally {
      setIsSavingHeader(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/events`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(data.data || []);
      }
    } catch {
      error("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadHeaderSettings();
  }, []);

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      tag: "WORKSHOP",
      dateTag: "TBD",
      cardSub: "",
      subTitle: "",
      shortDesc: "",
      description: "",
      fullDescription: "",
      posterUrl: "",
      venue: "Kalam Auditorium",
      registrationUrl: "",
      category: "Workshop",
      status: "UPCOMING",
      displayOrder: events.length + 1,
      isPublished: true,
      featuredOnHome: true,
      slides: [],
    });
    setNewSlideUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (ev: EventItem) => {
    setEditingEvent(ev);
    let fullDescText = ev.fullDescription || "";
    try {
      const parsed = JSON.parse(ev.fullDescription || "");
      if (Array.isArray(parsed)) fullDescText = parsed.join("\n\n");
    } catch {}

    setFormData({
      title: ev.title,
      tag: ev.tag,
      dateTag: ev.dateTag,
      cardSub: ev.cardSub || "",
      subTitle: ev.subTitle || "",
      shortDesc: ev.shortDesc,
      description: ev.description || "",
      fullDescription: fullDescText,
      posterUrl: ev.posterUrl || "",
      venue: ev.venue || "",
      registrationUrl: ev.registrationUrl || "",
      category: ev.category,
      status: ev.status,
      displayOrder: ev.displayOrder,
      isPublished: ev.isPublished,
      featuredOnHome: ev.featuredOnHome !== false,
      slides: (ev.slides || [])
        .map((s: any) => (typeof s === "string" ? s : s?.imageUrl || ""))
        .filter(Boolean),
    });
    setNewSlideUrl("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.shortDesc) {
      error("Title and short description are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDescArray = formData.fullDescription
        ? formData.fullDescription.split("\n\n").map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        ...formData,
        fullDescription: fullDescArray,
      };

      const url = editingEvent ? `${API_BASE}/api/admin/events/${editingEvent.id}` : `${API_BASE}/api/admin/events`;
      const method = editingEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(editingEvent ? "Event updated successfully!" : "Event created successfully!");
        setIsModalOpen(false);
        loadEvents();
      } else {
        error(data.message || "Failed to save event.");
      }
    } catch {
      error("Network error saving event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/events/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        success("Event deleted.");
        setDeleteId(null);
        loadEvents();
      }
    } catch {
      error("Failed to delete event.");
    }
  };

  const togglePublish = async (ev: EventItem) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/events/${ev.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isPublished: !ev.isPublished }),
      });
      if (res.ok) {
        success(`Event ${!ev.isPublished ? "published" : "unpublished"}.`);
        loadEvents();
      }
    } catch {
      error("Failed to update status.");
    }
  };

  const toggleFeaturedOnHome = async (ev: EventItem) => {
    try {
      const nextVal = ev.featuredOnHome === false ? true : false;
      const res = await fetch(`${API_BASE}/api/admin/events/${ev.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ featuredOnHome: nextVal }),
      });
      if (res.ok) {
        success(`Event ${nextVal ? "featured on Home page" : "hidden from Home page"}.`);
        loadEvents();
      } else {
        error("Failed to update Home page status.");
      }
    } catch {
      error("Failed to update Home page status.");
    }
  };

  const addSlide = () => {
    if (!newSlideUrl) return;
    setFormData({
      ...formData,
      slides: [...formData.slides, newSlideUrl],
    });
    setNewSlideUrl("");
  };

  const removeSlide = (idx: number) => {
    setFormData({
      ...formData,
      slides: formData.slides.filter((_, i) => i !== idx),
    });
  };

  const filtered = events.filter(
    (ev) =>
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.tag.toLowerCase().includes(search.toLowerCase()) ||
      ev.shortDesc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white">Events &amp; Workshops</h2>
          <p className="font-mono text-xs text-[#88aa90]">
            Manage galas, technical contests, registration links, and image galleries
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#00ff66] hover:bg-[#00e65b] text-[#030804] font-mono font-bold text-xs tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" /> CREATE EVENT
        </button>
      </div>

      {/* ── Events Page Header Configuration Card ────────────────────── */}
      <div className="bg-[#030905] border border-[#00ff66]/25 rounded-2xl p-5 md:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#00ff66]/15">
          <div>
            <h3 className="text-sm sm:text-base font-bold font-mono text-[#00ff66] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Public Events Page Header Text
            </h3>
            <p className="font-mono text-xs text-[#88aa90]">
              Customize the badge, title, and description displayed at the top of the public Events &amp; Workshops page
            </p>
          </div>
          <button
            type="button"
            onClick={saveHeaderSettings}
            disabled={isSavingHeader}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,255,102,0.25)] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] disabled:opacity-50 shrink-0"
          >
            {isSavingHeader ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Header Text
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-mono text-xs text-[#88aa90] uppercase mb-1">
              Top Badge Text
            </label>
            <input
              type="text"
              value={headerBadge}
              onChange={(e) => setHeaderBadge(e.target.value)}
              placeholder="e.g. WORKSHOPS & CONTESTS"
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[#88aa90] uppercase mb-1">
              Main Heading (use &amp; for green highlight)
            </label>
            <input
              type="text"
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              placeholder="e.g. Events & Workshops"
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[#88aa90] uppercase mb-1">
              Subtitle Description
            </label>
            <textarea
              rows={2}
              value={headerSubtitle}
              onChange={(e) => setHeaderSubtitle(e.target.value)}
              placeholder="From AI prompt engineering hackathons to formal department galas..."
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4 bg-[#030905] p-3 rounded-xl border border-[#00ff66]/20">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-[#88aa90] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search events by title, tag, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#020603] border border-[#00ff66]/20 focus:border-[#00ff66] rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-white/20 focus:outline-none"
          />
        </div>
        <span className="font-mono text-xs text-[#88aa90]">
          {filtered.length} {filtered.length === 1 ? "event" : "events"}
        </span>
      </div>

      {/* Events Table */}
      <div className="bg-[#030905] rounded-xl border border-[#00ff66]/20 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00ff66] animate-spin" />
            <p className="font-mono text-xs text-[#88aa90]">Loading events...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-mono text-sm text-[#88aa90]">No events found.</p>
            <button
              onClick={openAddModal}
              className="mt-3 text-xs font-mono text-[#00ff66] hover:underline"
            >
              Create the first event &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#040e06] border-b border-[#00ff66]/20 text-[#00ff66] uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-12">#</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Tag / Date</th>
                  <th className="p-4">Gallery Slides</th>
                  <th className="p-4 text-center">Home Page</th>
                  <th className="p-4 text-center">Visibility</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00ff66]/10">
                {filtered.map((ev, idx) => (
                  <tr key={ev.id} className="hover:bg-[#051408]/60 transition-colors">
                    <td className="p-4 text-[#88aa90]">{idx + 1}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-white text-sm">{ev.title}</p>
                        <p className="text-[11px] text-[#88aa90] line-clamp-1 max-w-sm">
                          {ev.shortDesc}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[#00ff66] font-semibold">{ev.tag}</span>
                        <span className="text-[11px] text-[#88aa90]">{ev.dateTag}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66]">
                        {ev.slides?.length || 0} photos
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleFeaturedOnHome(ev)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] tracking-wider transition-colors ${
                          ev.featuredOnHome !== false
                            ? "bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/40 hover:bg-[#00ff66]/25"
                            : "bg-gray-800/60 text-gray-400 border border-gray-700 hover:text-white"
                        }`}
                        title={ev.featuredOnHome !== false ? "Click to hide from Home page" : "Click to feature on Home page"}
                      >
                        {ev.featuredOnHome !== false ? "⭐ On Home" : "☆ Hidden"}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => togglePublish(ev)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wider transition-colors ${
                          ev.isPublished
                            ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/40"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {ev.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {ev.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(ev)}
                          className="p-1.5 rounded-lg text-[#88aa90] hover:text-[#00ff66] hover:bg-[#00ff66]/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(ev.id)}
                          className="p-1.5 rounded-lg text-[#88aa90] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? "Edit Event & Gallery" : "Create New Event"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Lumière — The Gala"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Category / Tag *
              </label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              >
                <option value="WORKSHOP">WORKSHOP</option>
                <option value="EVENT">EVENT</option>
                <option value="BRANCH ENTRY">BRANCH ENTRY</option>
                {formData.tag && !["WORKSHOP", "EVENT", "BRANCH ENTRY"].includes(formData.tag) && (
                  <option value={formData.tag}>{formData.tag}</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Organized By
              </label>
              <input
                type="text"
                value={formData.cardSub}
                onChange={(e) => setFormData({ ...formData, cardSub: e.target.value })}
                placeholder="e.g. AgentBlazer Club × Cipher"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Date Tag *
              </label>
              <input
                type="text"
                required
                value={formData.dateTag}
                onChange={(e) => setFormData({ ...formData, dateTag: e.target.value })}
                placeholder="e.g. 29 OCT 2025"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Venue
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Kalam Auditorium"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
              Short Description (Displayed on Event Card) *
            </label>
            <textarea
              rows={2}
              required
              value={formData.shortDesc}
              onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
              placeholder="Summary of the event..."
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
              Full Description (Modal Dialog - Separate paragraphs with double enter)
            </label>
            <textarea
              rows={4}
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              placeholder="Detailed report of the programme..."
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          {/* Slides Gallery Manager */}
          <div className="border-t border-[#00ff66]/15 pt-4">
            <h4 className="font-mono text-xs text-[#00ff66] uppercase mb-3 flex items-center justify-between">
              <span>Event Photo Slides Gallery ({formData.slides.length} images)</span>
            </h4>

            {/* Existing Slides Thumbnails */}
            {formData.slides.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3 max-h-40 overflow-y-auto p-2 bg-[#020603] rounded-lg border border-[#00ff66]/20">
                {formData.slides.map((url, i) => (
                  <div key={i} className="relative group rounded overflow-hidden border border-[#00ff66]/30 aspect-video bg-black">
                    <img src={url} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSlide(i)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-600/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove slide"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-0 left-0 bg-black/70 text-[9px] px-1 text-[#00ff66]">
                      #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Add Slide via Upload / URL */}
            <div className="bg-[#040e06] p-3 rounded-lg border border-[#00ff66]/20 flex flex-col gap-2">
              <span className="text-[11px] font-mono text-[#88aa90]">Add Photo Slide:</span>
              <ImageUploader
                label="Select Photo or Enter URL"
                value={newSlideUrl}
                onChange={(url) => {
                  setNewSlideUrl(url);
                  if (url) {
                    setFormData((prev) => ({ ...prev, slides: [...prev.slides, url] }));
                    setNewSlideUrl("");
                  }
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="eventActive"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded bg-black border-[#00ff66]/30 text-[#00ff66]"
                />
                <label htmlFor="eventActive" className="font-mono text-xs text-white">
                  Visible on public website
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredOnHome"
                  checked={formData.featuredOnHome}
                  onChange={(e) => setFormData({ ...formData, featuredOnHome: e.target.checked })}
                  className="w-4 h-4 rounded bg-black border-[#00ff66]/30 text-[#00ff66]"
                />
                <label htmlFor="featuredOnHome" className="font-mono text-xs text-white flex items-center gap-1">
                  ⭐ Feature on Home Page
                </label>
              </div>
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
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Event"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event and all its gallery slides? This action is permanent."
      />
    </div>
  );
};