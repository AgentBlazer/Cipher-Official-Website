import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Layers,
  Globe2,
  UserCheck,
  Inbox,
  FileText,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/members", label: "Team Members", icon: Users },
    { to: "/admin/events", label: "Events & Workshops", icon: Calendar },
    { to: "/admin/activities", label: "Activities", icon: Layers },
    { to: "/admin/domains", label: "Domains", icon: Globe2 },
    { to: "/admin/applications", label: "Join Requests", icon: UserCheck },
    { to: "/admin/messages", label: "Messages", icon: Inbox },
    { to: "/admin/content", label: "Website Content", icon: FileText },
    { to: "/admin/media", label: "Media Library", icon: ImageIcon },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-[#030905] border-r border-[#00ff66]/20 flex flex-col justify-between select-none">
      {/* Top Header */}
      <div>
        <div className="p-5 border-b border-[#00ff66]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <div>
              <h2 className="font-mono text-base font-extrabold tracking-wider text-[#00ff66] text-glow">
                CIPHER CMS
              </h2>
              <span className="text-[10px] font-mono text-[#88aa90] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#00ff66]" /> Admin Console
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-[#88aa90] hover:text-[#00ff66] hover:bg-[#00ff66]/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-mono text-xs tracking-wider transition-all duration-200 group relative ${
                    isActive
                      ? "bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/40 shadow-[0_0_15px_rgba(0,255,102,0.15)] font-semibold"
                      : "text-[#88aa90] hover:text-white hover:bg-[#06140a] hover:border hover:border-[#00ff66]/20"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0 ${
                        isActive ? "text-[#00ff66]" : "text-[#88aa90] group-hover:text-[#00ff66]"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff66] shadow-[0_0_8px_#00ff66]"></span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-3 border-t border-[#00ff66]/15 bg-[#020603] space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-mono text-[#88aa90] hover:text-[#00ff66] hover:bg-[#06140a] transition-colors border border-transparent hover:border-[#00ff66]/20"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" /> View Live Website
          </span>
          <span className="text-[10px] text-[#00ff66]">/</span>
        </a>

        {/* User Card */}
        <div className="p-2.5 rounded-lg bg-[#06140a] border border-[#00ff66]/20 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-mono font-bold text-white truncate">
              {user?.name || "Administrator"}
            </p>
            <p className="text-[10px] font-mono text-[#88aa90] truncate">
              {user?.email || "admin@cipher"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};