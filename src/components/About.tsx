import { API_BASE } from "../lib/api.ts";
import React, { useState, useEffect, useRef } from "react";
import { useScrambleText } from "../hooks/useScrambleText.ts";
import { useTheme } from "../context/ThemeContext.tsx";

const DEFAULT_ABOUT_PHOTOS = [
  "/assets/about/about_1.jpg",
  "/assets/about/about_2.jpg",
  "/assets/about/about_3.jpg",
  "/assets/about/about_4.jpg",
];

// 8 perimeter-oriented layout presets for floating cards so center "CIPHER" is never blocked
const PHOTO_PRESETS = [
  // 1: Top-Left
  {
    posClass: "-top-2 -left-1 sm:top-0 sm:left-2 w-32 sm:w-52 h-24 sm:h-36 z-10",
    rotate: "-6deg",
  },
  // 2: Bottom-Right
  {
    posClass: "-bottom-2 -right-1 sm:bottom-1 sm:right-2 w-[8.5rem] sm:w-56 h-[6.5rem] sm:h-40 z-10",
    rotate: "4deg",
  },
  // 3: Bottom-Left
  {
    posClass: "-bottom-2 left-2 sm:bottom-0 sm:left-10 w-28 sm:w-48 h-[5.5rem] sm:h-32 z-10",
    rotate: "-3deg",
  },
  // 4: Top-Right
  {
    posClass: "-top-2 right-1 sm:top-2 sm:right-6 w-[7.5rem] sm:w-48 h-[5.5rem] sm:h-[8.5rem] z-10",
    rotate: "6deg",
  },
  // 5: Far-Left Perimeter
  {
    posClass: "top-1/4 -left-3 sm:-left-4 w-[6.5rem] sm:w-44 h-20 sm:h-[7.5rem] z-10",
    rotate: "-5deg",
  },
  // 6: Far-Right Perimeter
  {
    posClass: "top-1/3 -right-3 sm:-right-4 w-28 sm:w-[11.5rem] h-20 sm:h-32 z-10",
    rotate: "5deg",
  },
  // 7: Bottom-Center Low
  {
    posClass: "bottom-0 left-1/3 w-28 sm:w-48 h-20 sm:h-32 z-10",
    rotate: "-2deg",
  },
  // 8: Top-Center High
  {
    posClass: "-top-1 left-1/3 w-28 sm:w-44 h-20 sm:h-[7.5rem] z-10",
    rotate: "3deg",
  },
];

export const About: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [aboutTitle, setAboutTitle] = useState("Who we are");
  const { displayText, ref } = useScrambleText(aboutTitle);
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  // Card under the pointer (or last tapped on touch screens) pops up in front of the others.
  const [hovered, setHovered] = useState<number | null>(null);
  // Touch taps also fire mouseenter, so hover handlers only apply on real hover devices and taps toggle instead.
  const [canHover] = useState(() => window.matchMedia("(hover: hover)").matches);
  // True once the staggered entrance has finished, so hover transitions run instantly without its delays.
  const [entered, setEntered] = useState(false);

  const [aboutText, setAboutText] = useState(
    "CIPHER is the student association of the Department of Computer Science & Engineering. It serves as a platform for students to nurture their technical and interpersonal skills through innovative and collaborative activities. The association strives to bridge the gap between academic knowledge and practical application, fostering a community of aspiring professionals dedicated to excellence in computing."
  );

  const [photos, setPhotos] = useState<string[]>(DEFAULT_ABOUT_PHOTOS);

  // Fetch dynamic content and photos
  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`${API_BASE}/api/public/content`);
        if (res.ok) {
          const json = await res.json();
          if (json.map?.about_title) {
            setAboutTitle(json.map.about_title);
          }
          if (json.map?.about_text) {
            setAboutText(json.map.about_text);
          }

          let loadedPhotos: string[] = [];
          if (json.map?.about_photos) {
            try {
              const parsed = JSON.parse(json.map.about_photos);
              if (Array.isArray(parsed) && parsed.length > 0) {
                loadedPhotos = parsed.filter((p) => Boolean(p?.trim()));
              }
            } catch {
              // fallback
            }
          }

          if (loadedPhotos.length === 0) {
            for (let i = 1; i <= 8; i++) {
              const url = json.map?.[`about_photo_${i}`];
              if (url && url.trim()) {
                loadedPhotos.push(url.trim());
              }
            }
          }

          if (loadedPhotos.length > 0) {
            setPhotos(loadedPhotos.slice(0, 8));
          }
        }
      } catch {
        // Fallback to default photos
      }
    }
    fetchContent();
  }, []);

  // Trigger pop-up only when reaching "Who we are" section
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        } else {
          setIsInView(false);
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) {
      setEntered(false);
      setHovered(null);
      return;
    }
    const timer = setTimeout(() => setEntered(true), (photos.length - 1) * 130 + 700);
    return () => clearTimeout(timer);
  }, [isInView, photos.length]);

  return (
    <section ref={sectionRef} id="about" className="relative py-8 sm:py-12 md:py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Narrative Content */}
          <div className="lg:col-span-7">
            <div className="font-mono text-sm tracking-widest text-emerald-600 dark:text-[#00ff66] mb-3 font-bold">
              // ABOUT
            </div>

            <h2
              ref={ref}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-8 font-sans dark:text-glow text-black dark:text-white"
              style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
            >
              {displayText}
            </h2>

            <p
              className="font-sans text-base sm:text-lg leading-relaxed max-w-xl text-gray-800 dark:text-[#c4ded0]"
              style={{ color: theme === "dark" ? "#c4ded0" : "#2d3748" }}
            >
              {aboutText}
            </p>
          </div>

          {/* Right Column: Giant Wordmark with Staggered Pop-Up Floating Photo Collage */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[440px] sm:min-h-[480px]">
            {/* Giant Background Wordmark — Prominently centered, never covered */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
              <span className="text-6xl sm:text-8xl md:text-9xl font-black tracking-widest text-emerald-800 drop-shadow-[0_0_25px_rgba(5,150,105,0.45)] dark:text-[#00ff66] dark:text-glow-lg dark:opacity-90 dark:drop-shadow-[0_0_35px_rgba(0,255,102,0.8)]">
                CIPHER
              </span>
            </div>

            {/* Floating Photo Cards Stack — Arranged around the perimeter so CIPHER is always readable */}
            <div className="relative z-10 w-full max-w-lg h-[400px] sm:h-[440px] flex items-center justify-center pointer-events-none">
              {photos.map((src, i) => {
                const preset = PHOTO_PRESETS[i % PHOTO_PRESETS.length];
                const delayMs = entered ? 0 : i * 130;
                const isHovered = hovered === i;

                return (
                  <div
                    key={`${src}-${i}`}
                    onMouseEnter={canHover ? () => setHovered(i) : undefined}
                    onMouseLeave={canHover ? () => setHovered((h) => (h === i ? null : h)) : undefined}
                    onClick={canHover ? undefined : () => setHovered((h) => (h === i ? null : i))}
                    className={`absolute ${preset.posClass} rounded-xl overflow-hidden border group pointer-events-auto cursor-pointer ${
                      isHovered
                        ? "border-[#00ff66] shadow-[0_20px_45px_rgba(0,0,0,0.9),0_0_28px_rgba(0,255,102,0.45)]"
                        : "border-[#00ff66]/30 shadow-[0_12px_30px_rgba(0,0,0,0.85)]"
                    }`}
                    style={{
                      transform: !isInView
                        ? "scale(0) rotate(0deg) translateY(30px)"
                        : isHovered
                        ? "scale(1.35) rotate(0deg) translateY(-8px)"
                        : `scale(1) rotate(${preset.rotate}) translateY(0px)`,
                      opacity: isInView ? 1 : 0,
                      zIndex: isHovered ? 30 : undefined,
                      transition: `transform ${entered ? "0.3s" : "0.65s"} cubic-bezier(0.34, 1.56, 0.64, 1) ${delayMs}ms, opacity 0.45s ease ${delayMs}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
                      willChange: "transform, opacity",
                    }}
                  >
                    {/* Corner Reticles */}
                    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00ff66]/70 pointer-events-none z-10" />
                    <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#00ff66]/70 pointer-events-none z-10" />
                    <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#00ff66]/70 pointer-events-none z-10" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#00ff66]/70 pointer-events-none z-10" />

                    {/* Image — Never draggable */}
                    <img
                      src={src}
                      alt={`Cipher initiative ${i + 1}`}
                      draggable={false}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      style={{
                        WebkitUserDrag: "none",
                        userSelect: "none",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/about/about_1.jpg";
                      }}
                    />

                    {/* Subtle cyber scan gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-10 transition-opacity pointer-events-none" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
