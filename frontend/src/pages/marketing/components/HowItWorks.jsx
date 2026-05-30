import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Initialize Outlet Instance",
      desc: "Deploy an isolated microservice container in the gateway with one click. Configure custom restaurant sub-brands, currency systems, and seating capacities.",
      badge: "PROVISIONING"
    },
    {
      step: "02",
      title: "Map Seating Blueprints",
      desc: "Design your interactive dining room floorplan. Plot tables, define server dispatch zones, and automatically print static or dynamic QR checkout codes.",
      badge: "CONFIGURATION"
    },
    {
      step: "03",
      title: "Synchronize Team Terminals",
      desc: "Upload your menus and register staff codes. TableOS immediately provisions tailored logins for waiters, chefs, cashiers, and managers.",
      badge: "ONBOARDING"
    },
    {
      step: "04",
      title: "Activate Orchestration",
      desc: "Open your doors. Watch live orders route, table calls alert staff, kitchen tickets auto-update, and group revenue logs audit in real time.",
      badge: "LIVE OPERATIONS"
    }
  ];

  return (
    <section id="process" className="py-32 relative z-10 border-b border-white/5 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Heading */}
        <div className="max-w-3xl text-left mb-24 space-y-4">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase">
            Execution Lifecycle
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#F5F0EB]">
            From zero to live service orchestration in hours.
          </h2>
          <p className="text-[rgba(245,240,235,0.65)] font-light text-lg">
            A comprehensive, automated setup flow built for sophisticated hospitality groups.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          
          {/* Decorative connecting line behind steps (desktop only) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[1px] border-t border-dashed border-white/10 z-0"></div>

          {steps.map((item, idx) => (
            <div key={idx} className="relative z-10 space-y-6 text-left group reveal">
              
              {/* Step indicator circle */}
              <div className="step-dot w-16 h-16 rounded-full border border-white/10 bg-[#111111] flex items-center justify-center text-[var(--color-amber)] font-serif text-2xl font-bold transition-all duration-500 group-hover:border-[var(--color-amber)] group-hover:bg-[var(--color-amber)] group-hover:text-black shadow-lg">
                {item.step}
              </div>

              {/* Step Metadata */}
              <div className="space-y-3">
                <span className="text-[9px] font-mono tracking-wider text-[var(--color-amber)] uppercase">
                  {item.badge}
                </span>
                
                <h3 className="text-xl font-serif font-semibold text-[#F5F0EB] group-hover:text-[var(--color-amber)] transition-colors duration-300">
                  {item.title}
                </h3>
                
                <p className="text-[rgba(245,240,235,0.6)] text-sm font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
