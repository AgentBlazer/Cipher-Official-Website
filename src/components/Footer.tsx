import { API_BASE } from "../lib/api.ts";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Terminal,
} from "lucide-react";
import { LinkedinIcon, InstagramIcon } from "./Icons.tsx";
import { useTheme } from "../context/ThemeContext.tsx";

interface FooterProps {
  onOpenRootAccess?: () => void;
  onOpenJoinModal?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [linkedin, setLinkedin] = useState("https://www.linkedin.com/company/ciphersjec/");
  const [instagram, setInstagram] = useState("https://www.instagram.com/ciphersjec/");
  const [copyright, setCopyright] = useState("© 2026 CIPHER SJEC. All Rights Reserved.");
  const [logoUrl, setLogoUrl] = useState("/assets/logo.png");

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`${API_BASE}/api/public/content`);
        if (res.ok) {
          const json = await res.json();
          if (json.map) {
            if (json.map.linkedin_url) setLinkedin(json.map.linkedin_url);
            if (json.map.instagram_url) setInstagram(json.map.instagram_url);
            if (json.map.footer_copyright) setCopyright(json.map.footer_copyright);
            if (json.map.site_logo_url) setLogoUrl(json.map.site_logo_url);
          }
        }
      } catch {}
    }
    fetchContent();
  }, []);

  return (
    <footer
      className={`relative w-full border-t transition-colors duration-300 font-sans select-none ${
        isDark
          ? "bg-[#020703] border-[#00ff66]/15 text-white"
          : "bg-white border-gray-200 text-gray-900"
      }`}
    >
      {/* Subtle top ambient glow in dark mode */}
      {isDark && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-[#00ff66]/5 blur-3xl pointer-events-none" />
      )}

      {/* Main Full-Width Content Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-12 relative z-10">
        
        {/* ── Top Row: Left Narrative & Right Navigation Columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Side: Shaping Tomorrow's Engineers */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-semibold tracking-wider uppercase border w-fit bg-emerald-50 dark:bg-[#00ff66]/10 border-emerald-200 dark:border-[#00ff66]/30 text-emerald-700 dark:text-[#00ff66]">
              <Terminal className="w-3.5 h-3.5" />
              <span>COMMUNICATION CHANNEL</span>
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight font-sans"
              style={{ color: isDark ? "#ffffff" : "#000000" }}
            >
              SHAPING TOMORROW'S ENGINEERS, HACKERS &amp; BUILDERS.
            </h2>

            <p
              className="text-base sm:text-lg leading-relaxed max-w-xl"
              style={{ color: isDark ? "#a0c0a8" : "#4b5563" }}
            >
              Have an initiative, workshop idea, or campus sponsorship in mind? Let us engineer something extraordinary together.
            </p>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono pt-2" style={{ color: isDark ? "#88aa90" : "#6b7280" }}>
              <span className="flex items-center gap-2 text-emerald-600 dark:text-[#00ff66] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#00ff66] animate-pulse" />
                SYSTEM ACTIVE
              </span>
              <span>•</span>
              <span>ST JOSEPH ENGINEERING COLLEGE</span>
              <span>•</span>
              <span>DEPT. OF CSE</span>
            </div>
          </div>

          {/* Right Side: Bigger, Prominent Menu Columns */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-10 sm:gap-16 pt-2 lg:pt-4">
            
            {/* Column 1: Explore */}
            <div>
              <h3 className="text-sm sm:text-base font-mono font-bold uppercase tracking-widest text-emerald-700 dark:text-[#00ff66] mb-5 sm:mb-6">
                // EXPLORE
              </h3>
              <ul className="space-y-4 sm:space-y-5 text-sm sm:text-base font-sans font-medium" style={{ color: isDark ? "#88aa90" : "#4b5563" }}>
                <li>
                  <Link to="/" className="hover:text-emerald-600 dark:hover:text-[#00ff66] hover:translate-x-1.5 transition-all inline-flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-[#00ff66] font-bold">&gt;</span> Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-emerald-600 dark:hover:text-[#00ff66] hover:translate-x-1.5 transition-all inline-flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-[#00ff66] font-bold">&gt;</span> About
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="hover:text-emerald-600 dark:hover:text-[#00ff66] hover:translate-x-1.5 transition-all inline-flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-[#00ff66] font-bold">&gt;</span> Events
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Initiatives */}
            <div>
              <h3 className="text-sm sm:text-base font-mono font-bold uppercase tracking-widest text-emerald-700 dark:text-[#00ff66] mb-5 sm:mb-6">
                // INITIATIVES
              </h3>
              <ul className="space-y-4 sm:space-y-5 text-sm sm:text-base font-sans font-medium" style={{ color: isDark ? "#88aa90" : "#4b5563" }}>
                <li>
                  <Link to="/team" className="hover:text-emerald-600 dark:hover:text-[#00ff66] hover:translate-x-1.5 transition-all inline-flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-[#00ff66] font-bold">&gt;</span> Team
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-emerald-600 dark:hover:text-[#00ff66] hover:translate-x-1.5 transition-all inline-flex items-center gap-2 text-emerald-700 dark:text-[#00ff66] font-bold">
                    <span className="text-emerald-600 dark:text-[#00ff66] font-bold">&gt;</span> Join / Contact
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ── Below the Line: Social Logos & (Full Cipher Logo + Copyright) ── */}
        <div className="mt-14 pt-8 border-t border-gray-200 dark:border-[#00ff66]/15 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Left: Social Icons (Instagram, LinkedIn) */}
          <div className="flex items-center gap-3.5">
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                  isDark
                    ? "border-[#00ff66]/30 hover:border-[#00ff66] hover:bg-[#00ff66]/10 text-[#00ff66]"
                    : "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700"
                }`}
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}


            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                  isDark
                    ? "border-[#00ff66]/30 hover:border-[#00ff66] hover:bg-[#00ff66]/10 text-[#00ff66]"
                    : "border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700"
                }`}
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Right: Full Cipher Logo & Bigger Copyright */}
          <div className="flex flex-col items-center sm:items-end gap-2">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt="Cipher Logo"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-md dark:drop-shadow-[0_0_14px_rgba(0,255,102,0.7)]"
                onError={() => setLogoUrl("/assets/logo.png")}
              />
              <span className="font-sans font-black text-base sm:text-lg tracking-wider text-black dark:text-[#00ff66]">
                CIPHER
              </span>
            </div>
            <span className="text-xs sm:text-sm font-mono tracking-tight" style={{ color: isDark ? "#88aa90" : "#6b7280" }}>
              {copyright}
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
};
