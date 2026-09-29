import { API_BASE } from "../lib/api.ts";
import React, { useState, useEffect } from "react";
import { Team3DCarousel } from "../components/Team3DCarousel.tsx";
import { DecryptedProfileModal } from "../components/DecryptedProfileModal.tsx";
import { TeamMemberData, DEFAULT_TEAM_MEMBERS } from "../data/teamMembers.ts";
import { useTheme } from "../context/ThemeContext.tsx";

export const TeamPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [members, setMembers] = useState<TeamMemberData[]>(DEFAULT_TEAM_MEMBERS);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMemberData | null>(null);

  // Dynamic header settings configurable by admin
  const [headerTitle, setHeaderTitle] = useState("Core Team");
  const [headerSubtitle, setHeaderSubtitle] = useState(
    "The minds shaping Cipher Club's tech culture at SJEC — elected officers and domain leads driving every initiative."
  );
  const [headerPastSubtitle, setHeaderPastSubtitle] = useState(
    "Former office bearers and alumni domain leads who guided the Cipher student association."
  );

  useEffect(() => {
    // Fetch dynamic site content for header customizations
    fetch(`${API_BASE}/api/public/content`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.map) {
          if (json.map.team_title) setHeaderTitle(json.map.team_title);
          if (json.map.team_subtitle) setHeaderSubtitle(json.map.team_subtitle);
          if (json.map.team_past_subtitle) setHeaderPastSubtitle(json.map.team_past_subtitle);
        }
      })
      .catch(() => {});

    async function fetchMembers() {
      try {
        const res = await fetch(`${API_BASE}/api/public/members`);
        if (res.ok) {
           const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            const mapped: TeamMemberData[] = json.data.map((m: any) => ({
              id: m.id,
              name: m.name,
              role: m.role,
              department: m.department || "Computer Science & Engineering",
              teamYear: m.teamYear || "2025-26",
              bio: m.bio || "",
              photoUrl: m.photoUrl || "/assets/leaders/placeholder.svg",
              modalPhotoUrl: m.modalPhotoUrl || m.photoUrl,
              github: m.github || "",
              linkedin: m.linkedin || "",
              instagram: m.instagram || "",
              displayOrder: m.displayOrder || 0,
              isActive: m.isActive !== false,
            }));

            // Use ONLY API data — show only years the admin has actually added members for
            setMembers(mapped);
          }
        }
      } catch {
        // Fall back to DEFAULT_TEAM_MEMBERS
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  // Extract unique years sorted descending (newest first: 2025-26, 2024-25, etc.)
  const years = Array.from(
    new Set(members.map((m) => m.teamYear || "2025-26"))
  ).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-2 pb-16 font-sans">
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-3">
            <div
              className={`w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto ${
                isDark ? "border-[#00ff66]" : "border-emerald-500"
              }`}
            />
            <p
              className="font-mono text-xs"
              style={{ color: isDark ? "#88aa90" : "#6b7280" }}
            >
              Loading 3D team arrays...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          {years.map((year, idx) => {
            const yearMembers = members
              .filter((m) => (m.teamYear || "2025-26") === year)
              .sort((a, b) => a.displayOrder - b.displayOrder);

            if (yearMembers.length === 0) return null;

            const isLatestYear = idx === 0;
            const subtitle = isLatestYear ? headerSubtitle : (headerPastSubtitle || headerSubtitle);

            return (
              <section key={year} className="relative">
                {/* ── Section Header (Compact to fit in one screen view) ────────── */}
                <div className="text-center mb-2">
                  <h2
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-2 font-sans"
                    style={{ color: isDark ? "#ffffff" : "#000000" }}
                  >
                    {headerTitle.includes("{year}") ? (
                      headerTitle.replace("{year}", year)
                    ) : (
                      <>
                        {headerTitle}{" "}
                        <span
                          className={`inline-block px-3 py-0.5 rounded-xl border-2 ${
                            isDark
                              ? "text-[#00ff66] border-[#00ff66] dark:text-glow"
                              : "text-emerald-600 border-emerald-600"
                          }`}
                        >
                          {year}
                        </span>
                      </>
                    )}
                  </h2>

                  <p
                    className="text-xs sm:text-sm font-sans leading-relaxed max-w-lg mx-auto"
                    style={{ color: isDark ? "#a0c0a8" : "#4b5563" }}
                  >
                    {subtitle}
                  </p>
                </div>

                {/* ── 3D Circular Motion Revolving Carousel ─────────────────────── */}
                <div className="w-full flex justify-center">
                  <Team3DCarousel
                    members={yearMembers}
                    onSelectMember={(m) => setSelectedMember(m)}
                    year={year}
                  />
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ── Pop-Up Cyber Decryption Profile Modal ────────────────────────────── */}
      <DecryptedProfileModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};
