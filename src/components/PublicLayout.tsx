import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar.tsx";
import { Footer } from "./Footer.tsx";
import { CRTOverlay } from "./CRTOverlay.tsx";
import { TopographicBackground } from "./TopographicBackground.tsx";
import { JoinModal } from "./JoinModal.tsx";
import { RootAccessModal } from "./RootAccessModal.tsx";
import { IntroBoot } from "./IntroBoot.tsx";

export const PublicLayout: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isRootAccessOpen, setIsRootAccessOpen] = useState(false);

  return (
    <div className="public-site-cursor overflow-x-clip min-h-screen bg-white dark:bg-[#030804] text-gray-900 dark:text-white font-sans selection:bg-[#00ff66] selection:text-black relative transition-colors duration-200">
      {/* CRT Scanline & Vignette Effect */}
      <CRTOverlay />

      {/* Intro Terminal Boot Sequence on open / refresh */}
      {isBooting && <IntroBoot onComplete={() => setIsBooting(false)} />}

      {/* Dynamic Topographic Wave Canvas */}
      <TopographicBackground />

      {/* Main Website Structure */}
      <div className={`transition-opacity duration-700 ${isBooting ? "opacity-0" : "opacity-100"}`}>
        {/* Floating Cyber Navbar */}
        <Navbar />

        {/* Main Page Content */}
        <div className="relative z-10 pt-24 min-h-[calc(100vh-200px)]">
          <Outlet context={{ onOpenJoinModal: () => setIsJoinModalOpen(true) }} />
        </div>

        {/* Global Footer */}
        <Footer
          onOpenRootAccess={() => setIsRootAccessOpen(true)}
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
      <RootAccessModal
        isOpen={isRootAccessOpen}
        onClose={() => setIsRootAccessOpen(false)}
      />
    </div>
  );
};
