import React from 'react';

export default function Features() {
  const featureList = [
    {
      title: "Multi-Outlet Node Architecture",
      desc: "Each restaurant executes as an isolated microservice with its own storage, ensuring zero single-point failure risks across your network.",
      tag: "INFRASTRUCTURE",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Real-time Seating Simulator",
      desc: "An active digital twin of your floor plans. Dynamic socket updates let operators monitor guests, order stages, and bill requests live.",
      tag: "SEATING SYSTEMS",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      title: "Staff Dispatch Console",
      desc: "Connect customers to waiters. Staff receive immediate task updates when kitchen alerts trigger or table rings are pressed.",
      tag: "WORKFLOW",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: "Instant Self-Order QR Codes",
      desc: "Dynamic SVG codes bind tables to digital menus. Customers order and pay with zero application downloads or registrations required.",
      tag: "CUSTOMER FACING",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      )
    },
    {
      title: "Kitchen Flow Coordinators",
      desc: "Replace paper tickets with active order pipelines. Auto-group by tables, highlight preparation alerts, and notify servers when food is hot.",
      tag: "BACK OF HOUSE",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      title: "Consolidated Group Analytics",
      desc: "Aggregate receipts, observe table dwell indexes, track food preparation durations, and print financial audits in seconds.",
      tag: "INTELLIGENCE",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <section id="features" className="py-32 relative z-10 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Heading */}
        <div className="max-w-3xl text-left mb-20 space-y-4">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase">
            Architectural Blueprint
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#F5F0EB]">
            Engineered for culinary high-performance groups.
          </h2>
          <p className="text-[rgba(245,240,235,0.6)] font-light text-lg">
            Say goodbye to scattered tablet systems and separate booking softwares. TableOS coordinates the entire service cycle in a single, robust platform.
          </p>
        </div>

        {/* 3x2 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((feat, idx) => (
            <div 
              key={idx} 
              className="glass-card-dark rounded-xl p-8 border-white/5 flex flex-col justify-between min-h-[280px] group transition-all duration-300 hover:border-[rgba(212,146,10,0.3)] reveal"
            >
              <div>
                {/* SVG Icon with elegant container */}
                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-amber)] group-hover:text-[#F5F0EB] group-hover:bg-[var(--color-amber)] group-hover:border-[var(--color-amber)] transition-all duration-500 mb-6">
                  {feat.icon}
                </div>

                {/* Tag */}
                <span className="text-[10px] font-mono tracking-wider text-[var(--color-amber)] block mb-2">{feat.tag}</span>

                {/* Title */}
                <h3 className="text-xl font-serif font-semibold text-[#F5F0EB] mb-3 group-hover:text-[var(--color-amber)] transition-colors duration-300">
                  {feat.title}
                </h3>
              </div>

              {/* Desc */}
              <p className="text-[rgba(245,240,235,0.65)] text-sm font-light leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
