import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, Shield } from "lucide-react";
import { Sidebar } from "./Sidebar.tsx";

export const AdminLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.replace(/^\/admin\/?/, "");
    if (!path) return "Dashboard Overview";
    const titles: Record<string, string> = {
      members: "Team Members Management",
      events: "Events & Workshops",
      activities: "Activities Archive",
      domains: "Domains & Pillars",
      applications: "Join Requests",
      messages: "Contact Messages",
      content: "Website Content Editor",
      media: "Media Asset Library",
      settings: "Admin Settings",
    };
    return titles[path] || "Admin Console";
  };

  return (
    <div className="min-h-screen bg-[#020703] text-white flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0 flex-shrink-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 shadow-2xl">
            <Sidebar onClose={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-[#030905]/90 backdrop-blur-md border-b border-[#00ff66]/15 px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-[#88aa90] hover:text-[#00ff66] hover:bg-[#06140a] border border-[#00ff66]/20"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-mono text-sm md:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span className="text-[#00ff66]">//</span> {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-[#00ff66] bg-[#00ff66]/10 px-2.5 py-1 rounded-full border border-[#00ff66]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-pulse"></span>
              Live Synced
            </span>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};