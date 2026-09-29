import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import { ToastProvider } from "./context/ToastContext.tsx";
import { AdminLayout } from "./components/AdminLayout.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { MembersPage } from "./pages/MembersPage.tsx";
import { EventsPage } from "./pages/EventsPage.tsx";
import { ActivitiesPage } from "./pages/ActivitiesPage.tsx";
import { DomainsPage } from "./pages/DomainsPage.tsx";
import { ContentPage } from "./pages/ContentPage.tsx";
import { ApplicationsPage } from "./pages/ApplicationsPage.tsx";
import { MessagesPage } from "./pages/MessagesPage.tsx";
import { MediaPage } from "./pages/MediaPage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import { Loader2 } from "lucide-react";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020703] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#00ff66] animate-spin" />
        <p className="font-mono text-xs text-[#88aa90]">Verifying credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AdminApp: React.FC = () => {
  React.useEffect(() => {
    document.body.classList.add("admin-mode");
    return () => {
      document.body.classList.remove("admin-mode");
    };
  }, []);

  return (
    <div className="admin-app min-h-screen bg-[#020703] text-[#e2fbe8]">
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="login" element={<LoginPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="domains" element={<DomainsPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="content" element={<ContentPage />} />
              <Route path="media" element={<MediaPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </div>
  );
};