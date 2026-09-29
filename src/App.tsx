import React, { useState } from 'react';
import { TopographicBackground } from './components/TopographicBackground.tsx';
import { CRTOverlay } from './components/CRTOverlay.tsx';
import { IntroBoot } from './components/IntroBoot.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { About } from './components/About.tsx';
import { Domains } from './components/Domains.tsx';
import { Leadership } from './components/Leadership.tsx';
import { Events } from './components/Events.tsx';
import { Activities } from './components/Activities.tsx';
import { JoinSection } from './components/JoinSection.tsx';
import { JoinModal } from './components/JoinModal.tsx';
import { RootAccessModal } from './components/RootAccessModal.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isRootAccessOpen, setIsRootAccessOpen] = useState(false);

  return (
    <div className="public-site-cursor min-h-screen bg-[#030804] text-white selection:bg-[#00ff66] selection:text-black relative">
      {/* CRT Scanline & Vignette Effect */}
      <CRTOverlay />

      {/* Intro Terminal Boot Sequence */}
      {isBooting && (
        <IntroBoot onComplete={() => setIsBooting(false)} />
      )}

      {/* Dynamic Topographic Wave Canvas */}
      <TopographicBackground />

      {/* Main Website Structure */}
      <div className={`relative z-10 transition-opacity duration-700 ${isBooting ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar onOpenJoinModal={() => setIsJoinModalOpen(true)} />

        <main>
          <Hero
            onOpenJoinModal={() => setIsJoinModalOpen(true)}
            onOpenRootAccess={() => setIsRootAccessOpen(true)}
          />

          <About />

          <Domains />

          <Leadership />

          <Events />

          <Activities />

          <JoinSection onOpenJoinModal={() => setIsJoinModalOpen(true)} />
        </main>

        <Footer />
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
}
