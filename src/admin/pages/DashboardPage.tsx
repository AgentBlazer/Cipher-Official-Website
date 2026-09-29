import { API_BASE } from "../../lib/api.ts";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  Layers,
  Globe2,
  ArrowUpRight,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    activities: 0,
    domains: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [mRes, eRes, aRes, dRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/members`, { credentials: "include" }),
          fetch(`${API_BASE}/api/admin/events`, { credentials: "include" }),
          fetch(`${API_BASE}/api/admin/activities`, { credentials: "include" }),
          fetch(`${API_BASE}/api/admin/domains`, { credentials: "include" }),
        ]);

        const [m, e, a, d] = await Promise.all([
          mRes.ok ? mRes.json() : { data: [] },
          eRes.ok ? eRes.json() : { data: [] },
          aRes.ok ? aRes.json() : { data: [] },
          dRes.ok ? dRes.json() : { data: [] },
        ]);

        setStats({
          members: m.data?.length || 0,
          events: e.data?.length || 0,
          activities: a.data?.length || 0,
          domains: d.data?.length || 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard counts:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const statCards = [
    {
      title: "Team Members",
      count: stats.members,
      link: "/admin/members",
      icon: Users,
      desc: "Governance & Leaders",
    },
    {
      title: "Events & Workshops",
      count: stats.events,
      link: "/admin/events",
      icon: Calendar,
      desc: "Conducted Galas & Contests",
    },
    {
      title: "Activities Archive",
      count: stats.activities,
      link: "/admin/activities",
      icon: Layers,
      desc: "Workshops & Visits",
    },
    {
      title: "Domains",
      count: stats.domains,
      link: "/admin/domains",
      icon: Globe2,
      desc: "Core Pillar Tracks",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-r from-[#041407] to-[#061e0b] border border-[#00ff66]/30 shadow-[0_0_30px_rgba(0,255,102,0.1)]">
        <div className="relative z-10 max-w-2xl">
          <span className="font-mono text-xs text-[#00ff66] tracking-widest uppercase mb-2 inline-block">
            System Operational
          </span>
          <h2 className="text-2xl md:text-3xl font-bold font-mono text-white mb-3">
            Cipher Club Content Management
          </h2>
          <p className="font-mono text-xs md:text-sm text-[#a0c0a8] leading-relaxed">
            Manage public website sections, leadership members, event galleries, domains, and text copy in real-time. Changes publish instantly.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="p-5 rounded-xl bg-[#040e06] border border-[#00ff66]/20 hover:border-[#00ff66] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,102,0.2)] hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/20 flex items-center justify-center text-[#00ff66] group-hover:bg-[#00ff66] group-hover:text-black transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#88aa90] group-hover:text-[#00ff66] transition-colors" />
              </div>
              <div>
                <span className="text-3xl font-mono font-extrabold text-white group-hover:text-[#00ff66] transition-colors">
                  {loading ? "..." : card.count}
                </span>
                <h4 className="font-mono text-xs font-bold text-white mt-1">{card.title}</h4>
                <p className="text-[11px] text-[#88aa90] mt-0.5">{card.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};