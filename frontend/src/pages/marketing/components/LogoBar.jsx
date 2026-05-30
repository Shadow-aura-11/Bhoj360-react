import React from 'react';

export default function LogoBar() {
  const clients = [
    "Maison d'Amour",
    "The Gilded Fork",
    "Aether Lounge",
    "Onyx Steakhouse",
    "Sage & Smoke",
    "Akira Omakase",
    "Bronze Tavern",
    "Nouveau Bistro"
  ];

  // Repeat twice for seamless scrolling
  const list = [...clients, ...clients];

  return (
    <section className="py-12 border-y border-white/5 bg-[#0a0a0a] relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-4 text-center">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[var(--color-text-muted)]">
          Engine powering elite culinary establishments globally
        </span>
      </div>

      <div className="marquee-container relative flex items-center">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>

        <div className="marquee-content py-2">
          {list.map((client, idx) => (
            <div key={idx} className="flex items-center gap-6 shrink-0">
              <span className="text-xl md:text-2xl font-serif text-[#F5F0EB]/50 hover:text-[var(--color-amber)] transition-colors duration-300 tracking-wider">
                {client}
              </span>
              
              {/* Luxury Diamond SVG separator */}
              <svg className="w-2.5 h-2.5 text-[var(--color-amber)] opacity-35" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 12l10 10 10-10L12 2z" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
