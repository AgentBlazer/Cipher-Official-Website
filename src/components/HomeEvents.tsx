import { API_BASE } from "../lib/api.ts";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ArrowRight, Trophy, BookOpen, Sparkles, Layers, ArrowUpRight } from "lucide-react";
import { useScrambleText } from "../hooks/useScrambleText.ts";
import { useTheme } from "../context/ThemeContext.tsx";
import { EventData, EventModal } from "./EventModal.tsx";

const TAG_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  COMPETITION: { color: "#00ff66", bg: "bg-[#00ff66]", icon: <Trophy className="w-3 h-3" /> },
  "BRANCH ENTRY": { color: "#f59e0b", bg: "bg-amber-500", icon: <Sparkles className="w-3 h-3" /> },
  "BRANCH GALA": { color: "#f59e0b", bg: "bg-amber-500", icon: <Sparkles className="w-3 h-3" /> },
  WORKSHOP: { color: "#60a5fa", bg: "bg-blue-400", icon: <BookOpen className="w-3 h-3" /> },
  CAREER: { color: "#a78bfa", bg: "bg-violet-400", icon: <Layers className="w-3 h-3" /> },
  EVENT: { color: "#00ff66", bg: "bg-[#00ff66]", icon: <Calendar className="w-3 h-3" /> },
};

const tagCfg = (tag: string) => TAG_CONFIG[tag] || TAG_CONFIG["EVENT"];

const DEFAULT_FALLBACK_EVENTS: EventData[] = [
  {
    id: "promptops",
    tag: "COMPETITION",
    dateTag: "25 MAR 2026",
    title: "PROMPT OPS-2K26",
    subTitle: "25 MARCH 2026 · PROMPT ENGINEERING COMPETITION",
    slug: "PROMPT_OPS",
    cardSub: "AgentBlazer Club × Cipher",
    description:
      "A technical competition on prompt engineering and AI tools by the AgentBlazer Club and Cipher.",
    fullDescription: [
      "Organized by the AgentBlazer Club and Cipher under the guidance of Ms. Nisha J Roche, Ms. Jaishma K, and HOD Dr. Melwyn D'Souza, this technical competition focused on prompt engineering and AI tools.",
    ],
    slides: [
      "/assets/promptops/slide_01.jpg",
      "/assets/promptops/slide_02.jpg",
      "/assets/promptops/slide_03.jpg",
    ],
  },
  {
    id: "lumiere",
    tag: "BRANCH GALA",
    dateTag: "29 OCT 2025",
    title: "Lumière — The Gala",
    subTitle: "29 OCTOBER 2025 · KALAM AUDITORIUM",
    slug: "LUMIERE_GALA",
    cardSub: "CSE Branch Entry · Kalam Auditorium",
    description:
      "The CSE branch entry programme at Kalam Auditorium, themed 'Where Glam Meets Glow.'",
    fullDescription: [
      "The Department of Computer Science and Engineering (CSE) held its branch entry programme, 'Lumière – The Gala,' on 29 October 2025 at the Kalam Auditorium.",
    ],
    slides: [
      "/assets/lumiere/slide_01.jpg",
      "/assets/lumiere/slide_02.jpg",
      "/assets/lumiere/slide_03.jpg",
    ],
  },
  {
    id: "solidity-workshop",
    tag: "WORKSHOP",
    dateTag: "14 FEB 2026",
    title: "Smart Contract Dev Bootcamp",
    subTitle: "14 FEBRUARY 2026 · TECHNICAL SESSION",
    slug: "SOLIDITY_WORKSHOP",
    cardSub: "Cipher Technical Domain",
    description:
      "A hands-on workshop covering Solidity fundamentals, EVM architecture, and smart contract deployments.",
    fullDescription: [
      "Cipher's Technical Domain track hosted an intensive Solidity and Web3 developer crash course for CSE students.",
    ],
    slides: [
      "/assets/promptops/slide_01.jpg",
      "/assets/promptops/slide_02.jpg",
    ],
  },
];

export const HomeEvents: React.FC = () => {
  const { theme } = useTheme();
  const { displayText, ref } = useScrambleText("Events & Workshops");
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedEvents() {
      try {
        const res = await fetch(`${API_BASE}/api/public/events`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            // Filter by featuredOnHome !== false
            let displayable = json.data.filter((e: any) => e.featuredOnHome !== false);
            // If none marked, take the first 3 or 4
            if (displayable.length === 0) {
              displayable = json.data.slice(0, 3);
            } else {
              // Cap at 4 items
              displayable = displayable.slice(0, 4);
            }

            const mapped: EventData[] = displayable.map((e: any) => ({
              id: e.id,
              tag: e.tag || "EVENT",
              dateTag: e.dateTag || "UPCOMING",
              title: e.title,
              subTitle: e.subTitle || e.title,
              slug: e.slug || e.id,
              cardSub: e.cardSub || "Cipher Association",
              venue: e.venue || "St Joseph Engineering College",
              description: e.shortDesc || e.description || "",
              fullDescription: Array.isArray(e.fullDescription)
                ? e.fullDescription
                : typeof e.fullDescription === "string"
                ? (() => {
                    try {
                      return JSON.parse(e.fullDescription);
                    } catch {
                      return [e.fullDescription];
                    }
                  })()
                : [e.shortDesc || e.description || ""],
              slides:
                Array.isArray(e.slides) && e.slides.length > 0
                  ? e.slides.map((s: any) => (typeof s === "string" ? s : s.imageUrl))
                  : [e.posterUrl || "/assets/promptops/slide_01.jpg"],
            }));

            setEvents(mapped);
            setLoading(false);
            return;
          }
        }
      } catch {
        // use fallback
      }
      setEvents(DEFAULT_FALLBACK_EVENTS);
      setLoading(false);
    }

    loadFeaturedEvents();
  }, []);

  if (!loading && events.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-6 md:px-12 bg-gray-50/50 dark:bg-transparent border-t border-gray-200 dark:border-[#00ff66]/10 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="font-mono text-sm tracking-widest text-emerald-600 dark:text-[#00ff66] mb-3 font-bold">
              // GATHERINGS & SESSIONS
            </div>
            <h2
              ref={ref}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-sans text-black dark:text-white"
              style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
            >
              {displayText}
            </h2>
            <p className="mt-3 font-sans text-sm sm:text-base text-gray-600 dark:text-[#88aa90] max-w-xl">
              Flagship hackathons, hands-on technical bootcamps, and department galas hosted by Cipher.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 self-start md:self-end px-4 py-2.5 rounded-xl font-mono text-xs font-bold text-emerald-700 dark:text-[#00ff66] bg-emerald-50 dark:bg-[#00ff66]/10 border border-emerald-200 dark:border-[#00ff66]/30 hover:bg-emerald-100 dark:hover:bg-[#00ff66]/20 transition-all group"
          >
            <span>VIEW ALL EVENTS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-emerald-500 dark:border-[#00ff66] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 ${
              events.length === 4
                ? "md:grid-cols-2 lg:grid-cols-4"
                : events.length === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-2 lg:grid-cols-3"
            } gap-6`}
          >
            {events.map((event) => {
              const cfg = tagCfg(event.tag);
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="group relative rounded-2xl bg-white dark:bg-[#040e06] border border-gray-200 dark:border-[#00ff66]/20 hover:border-emerald-500 dark:hover:border-[#00ff66] transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_0_25px_rgba(0,255,102,0.2)] hover:-translate-y-1.5 flex flex-col"
                >
                  {/* Image Thumbnail */}
                  <div className="relative w-full h-44 overflow-hidden bg-gray-100 dark:bg-[#020703]">
                    <img
                      src={event.slides[0] || "/assets/promptops/slide_01.jpg"}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/promptops/slide_01.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

                    {/* Tag Badge */}
                    <div
                      className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded ${cfg.bg} text-black font-sans text-[10px] font-bold uppercase tracking-wider shadow`}
                    >
                      {cfg.icon} {event.tag}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Organized By */}
                      {event.cardSub && (
                        <p className="font-mono text-[11px] font-bold text-emerald-600 dark:text-[#00ff66] uppercase tracking-wider mb-1.5 line-clamp-1">
                          {event.cardSub}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-[#88aa90] tracking-wider uppercase mb-2">
                        <Calendar className="w-3 h-3 text-emerald-600 dark:text-[#00ff66]" /> {event.dateTag}
                      </div>

                      <h3 className="font-sans text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-[#00ff66] transition-colors leading-snug mb-2 line-clamp-2">
                        {event.title}
                      </h3>

                      <p className="font-sans text-xs sm:text-sm text-gray-600 dark:text-[#a0c0a8] leading-relaxed line-clamp-2 mb-4">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-[#00ff66]/10 flex items-center justify-between">
                      <span className="font-sans text-xs text-gray-500 dark:text-[#88aa90] flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-emerald-600 dark:text-[#00ff66]" />
                        {event.venue || "SJEC"}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-[#00ff66] group-hover:translate-x-0.5 transition-transform">
                        View More <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for full event details */}
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      </div>
    </section>
  );
};
