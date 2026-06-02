import React, { useState } from 'react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "Can we easily import existing food menus and table floorplans?",
      a: "Yes. Bhoj360 includes automated CSV/JSON schema import tools to populate categorised food menus instantly. Our visual floorplan layout designer lets managers map table shapes, dimensions, and waiter zones graphically in minutes."
    },
    {
      q: "How does the multi-outlet server isolation protect my business?",
      a: "Unlike traditional monolithic SaaS architectures where a global database failure compromises all clients, Bhoj360 implements isolated node architecture. Each restaurant outlet is provisioned with its own separate database container and microservice execution loop. A server error in one restaurant cannot impact the uptime of others."
    },
    {
      q: "Does Bhoj360 require dedicated hardware installations?",
      a: "No. The entire system is built on responsive web standards. Your front-of-house staff can use standard iOS or Android tablets, kitchen chefs can view tickets on wall-mounted web browsers, cashiers can use desktop screens, and patrons order directly from their personal mobile browsers."
    },
    {
      q: "Can the agency operator customize dashboard logos and colors?",
      a: "Yes. The agency administrative console allows full brand customization. Operators can modify the primary dashboard colors, upload brand logomarks, set custom redirects on staff logout, and manage distinct customer subscription tiers."
    },
    {
      q: "How does the waiter dispatch call system operate?",
      a: "When a customer scans a table QR code and presses 'Call Waiter', or when the kitchen flags a dish as prepared in the KDS, the gateway routes the event immediately. Waitstaff terminals illuminate with desktop notifications and auditory alerts, highlighting the table number and precise service requested."
    }
  ];

  return (
    <section id="faq" className="py-32 relative z-10 border-b border-white/5 bg-[#080808]">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-20">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase">
            Inquiries & Context
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#F5F0EB]">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordions List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-card-dark rounded-xl border border-white/5 overflow-hidden transition-all duration-300"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center gap-6 focus:outline-none"
                >
                  <span className="font-serif text-lg md:text-xl text-[#F5F0EB] hover:text-[var(--color-amber)] transition-colors duration-300">
                    {faq.q}
                  </span>
                  
                  {/* Plus/minus SVG indicator */}
                  <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#F5F0EB] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45 border-[var(--color-amber)] text-[var(--color-amber)]' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>

                {/* Accordion Answer Content */}
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[300px] border-t border-white/5' : 'max-h-0'}`}
                >
                  <p className="p-6 text-sm text-[rgba(245,240,235,0.65)] font-light leading-relaxed text-left">
                    {faq.a}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
