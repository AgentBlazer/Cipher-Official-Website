import { API_BASE } from "../lib/api.ts";
import React, { useState, useEffect } from 'react';
import { Code2, Crown, Users, Rocket, Cpu, Terminal, Shield, Sparkles } from 'lucide-react';
import { useScrambleText } from '../hooks/useScrambleText.ts';
import { useTheme } from '../context/ThemeContext.tsx';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Crown,
  Users,
  Rocket,
  Cpu,
  Terminal,
  Shield,
  Sparkles,
};

interface DomainItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sessions: string;
  description: string;
}

const DEFAULT_DOMAIN_DATA: DomainItem[] = [
  {
    icon: Code2,
    title: "Technical Skill Building",
    sessions: "5 SESSIONS",
    description: "Hands-on workshops, coding sessions, and tech talks that turn theory into working software."
  },
  {
    icon: Crown,
    title: "Leadership & Governance",
    sessions: "3 SESSIONS",
    description: "Annual elections for President, Secretary, and office bearers — guided by the HOD and Faculty Coordinator."
  },
  {
    icon: Users,
    title: "Events & Collaboration",
    sessions: "8 SESSIONS",
    description: "Hackathons, seminars, and department-level competitions that bring students together."
  },
  {
    icon: Rocket,
    title: "Industry Readiness",
    sessions: "4 SESSIONS",
    description: "Bridging classroom learning with real-world application to prepare students for the field."
  }
];

export const Domains: React.FC = () => {
  const { theme } = useTheme();
  const { displayText, ref } = useScrambleText("Our Domains");
  const [domains, setDomains] = useState<DomainItem[]>(DEFAULT_DOMAIN_DATA);

  useEffect(() => {
    async function fetchDomains() {
      try {
        const res = await fetch(`${API_BASE}/api/public/domains`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: DomainItem[] = json.data.map((d: any) => ({
              icon: ICON_MAP[d.iconName] || Code2,
              title: d.name,
              sessions: d.sessionsLabel || '0 SESSIONS',
              description: d.description,
            }));
            setDomains(mapped);
          }
        }
      } catch {}
    }
    fetchDomains();
  }, []);

  return (
    <section id="domains" className="relative py-8 sm:py-12 md:py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="mb-12">
          <div className="font-mono text-sm tracking-widest text-emerald-600 dark:text-[#00ff66] mb-3 font-bold">
            // WHAT WE DO
          </div>
          <h2
            ref={ref}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-sans dark:text-glow text-black dark:text-white"
            style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
          >
            {displayText}
          </h2>
        </div>

        {/* 2x2 Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {domains.map((domain, idx) => {
            const Icon = domain.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-xl p-8 bg-white dark:bg-[#08160c]/70 backdrop-blur-md border border-gray-200 dark:border-[#00ff66]/15 hover:border-emerald-500 dark:hover:border-[#00ff66]/60 transition-all duration-300 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_0_25px_rgba(0,255,102,0.18)] hover:-translate-y-1"
              >
                {/* Top Row: Icon + Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-[#00ff66]/10 border border-emerald-200 dark:border-[#00ff66]/30 flex items-center justify-center text-emerald-600 dark:text-[#00ff66] group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-[#00ff66] dark:group-hover:text-black transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <span className="font-sans text-xs tracking-wider text-emerald-700 dark:text-[#00ff66] font-bold px-2.5 py-1 rounded bg-emerald-50 dark:bg-[#00ff66]/5 border border-emerald-200 dark:border-[#00ff66]/20 uppercase">
                    {domain.sessions}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-xl sm:text-2xl font-bold mb-3 font-sans group-hover:text-emerald-600 dark:group-hover:text-[#00ff66] transition-colors text-black dark:text-white"
                  style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
                >
                  {domain.title}
                </h3>

                {/* Description */}
                <p
                  className="font-sans text-sm sm:text-base leading-relaxed text-gray-800 dark:text-[#c4ded0]"
                  style={{ color: theme === "dark" ? "#c4ded0" : "#2d3748" }}
                >
                  {domain.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};