import { API_BASE } from "../lib/api.ts";
import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useScrambleText } from '../hooks/useScrambleText.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import { ActivityModal, ActivityItem } from './ActivityModal.tsx';

const DEFAULT_ACTIVITIES_LIST: ActivityItem[] = [
  { id: '01', numberId: '01', title: 'Applied Machine Learning', description: 'Hands-on exploration of classical ML models, feature engineering, and neural network fundamentals with Python and Scikit-Learn.' },
  { id: '02', numberId: '02', title: 'Industrial Visit', description: 'Interactive industrial visit connecting students with industry engineering workflows, production servers, and data centers.' },
  { id: '03', numberId: '03', title: 'LaTeX Tool', description: 'Complete LaTeX typesetting workshop for academic thesis documentation, IEEE research papers, and technical reporting.' },
  { id: '04', numberId: '04', title: 'Robotic Process Automation using UiPath', description: 'End-to-end automation bot development using UiPath Studio, covering workflow scraping, email triggers, and enterprise automation.' },
  { id: '05', numberId: '05', title: 'HackTO Future 20', description: '24-hour departmental hackathon centered on decentralized apps, AI solutions, and IoT prototypes.' },
  { id: '06', numberId: '06', title: 'How to Win at the Sport of Programming', description: 'Competitive programming masterclass covering dynamic programming, graph algorithms, and time complexity optimization.' },
  { id: '07', numberId: '07', title: 'Introduction to Google Crowdsource', description: 'Community session exploring open data contribution, image labeling, and machine learning model validation with Google.' },
  { id: '08', numberId: '08', title: 'Educational Session on GitHub', description: 'Git version control bootcamp: branching strategies, collaborative pull requests, merge conflict resolution, and GitHub Actions.' },
  { id: '09', numberId: '09', title: 'Industrial Visit', description: 'Departmental educational tour exploring cloud infrastructure and agile development methodologies in active tech organizations.' },
  { id: '10', numberId: '10', title: 'UDAAN Mock Interview', description: 'Simulated campus placement drive with DSA problem-solving rounds, resume reviews, and HR behavioral assessments.' },
  { id: '11', numberId: '11', title: 'Freshers Onboarding Programme', description: 'Welcoming junior engineers to the CSE department with coding challenges, mentor matching, and tech culture orientation.' },
  { id: '12', numberId: '12', title: 'Projects Funded by KSCST', description: 'Guidance and mentorship workshop for state council project funding, patent drafting, and student research grants.' },
  { id: '13', numberId: '13', title: 'Generative AI Tools for Research', description: 'Utilizing modern LLMs, prompt engineering, and literature retrieval tools for scientific paper writing and data analysis.' },
  { id: '14', numberId: '14', title: 'Introduction to Blockchain: Solidity Workshop', description: 'Smart contract development on EVM, covering ERC-20 token contracts, gas optimization, and testnet deployment.' },
  { id: '15', numberId: '15', title: 'Star UML', description: 'Software engineering architecture and UML modeling workshop: class diagrams, sequence diagrams, and use case mapping.' },
  { id: '16', numberId: '16', title: 'Generative AI: Custom Solutions using OpenAI', description: 'Building bespoke AI agents, function calling APIs, and RAG pipelines using OpenAI models and vector databases.' },
  { id: '17', numberId: '17', title: 'React.js and Node.js Workshop', description: 'Full-stack web engineering workshop building RESTful microservices, state management, and modern component architectures.' },
];

export const Activities: React.FC = () => {
  const { theme } = useTheme();
  const { displayText, ref } = useScrambleText("Activities");
  const [activities, setActivities] = useState<ActivityItem[]>(DEFAULT_ACTIVITIES_LIST);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [introDesc, setIntroDesc] = useState(
    "Hands-on workshops, industrial visits, and technical sessions run by the Cipher Association — spanning AI, blockchain, research tooling, and career prep."
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}/api/public/activities`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: ActivityItem[] = json.data.map((a: any, idx: number) => {
              let photos: string[] = [];
              if (a.photoUrl) {
                try {
                  const parsed = JSON.parse(a.photoUrl);
                  if (Array.isArray(parsed)) photos = parsed.filter(Boolean);
                  else if (typeof a.photoUrl === 'string' && a.photoUrl.trim()) photos = [a.photoUrl.trim()];
                } catch {
                  if (typeof a.photoUrl === 'string' && a.photoUrl.trim()) photos = [a.photoUrl.trim()];
                }
              }

              return {
                id: a.id || String(idx + 1),
                numberId: a.numberId || String(idx + 1).padStart(2, '0'),
                title: a.title,
                description: a.description || "",
                photoUrl: a.photoUrl || "",
                photos,
                date: a.date || "",
              };
            });
            setActivities(mapped);
          }
        }
      } catch {}

      try {
        const cRes = await fetch(`${API_BASE}/api/public/content`);
        if (cRes.ok) {
          const cJson = await cRes.json();
          if (cJson.map?.activities_desc) {
            setIntroDesc(cJson.map.activities_desc);
          }
        }
      } catch {}
    }

    fetchData();
  }, []);

  return (
    <section id="archive" className="relative py-8 sm:py-12 md:py-14 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        <div className="mb-12">
          <div className="font-mono text-sm tracking-widest text-emerald-600 dark:text-[#00ff66] mb-3 font-bold">
            // ARCHIVE
          </div>
          <h2
            ref={ref}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 font-sans dark:text-glow text-black dark:text-white"
            style={{ color: theme === "dark" ? "#ffffff" : "#000000" }}
          >
            {displayText}
          </h2>
          <p
            className="font-sans text-base leading-relaxed max-w-2xl text-gray-800 dark:text-[#c4ded0]"
            style={{ color: theme === "dark" ? "#c4ded0" : "#2d3748" }}
          >
            {introDesc}
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {activities.map((act) => (
            <div
              key={act.id}
              onClick={() => setSelectedActivity(act)}
              className="clickable-card group relative rounded-xl px-5 py-4 bg-white dark:bg-[#08170c]/70 backdrop-blur-md border border-gray-200 dark:border-[#00ff66]/15 hover:border-emerald-500 dark:hover:border-[#00ff66]/60 transition-all duration-200 shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-[0_0_18px_rgba(0,255,102,0.18)] hover:-translate-y-0.5 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3.5 pr-2">
                <span className="font-mono text-xs text-emerald-600 dark:text-[#00ff66] font-bold opacity-80 group-hover:opacity-100">
                  {act.numberId || act.id}
                </span>
                <span
                  className="font-sans text-sm sm:text-base font-semibold group-hover:text-emerald-600 dark:group-hover:text-[#00ff66] transition-colors leading-snug text-black dark:text-white/90"
                  style={{ color: theme === "dark" ? "rgba(255,255,255,0.9)" : "#000000" }}
                >
                  {act.title}
                </span>
              </div>

              <ArrowUpRight className="w-4 h-4 text-gray-400 dark:text-[#88aa90] group-hover:text-emerald-600 dark:group-hover:text-[#00ff66] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Activity Details & Photos Modal Popup */}
        <ActivityModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />

      </div>
    </section>
  );
};