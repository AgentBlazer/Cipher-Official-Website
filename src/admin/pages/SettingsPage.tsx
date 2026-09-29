import React, { useState } from "react";
import { API_BASE } from "../../lib/api.ts";
import { KeyRound, Shield, Server, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import { useToast } from "../context/ToastContext.tsx";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      error("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      error("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        success("Administrator password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        error(data.message || "Failed to update password.");
      }
    } catch {
      error("Network error while updating password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold font-mono text-white">Administrator Settings</h2>
        <p className="font-mono text-xs text-[#88aa90]">
          Configure security credentials, session management, and view deployment status
        </p>
      </div>

      {/* Account Info */}
      <div className="p-6 rounded-xl bg-[#030905] border border-[#00ff66]/20">
        <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00ff66]" /> Account Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-3 bg-[#040e06] rounded-lg border border-[#00ff66]/15">
            <span className="text-[#88aa90] block text-[10px]">CURRENT ADMINISTRATOR</span>
            <span className="text-white font-bold text-sm mt-0.5 block">{user?.name || "Administrator"}</span>
          </div>
          <div className="p-3 bg-[#040e06] rounded-lg border border-[#00ff66]/15">
            <span className="text-[#88aa90] block text-[10px]">AUTHENTICATED EMAIL</span>
            <span className="text-[#00ff66] font-bold text-sm mt-0.5 block">{user?.email || "admin@cipher"}</span>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="p-6 rounded-xl bg-[#030905] border border-[#00ff66]/20">
        <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#00ff66]" /> Update Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
              New Password (minimum 8 characters) *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-[#00ff66] uppercase mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#020603] border border-[#00ff66]/30 focus:border-[#00ff66] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#00ff66] hover:bg-[#00e65b] text-[#030804] font-mono font-bold text-xs tracking-wider px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>

      {/* Deployment & Environment Information */}
      <div className="p-6 rounded-xl bg-[#030905] border border-[#00ff66]/20 font-mono text-xs space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-[#00ff66]" /> System &amp; Stack Metadata
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-[#040e06] rounded border border-[#00ff66]/15">
            <span className="text-[#88aa90] text-[10px]">FRONTEND FRAMEWORK</span>
            <p className="text-white font-bold mt-1">React 19 + Vite</p>
          </div>
          <div className="p-3 bg-[#040e06] rounded border border-[#00ff66]/15">
            <span className="text-[#88aa90] text-[10px]">BACKEND RUNTIME</span>
            <p className="text-white font-bold mt-1">Node.js + Express REST</p>
          </div>
          <div className="p-3 bg-[#040e06] rounded border border-[#00ff66]/15">
            <span className="text-[#88aa90] text-[10px]">ORM / DB</span>
            <p className="text-white font-bold mt-1">Prisma + PostgreSQL</p>
          </div>
        </div>
      </div>
    </div>
  );
};