import { API_BASE } from "../../lib/api.ts";
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, Loader2, Layers, Image as ImageIcon, X, Calendar } from "lucide-react";
import { Modal } from "../components/Modal.tsx";
import { ConfirmDialog } from "../components/ConfirmDialog.tsx";
import { ImageUploader } from "../components/ImageUploader.tsx";
import { useToast } from "../context/ToastContext.tsx";

interface Activity {
  id: string;
  numberId?: string | null;
  title: string;
  description?: string | null;
  photoUrl?: string | null;
  date?: string | null;
  displayOrder: number;
  isPublished: boolean;
}

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    numberId: "",
    title: "",
    date: "",
    description: "",
    photos: [] as string[],
    displayOrder: 0,
    isPublished: true,
  });

  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const { success, error } = useToast();

  const loadActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/activities`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setActivities(data.data || []);
      }
    } catch {
      error("Failed to load activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const openAddModal = () => {
    setEditingActivity(null);
    const nextNum = String(activities.length + 1).padStart(2, "0");
    setFormData({
      numberId: nextNum,
      title: "",
      date: "",
      description: "",
      photos: [],
      displayOrder: activities.length + 1,
      isPublished: true,
    });
    setNewPhotoUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (act: Activity) => {
    setEditingActivity(act);
    let parsedPhotos: string[] = [];
    if (act.photoUrl) {
      try {
        const parsed = JSON.parse(act.photoUrl);
        if (Array.isArray(parsed)) parsedPhotos = parsed.filter(Boolean);
        else if (typeof act.photoUrl === "string" && act.photoUrl.trim()) parsedPhotos = [act.photoUrl.trim()];
      } catch {
        if (typeof act.photoUrl === "string" && act.photoUrl.trim()) parsedPhotos = [act.photoUrl.trim()];
      }
    }

    setFormData({
      numberId: act.numberId || "",
      title: act.title,
      date: act.date || "",
      description: act.description || "",
      photos: parsedPhotos,
      displayOrder: act.displayOrder,
      isPublished: act.isPublished,
    });
    setNewPhotoUrl("");
    setIsModalOpen(true);
  };

  const removePhoto = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      error("Title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingActivity
        ? `${API_BASE}/api/admin/activities/${editingActivity.id}`
        : `${API_BASE}/api/admin/activities`;
      const method = editingActivity ? "PUT" : "POST";

      const photoPayload = formData.photos.length > 0 ? JSON.stringify(formData.photos) : null;

      const payload = {
        numberId: formData.numberId,
        title: formData.title,
        date: formData.date,
        description: formData.description,
        photoUrl: photoPayload,
        displayOrder: formData.displayOrder,
        isPublished: formData.isPublished,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success(editingActivity ? "Activity updated!" : "Activity added!");
        setIsModalOpen(false);
        loadActivities();
      } else {
        error(data.message || "Failed to save activity.");
      }
    } catch {
      error("Network error saving activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/activities/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        success("Activity removed.");
        setDeleteId(null);
        loadActivities();
      }
    } catch {
      error("Failed to delete activity.");
    }
  };

  const togglePublish = async (act: Activity) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/activities/${act.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isPublished: !act.isPublished }),
      });
      if (res.ok) {
        success(`Activity ${!act.isPublished ? "published" : "hidden"}.`);
        loadActivities();
      }
    } catch {
      error("Failed to update status.");
    }
  };

  const filtered = activities.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.numberId && a.numberId.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white">Activities Archive</h2>
          <p className="font-mono text-xs text-[#88aa90]">
            Manage technical sessions, industrial visits, workshops, and hackathons
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#00ff66] hover:bg-[#00e65b] text-[#030804] font-mono font-bold text-xs tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" /> ADD ACTIVITY
        </button>
      </div>

      <div className="flex items-center gap-4 bg-[#030905] p-3 rounded-xl border border-[#00ff66]/20">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-[#88aa90] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search activities by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#020603] border border-[#00ff66]/20 focus:border-[#00ff66] rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-white/20 focus:outline-none"
          />
        </div>
        <span className="font-mono text-xs text-[#88aa90]">
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="bg-[#030905] rounded-xl border border-[#00ff66]/20 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00ff66] animate-spin" />
            <p className="font-mono text-xs text-[#88aa90]">Loading activities...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-mono text-sm text-[#88aa90]">No activities recorded yet.</p>
            <button
              onClick={openAddModal}
              className="mt-3 text-xs font-mono text-[#00ff66] hover:underline"
            >
              Add activity &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#040e06] border-b border-[#00ff66]/20 text-[#00ff66] uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-16">Code</th>
                  <th className="p-4">Activity Title &amp; Details</th>
                  <th className="p-4">Date / Term</th>
                  <th className="p-4 text-center">Photos</th>
                  <th className="p-4 text-center">Order</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00ff66]/10">
                {filtered.map((act) => {
                  let photoCount = 0;
                  if (act.photoUrl) {
                    try {
                      const parsed = JSON.parse(act.photoUrl);
                      photoCount = Array.isArray(parsed) ? parsed.filter(Boolean).length : 1;
                    } catch {
                      photoCount = 1;
                    }
                  }

                  return (
                    <tr key={act.id} className="hover:bg-[#051408]/60 transition-colors">
                      <td className="p-4 text-[#00ff66] font-bold text-sm">
                        {act.numberId || "--"}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white text-sm">{act.title}</p>
                        {act.description && (
                          <p className="text-[11px] text-[#88aa90] line-clamp-1 max-w-md mt-0.5">
                            {act.description}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-[#88aa90]">
                        {act.date ? (
                          <span className="inline-flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-[#00ff66]" />
                            {act.date}
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {photoCount > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] text-[10px] font-bold">
                            {photoCount} {photoCount === 1 ? "photo" : "photos"}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-[10px]">None</span>
                        )}
                      </td>
                      <td className="p-4 text-center text-[#88aa90]">{act.displayOrder}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => togglePublish(act)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] tracking-wider transition-colors ${
                            act.isPublished
                              ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/40"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {act.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {act.isPublished ? "Visible" : "Hidden"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(act)}
                            className="p-1.5 rounded-lg text-[#88aa90] hover:text-[#00ff66] hover:bg-[#00ff66]/10 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(act.id)}
                            className="p-1.5 rounded-lg text-[#88aa90] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? "Edit Activity Details" : "Add Activity to Archive"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Index / Code
              </label>
              <input
                type="text"
                value={formData.numberId}
                onChange={(e) => setFormData({ ...formData, numberId: e.target.value })}
                placeholder="01"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Date / Term
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="e.g. 15 OCT 2025 or 2025-26"
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                }
                className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Applied Machine Learning"
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
              Description / Popup Details
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the activity, resource persons, outcomes, technologies covered..."
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          {/* Activity Photos & Gallery Manager */}
          <div className="border-t border-[#00ff66]/15 pt-4">
            <h4 className="font-mono text-xs text-[#00ff66] uppercase mb-3 flex items-center justify-between">
              <span>Activity Pictures / Screenshots ({formData.photos.length} photos)</span>
            </h4>

            {formData.photos.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3 max-h-40 overflow-y-auto p-2 bg-[#020603] rounded-lg border border-[#00ff66]/20">
                {formData.photos.map((url, i) => (
                  <div key={i} className="relative group rounded overflow-hidden border border-[#00ff66]/30 aspect-video bg-black">
                    <img src={url} alt={`Activity photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-600/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
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

            <div className="bg-[#040e06] p-3 rounded-lg border border-[#00ff66]/20 flex flex-col gap-2">
              <span className="text-[11px] font-mono text-[#88aa90]">Add Picture:</span>
              <ImageUploader
                label="Select Photo or Enter URL"
                value={newPhotoUrl}
                onChange={(url) => {
                  setNewPhotoUrl(url);
                  if (url) {
                    setFormData((prev) => ({ ...prev, photos: [...prev.photos, url] }));
                    setNewPhotoUrl("");
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="actActive"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 rounded bg-black border-[#00ff66]/30 text-[#00ff66]"
            />
            <label htmlFor="actActive" className="font-mono text-xs text-white">
              Display on public archive grid
            </label>
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
        title="Delete Activity"
        message="Are you sure you want to remove this activity from the archive?"
      />
    </div>
  );
};