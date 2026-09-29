import { API_BASE } from "../../lib/api.ts";
import React, { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, Image as ImageIcon, Sparkles } from "lucide-react";
import { useToast } from "../context/ToastContext.tsx";
import { ImageUploader } from "../components/ImageUploader.tsx";

interface ContentItem {
  id: string;
  key: string;
  value: string;
  section: string;
  label: string;
  type: string;
}

const DEFAULT_ABOUT_PHOTOS = [
  "/assets/about/about_1.jpg",
  "/assets/about/about_2.jpg",
  "/assets/about/about_3.jpg",
  "/assets/about/about_4.jpg",
];

export const ContentPage: React.FC = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [contentValues, setContentValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<string>("brand");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Dedicated state for About section photos (up to 8)
  const [aboutPhotos, setAboutPhotos] = useState<string[]>(DEFAULT_ABOUT_PHOTOS);

  const { success, error } = useToast();

  const loadContent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/content`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.data || []);
        const map = data.map || {};
        setContentValues(map);

        // Parse about photos
        let loaded: string[] = [];
        if (map.about_photos) {
          try {
            const parsed = JSON.parse(map.about_photos);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loaded = parsed.filter((p) => typeof p === "string" && p.trim().length > 0);
            }
          } catch {
            // ignore
          }
        }

        if (loaded.length === 0) {
          for (let i = 1; i <= 8; i++) {
            const val = map[`about_photo_${i}`];
            if (val && val.trim().length > 0) {
              loaded.push(val.trim());
            }
          }
        }

        if (loaded.length > 0) {
          setAboutPhotos(loaded.slice(0, 8));
        }
      }
    } catch {
      error("Failed to load website content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleChange = (key: string, val: string) => {
    setContentValues((prev) => ({ ...prev, [key]: val }));
  };

  // Update about photos array and synchronize with contentValues
  const updateAboutPhotos = (newPhotos: string[]) => {
    const trimmed = newPhotos.slice(0, 8);
    setAboutPhotos(trimmed);

    setContentValues((prev) => {
      const next = { ...prev };
      next["about_photos"] = JSON.stringify(trimmed);
      for (let i = 1; i <= 8; i++) {
        next[`about_photo_${i}`] = trimmed[i - 1] || "";
      }
      return next;
    });
  };

  const handleAddAboutPhoto = () => {
    if (aboutPhotos.length >= 8) {
      error("Maximum 8 photos allowed in the Who We Are section.");
      return;
    }
    updateAboutPhotos([...aboutPhotos, "/assets/about/about_1.jpg"]);
  };

  const handleRemoveAboutPhoto = (index: number) => {
    const filtered = aboutPhotos.filter((_, i) => i !== index);
    updateAboutPhotos(filtered);
    success("Photo removed. Remember to click 'Save Changes' to publish.");
  };

  const handleAboutPhotoChange = (index: number, url: string) => {
    const updated = [...aboutPhotos];
    updated[index] = url;
    updateAboutPhotos(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Ensure about_photos and about_photo_1..8 are synced
      const finalValues = { ...contentValues };
      finalValues["about_photos"] = JSON.stringify(aboutPhotos);
      for (let i = 1; i <= 8; i++) {
        finalValues[`about_photo_${i}`] = aboutPhotos[i - 1] || "";
      }

      const payload = Object.keys(finalValues).map((key) => ({
        key,
        value: finalValues[key],
      }));

      const res = await fetch(`${API_BASE}/api/admin/content/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: payload }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success("Website content saved and published!");
      } else {
        error(data.message || "Failed to update content.");
      }
    } catch {
      error("Network error while saving content.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "brand", label: "Logo & Branding" },
    { id: "hero", label: "Hero Section" },
    { id: "about", label: "About Section" },
    { id: "activities", label: "Activities Copy" },
    { id: "join", label: "Join Section" },
    { id: "footer", label: "Footer & Socials" },
  ];

  // Exclude raw about_photo_ keys from generic form since custom grid manages them
  const currentSectionItems = items.filter(
    (item) => item.section === activeTab && !item.key.startsWith("about_photo")
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white">Website Content Editor</h2>
          <p className="font-mono text-xs text-[#88aa90]">
            Update public headings, narrative text, logo branding, and showcase photos
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#00ff66] hover:bg-[#00e65b] text-[#030804] font-mono font-bold text-xs tracking-wider px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> PUBLISHING...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> SAVE CHANGES
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#00ff66]/20 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-mono text-xs tracking-wider rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#040e06] text-[#00ff66] border-t-2 border-[#00ff66] font-bold"
                : "text-[#88aa90] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Form Fields */}
      <div className="bg-[#030905] rounded-xl border border-[#00ff66]/20 p-6">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00ff66] animate-spin" />
            <p className="font-mono text-xs text-[#88aa90]">Loading content entries...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
            {/* If on About Section, show the custom 8-Photo Showcase Manager */}
            {activeTab === "about" && (
              <div className="p-5 rounded-2xl bg-[#020703] border border-[#00ff66]/25 space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#00ff66]/15 pb-3">
                  <div>
                    <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#00ff66]" />
                      Who We Are — Animated Floating Photos ({aboutPhotos.length} / 8)
                    </h3>
                    <p className="font-mono text-[11px] text-[#88aa90] mt-0.5">
                      Photos pop up one-by-one as the visitor scrolls to the section. Maximum 8 photos.
                    </p>
                  </div>

                  {aboutPhotos.length < 8 && (
                    <button
                      type="button"
                      onClick={handleAddAboutPhoto}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/40 hover:bg-[#00ff66] hover:text-black font-mono text-xs font-bold transition-colors self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Photo
                    </button>
                  )}
                </div>

                {/* Grid of configured photos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {aboutPhotos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#040e06] border border-[#00ff66]/20 flex flex-col justify-between space-y-3 relative group hover:border-[#00ff66]/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#00ff66] font-bold px-2 py-0.5 rounded bg-[#00ff66]/10 border border-[#00ff66]/20">
                          Photo #{idx + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveAboutPhoto(idx)}
                          title="Delete photo"
                          className="p-1 rounded text-[#88aa90] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Image Preview */}
                      <div className="relative w-full h-28 rounded-lg overflow-hidden border border-[#00ff66]/20 bg-[#020703]">
                        <img
                          src={photoUrl || "/assets/about/about_1.jpg"}
                          alt={`Slot ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/about/about_1.jpg";
                          }}
                        />
                      </div>

                      {/* Image Uploader widget for this slot */}
                      <ImageUploader
                        value={photoUrl}
                        onChange={(url) => handleAboutPhotoChange(idx, url)}
                        label={`Upload or Change Photo ${idx + 1}`}
                      />
                    </div>
                  ))}

                  {/* Empty Slot Card to prompt adding when < 8 */}
                  {aboutPhotos.length < 8 && (
                    <button
                      type="button"
                      onClick={handleAddAboutPhoto}
                      className="h-full min-h-[220px] rounded-xl border-2 border-dashed border-[#00ff66]/25 hover:border-[#00ff66] bg-[#020703]/50 hover:bg-[#00ff66]/5 flex flex-col items-center justify-center gap-2 p-4 text-[#88aa90] hover:text-[#00ff66] transition-all font-mono text-xs"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/25 flex items-center justify-center text-[#00ff66]">
                        <Plus className="w-5 h-5" />
                      </div>
                      <span className="font-bold">Add Photo Slot</span>
                      <span className="text-[10px] opacity-70">
                        Slot {aboutPhotos.length + 1} of 8
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* General Section Items (headings, texts, etc.) */}
            {currentSectionItems.map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-xs font-bold text-white flex items-center gap-2">
                    <span className="text-[#00ff66]">&gt;</span> {item.label}
                  </label>
                  <span className="text-[10px] font-mono text-[#88aa90]">{item.key}</span>
                </div>

                {item.type === "image" ? (
                  <div className="p-4 rounded-xl bg-[#020703] border border-[#00ff66]/20 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg bg-[#040e06] border border-[#00ff66]/30 flex items-center justify-center p-2 flex-shrink-0">
                        <img
                          src={contentValues[item.key] ?? item.value}
                          alt="Logo Preview"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/logo.png";
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold text-white">Current Logo Preview</p>
                        <p className="font-mono text-[11px] text-[#88aa90]">
                          Displayed in the floating navbar on every page.
                        </p>
                      </div>
                    </div>
                    <ImageUploader
                      value={contentValues[item.key] ?? item.value}
                      onChange={(url) => handleChange(item.key, url)}
                      label="Upload New Logo or Enter URL"
                    />
                  </div>
                ) : item.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={contentValues[item.key] ?? item.value}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="w-full bg-[#020603] border border-[#00ff66]/25 focus:border-[#00ff66] rounded-lg p-3 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#00ff66]"
                  />
                ) : (
                  <input
                    type={item.type === "url" ? "url" : "text"}
                    value={contentValues[item.key] ?? item.value}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="w-full bg-[#020603] border border-[#00ff66]/25 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#00ff66]"
                  />
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-[#00ff66]/15 flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#88aa90]">
                Changes are immediately reflected on the live website.
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#00ff66] hover:bg-[#00e65b] text-black font-mono font-bold text-xs tracking-wider px-5 py-2.5 rounded-lg flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
