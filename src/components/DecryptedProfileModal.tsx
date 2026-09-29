import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ShieldCheck } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "./Icons.tsx";
import { TeamMemberData } from "../data/teamMembers.ts";
import { useTheme } from "../context/ThemeContext.tsx";

interface DecryptedProfileModalProps {
  member: TeamMemberData | null;
  onClose: () => void;
}

const HEX_CHARS = "0123456789ABCDEF!#_<>*%$";

export const DecryptedProfileModal: React.FC<DecryptedProfileModalProps> = ({
  member,
  onClose,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Picture Reveal Animation
  useEffect(() => {
    if (!member) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = member.modalPhotoUrl || member.photoUrl;

    let startTime = 0;
    const TOTAL_DURATION = 1200; // ms
    const COLS = 12;
    const ROWS = 16;
    const totalTiles = COLS * ROWS;

    // Shuffle tile indices
    const tileOrder: number[] = Array.from({ length: totalTiles }, (_, i) => i);
    for (let i = tileOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tileOrder[i], tileOrder[j]] = [tileOrder[j], tileOrder[i]];
    }

    const render = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / TOTAL_DURATION);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.offsetWidth || 280;
      const height = canvas.offsetHeight || 360;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Background color depending on mode
      ctx.fillStyle = isDark ? "#030a05" : "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      // Draw progressive reveal tiles
      if (img.complete && img.naturalWidth > 0) {
        // Proper cover crop calculation so image is never squished
        const hRatio = width / img.naturalWidth;
        const vRatio = height / img.naturalHeight;
        const ratio = Math.max(hRatio, vRatio);
        const sWidth = width / ratio;
        const sHeight = height / ratio;
        const sX = (img.naturalWidth - sWidth) / 2;
        const sY = (img.naturalHeight - sHeight) / 2;

        const tileW = width / COLS;
        const tileH = height / ROWS;
        const imgTileW = sWidth / COLS;
        const imgTileH = sHeight / ROWS;

        let resolvedTiles = 0;
        if (progress > 0.12) {
          const p = Math.min(1, (progress - 0.12) / 0.75);
          resolvedTiles = Math.floor(p * totalTiles);
        }

        const resolvedSet = new Set(tileOrder.slice(0, resolvedTiles));

        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const idx = r * COLS + c;
            const x = c * tileW;
            const y = r * tileH;

            if (resolvedSet.has(idx)) {
              // Real image portion (sampled from cover-crop rect)
              ctx.drawImage(
                img,
                sX + c * imgTileW,
                sY + r * imgTileH,
                imgTileW,
                imgTileH,
                x,
                y,
                tileW + 0.5,
                tileH + 0.5
              );
            } else {
              // Animated cyber grid tiles
              ctx.fillStyle = isDark ? "rgba(3, 12, 6, 0.95)" : "rgba(241, 245, 249, 0.95)";
              ctx.fillRect(x, y, tileW, tileH);

              ctx.fillStyle = isDark
                ? Math.random() > 0.3 ? "#00ff66" : "#00cc55"
                : Math.random() > 0.3 ? "#059669" : "#10b981";
              ctx.font = `${Math.max(10, Math.floor(tileH * 0.55))}px monospace`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              const char = HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
              ctx.fillText(char, x + tileW / 2, y + tileH / 2);
            }
          }
        }
      }

      // Scanning line sweep
      const laserY = ((elapsed % 650) / 650) * height;
      const grad = ctx.createLinearGradient(0, laserY - 12, 0, laserY + 12);
      grad.addColorStop(0, "rgba(0, 255, 102, 0)");
      grad.addColorStop(0.5, isDark ? "rgba(0, 255, 102, 0.4)" : "rgba(5, 150, 105, 0.35)");
      grad.addColorStop(1, "rgba(0, 255, 102, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, laserY - 12, width, 24);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        // Final clean, crisp, neat photo with proper cover crop
        if (img.complete && img.naturalWidth > 0) {
          const hRatio = width / img.naturalWidth;
          const vRatio = height / img.naturalHeight;
          const ratio = Math.max(hRatio, vRatio);
          const sWidth = width / ratio;
          const sHeight = height / ratio;
          const sX = (img.naturalWidth - sWidth) / 2;
          const sY = (img.naturalHeight - sHeight) / 2;
          ctx.drawImage(img, sX, sY, sWidth, sHeight, 0, 0, width, height);
        }
      }
    };

    // Start the reveal only once the photo has loaded (or failed), so it never ends on an empty frame.
    let cancelled = false;
    const start = () => {
      if (!cancelled) animFrameRef.current = requestAnimationFrame(render);
    };
    if (img.complete) start();
    else {
      img.onload = start;
      img.onerror = start;
    }
    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [member, isDark]);

  if (!member) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] w-screen h-screen flex items-center justify-center p-4 overflow-y-auto animate-fade-in ${
        isDark ? "bg-black/85 backdrop-blur-xl" : "bg-black/40 backdrop-blur-md"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl my-auto p-6 sm:p-8 md:p-10 transition-colors ${
          isDark
            ? "bg-[#040e06] border-2 border-[#00ff66]/40 shadow-[0_0_90px_rgba(0,255,102,0.35)] text-white"
            : "bg-white border border-gray-200 shadow-2xl text-gray-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all ${
            isDark
              ? "bg-[#06140a] border-[#00ff66]/30 text-[#88aa90] hover:text-[#00ff66] hover:border-[#00ff66]"
              : "bg-gray-100 border-gray-300 text-gray-600 hover:text-black hover:bg-gray-200"
          }`}
          aria-label="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5">
          {/* Clean Picture Box with Animation — Tall Portrait Dimensions */}
          <div
            className={`relative w-[260px] sm:w-[320px] h-[340px] sm:h-[400px] rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-colors ${
              isDark
                ? "border-[#00ff66]/50 shadow-[0_0_30px_rgba(0,255,102,0.25)] bg-[#020704]"
                : "border-emerald-500/40 shadow-xl bg-gray-100"
            }`}
          >
            <canvas ref={canvasRef} className="w-full h-full object-cover block" />
          </div>

          {/* Member Details */}
          <div className="space-y-1.5 pt-1">
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-mono text-xs font-bold tracking-widest uppercase border ${
                isDark
                  ? "bg-[#00ff66]/10 border-[#00ff66]/30 text-[#00ff66]"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{member.role}</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-sans tracking-tight"
              style={{ color: isDark ? "#ffffff" : "#000000" }}
            >
              {member.name}
            </h2>
            <p
              className="font-mono text-xs"
              style={{ color: isDark ? "#88aa90" : "#4b5563" }}
            >
              {member.department} · {member.teamYear}
            </p>
          </div>

          {/* Bio (clean) */}
          {member.bio && (
            <p
              className="font-sans text-xs sm:text-sm leading-relaxed max-w-md"
              style={{ color: isDark ? "#b0d2b8" : "#374151" }}
            >
              {member.bio}
            </p>
          )}

          {/* Social Links (LinkedIn, GitHub, Instagram) — Only shown if provided */}
          {(member.linkedin?.trim() || member.github?.trim() || member.instagram?.trim()) && (
            <div className="flex items-center justify-center gap-3 sm:gap-4 pt-2 flex-wrap">
              {member.linkedin && member.linkedin.trim() && (
                <a
                  href={member.linkedin.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border transition-all font-mono text-xs font-semibold ${
                    isDark
                      ? "bg-[#06140a] border-[#00ff66]/25 text-[#88aa90] hover:text-[#00ff66] hover:border-[#00ff66]"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50/50 shadow-sm"
                  }`}
                >
                  <LinkedinIcon className="w-4 h-4 text-emerald-600 dark:text-[#00ff66]" />
                  <span>LinkedIn</span>
                </a>
              )}
              {member.github && member.github.trim() && (
                <a
                  href={member.github.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border transition-all font-mono text-xs font-semibold ${
                    isDark
                      ? "bg-[#06140a] border-[#00ff66]/25 text-[#88aa90] hover:text-[#00ff66] hover:border-[#00ff66]"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50/50 shadow-sm"
                  }`}
                >
                  <GithubIcon className="w-4 h-4 text-emerald-600 dark:text-[#00ff66]" />
                  <span>GitHub</span>
                </a>
              )}
              {member.instagram && member.instagram.trim() && (
                <a
                  href={member.instagram.trim()}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border transition-all font-mono text-xs font-semibold ${
                    isDark
                      ? "bg-[#06140a] border-[#00ff66]/25 text-[#88aa90] hover:text-[#00ff66] hover:border-[#00ff66]"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50/50 shadow-sm"
                  }`}
                >
                  <InstagramIcon className="w-4 h-4 text-emerald-600 dark:text-[#00ff66]" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
