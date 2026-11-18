import React, { useState } from 'react';
import { Bookmark, Compass, Download, Film } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { AppSection, CinemaExperience } from './components/CinemaExperience';

export default function App() {
  const [section, setSection] = useState<AppSection>('discover');
  const [ambientBackdrop, setAmbientBackdrop] = useState<string>(
    '/src/assets/images/movie_aether_protocol_1794855219854.jpg'
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#0B081A] text-[#F8FAFC] flex flex-col relative overflow-x-hidden">
        {/* Luminous Spatial Ambient Backdrop refracted by Crystal Glass Panels */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <img
            src={ambientBackdrop}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-40 blur-[96px] scale-115 transition-all duration-700"
          />
          <div className="cx-aurora-1 absolute -top-32 -left-24 w-[540px] h-[540px] rounded-full bg-[#7C3AED]/38 blur-[130px]" />
          <div className="cx-aurora-2 absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[#0EA5E9]/28 blur-[130px]" />
          <div className="cx-aurora-1 absolute bottom-0 left-1/3 w-[580px] h-[440px] rounded-full bg-[#DB2777]/30 blur-[140px]" />
          <div className="absolute inset-0 bg-[#080514]/45" />
        </div>

      {/* Main Spatial Glass Stage */}
      <main className="relative z-10 flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-24 lg:pb-8 flex items-center">
        <CinemaExperience
          section={section}
          onNavigate={setSection}
          onBackdropChange={setAmbientBackdrop}
        />
      </main>

      {/* Mobile Fixed Bottom Dock (<=15% sticky height cap) */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 cx-crystal-3 border-t border-white/20 grid grid-cols-4 h-16 px-2"
      >
        {(
          [
            { id: 'discover', label: 'Discover', icon: Compass },
            { id: 'catalog', label: 'Movies', icon: Film },
            { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
            { id: 'downloads', label: 'Downloads', icon: Download },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                active ? 'text-[#FB7185]' : 'text-slate-300/85 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
    </MotionConfig>
  );
}
