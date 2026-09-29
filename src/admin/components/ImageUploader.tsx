import React, { useState, useRef } from "react";
import { API_BASE } from "../../lib/api.ts";
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";
import { useToast } from "../context/ToastContext.tsx";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = "Photograph / Image",
  placeholder = "/assets/...",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error, success } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      error("Please upload an image file (PNG, JPG, WEBP, GIF, SVG).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      error("File size must be under 8MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/admin/media/upload`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: localStorage.getItem("cipher_token")
            ? `Bearer ${localStorage.getItem("cipher_token")}`
            : "",
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.url) {
        onChange(data.data.url);
        success("Image uploaded successfully!");
      } else {
        error(data.message || "Failed to upload image.");
      }
    } catch {
      error("Network error during image upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="font-mono text-xs text-[#00ff66] tracking-wider uppercase">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-[#040e07] p-0.5 rounded border border-[#00ff66]/20">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              mode === "upload" ? "bg-[#00ff66] text-black font-bold" : "text-[#88aa90] hover:text-white"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              mode === "url" ? "bg-[#00ff66] text-black font-bold" : "text-[#88aa90] hover:text-white"
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            value
              ? "border-[#00ff66]/40 bg-[#06140a]/40"
              : "border-[#00ff66]/20 bg-[#030905]/60 hover:border-[#00ff66]/60 hover:bg-[#06140a]/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="w-8 h-8 text-[#00ff66] animate-spin" />
              <span className="font-mono text-xs text-[#a0c0a8]">Uploading image...</span>
            </div>
          ) : value ? (
            <div className="relative group w-full flex items-center justify-center py-2">
              <img
                src={value}
                alt="Preview"
                className="max-h-36 max-w-full rounded-lg object-contain border border-[#00ff66]/30 shadow-[0_0_15px_rgba(0,255,102,0.2)]"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="absolute top-0 right-0 p-1 bg-red-600/90 text-white rounded-full hover:bg-red-500 shadow-md"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
              <div className="w-10 h-10 rounded-full bg-[#00ff66]/10 flex items-center justify-center text-[#00ff66] mb-1">
                <Upload className="w-5 h-5" />
              </div>
              <p className="font-mono text-xs text-white">Click or drag image to upload</p>
              <p className="text-[11px] text-[#88aa90]">JPEG, PNG, WEBP, GIF up to 8MB</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="relative flex items-center">
            <LinkIcon className="w-4 h-4 text-[#88aa90] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-[#030a05] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg pl-9 pr-8 py-2 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#00ff66]"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-2 p-1 text-[#88aa90] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {value && (
            <div className="flex items-center gap-3 p-2 bg-[#040e07] rounded-lg border border-[#00ff66]/20">
              <img
                src={value}
                alt="Preview"
                className="w-12 h-12 rounded object-cover border border-[#00ff66]/30 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/logo.png";
                }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-mono text-[#00ff66] truncate">{value}</span>
                <span className="text-[10px] text-[#88aa90]">Image preview</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};