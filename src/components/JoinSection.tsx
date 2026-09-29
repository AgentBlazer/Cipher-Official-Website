import { API_BASE } from "../lib/api.ts";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScrambleText } from '../hooks/useScrambleText.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface JoinSectionProps {
  onOpenJoinModal: () => void;
}

export const JoinSection: React.FC<JoinSectionProps> = ({ onOpenJoinModal }) => {
  const { theme } = useTheme();
  const [heading, setHeading] = useState("Join the Team");
  const [text, setText] = useState(
    "Whether you want to build, lead, or simply learn — CIPHER is where CSE students turn curiosity into capability. Join the community and help shape what comes next."
  );

  const { displayText, ref } = useScrambleText(heading);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`${API_BASE}/api/public/content`);
        if (res.ok) {
          const json = await res.json();
          if (json.map?.join_heading) setHeading(json.map.join_heading);
          if (json.map?.join_text) setText(json.map.join_text);
        }
      } catch {}
    }
    fetchContent();
  }, []);

  return (
    <section id="join" className="relative py-10 sm:py-14 md:py-16 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
        
        <div className="font-mono text-sm tracking-widest text-emerald-600 dark:text-[#00ff66] mb-3 font-bold">
          // ACCESS CLUB
        </div>

        <h2
          ref={ref}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 font-sans dark:text-glow text-black dark:text-white"
          style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
        >
          {displayText}
        </h2>

        <p
          className="font-sans text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10 text-gray-800 dark:text-[#c4ded0]"
          style={{ color: theme === "dark" ? "#c4ded0" : "#2d3748" }}
        >
          {text}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link
            to="/contact"
            className="bg-emerald-600 hover:bg-emerald-500 dark:bg-[#00ff66] dark:hover:bg-[#00e65b] text-white dark:text-[#030804] font-sans font-bold text-sm tracking-wider px-8 py-3.5 rounded-lg shadow-md dark:shadow-[0_0_20px_rgba(0,255,102,0.4)] transition-all hover:scale-105"
          >
            JOIN &rarr;
          </Link>

          <button
            onClick={scrollToTop}
            className="border border-gray-300 dark:border-[#00ff66]/60 text-gray-700 dark:text-[#00ff66] hover:bg-gray-100 dark:hover:bg-[#00ff66]/10 font-sans font-semibold text-sm tracking-wider px-8 py-3.5 rounded-lg transition-all hover:scale-105"
          >
            BACK TO TOP
          </button>
        </div>

      </div>
    </section>
  );
};