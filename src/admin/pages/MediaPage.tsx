import React, { useState, useEffect } from "react";
import { API_BASE } from "../../lib/api.ts";
import { Upload, Trash2, Copy, Check, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";
import { ImageUploader } from "../components/ImageUploader.tsx";
import { ConfirmDialog } from "../components/ConfirmDialog.tsx";
import { useToast } from "../context/ToastContext.tsx";

interface MediaAsset {
  id: string;
  url: string;
  publicId?: string | null;
  filename: string;
  format?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
}

export const MediaPage: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadValue, setUploadValue] = useState("");

  const { success, error } = useToast();

  const loadMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/media`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && data.success) {
        setAssets(data.data || []);
      }
    } catch {
      error("Failed to load media assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    success("Image URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/media/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        success("Media asset deleted.");
        setDeleteId(null);
        loadMedia();
      } else {
        error("Failed to delete media asset.");
      }
    } catch {
      error("Network error deleting media.");
    }
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "--";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white">Media Asset Library</h2>
          <p className="font-mono text-xs text-[#88aa90]">
            Upload and manage photographs, logos, posters, and gallery slides
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-[#030905] p-6 rounded-xl border border-[#00ff66]/20">
        <ImageUploader
          label="Upload New Media File to Cloud / Storage"
          value={uploadValue}
          onChange={(url) => {
            setUploadValue(url);
            if (url) {
              loadMedia();
              setUploadValue("");
            }
          }}
        />
      </div>

      {/* Media Grid */}
      <div className="bg-[#030905] p-6 rounded-xl border border-[#00ff66]/20">
        <h3 className="font-mono text-xs font-bold text-[#00ff66] tracking-wider uppercase mb-4">
          Stored Assets ({assets.length})
        </h3>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#00ff66] animate-spin" />
            <p className="font-mono text-xs text-[#88aa90]">Loading library...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-mono text-sm text-[#88aa90]">No media uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {assets.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl bg-[#040e06] border border-[#00ff66]/20 hover:border-[#00ff66] transition-all overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/logo.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => copyUrl(item.id, item.url)}
                      className="p-2 rounded bg-[#00ff66] text-black font-mono text-xs hover:bg-[#00e65b] transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-2 rounded bg-red-600 text-white hover:bg-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5 border-t border-[#00ff66]/15">
                  <p className="font-mono text-[11px] font-bold text-white truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#88aa90] mt-1">
                    <span className="uppercase">{item.format || "IMG"}</span>
                    <span>{formatSize(item.sizeBytes)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Media Asset"
        message="Are you sure you want to delete this media file? Any page referencing this URL directly will be affected."
      />
    </div>
  );
};