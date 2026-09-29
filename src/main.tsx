import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { PublicLayout } from "./components/PublicLayout.tsx";
import { ScrollToTop } from "./components/ScrollToTop.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { TeamPage } from "./pages/TeamPage.tsx";
import { EventsPage } from "./pages/EventsPage.tsx";
import { BlogPage } from "./pages/BlogPage.tsx";
import { AboutPage } from "./pages/AboutPage.tsx";
import { ContactPage } from "./pages/ContactPage.tsx";
import { AdminApp } from "./admin/AdminApp.tsx";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Admin CMS Routes */}
          <Route path="/admin/*" element={<AdminApp />} />

          {/* Public Website Routes with Shared Cyber Floating Navbar */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);