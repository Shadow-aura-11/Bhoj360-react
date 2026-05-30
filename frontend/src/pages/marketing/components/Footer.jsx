import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="bg-[#050505] border-t border-white/5 py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <a href="#hero" onClick={(e) => { e.preventDefault(); handleScrollTo('hero'); }} className="flex items-center gap-3 group cursor-pointer w-fit">
              <div className="w-10 h-10 rounded-full border border-[var(--color-amber)] flex items-center justify-center relative overflow-hidden bg-black transition-transform duration-500 group-hover:rotate-180">
                <span className="text-[var(--color-amber)] font-serif text-lg font-semibold tracking-widest relative z-10">T</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-serif tracking-wide text-[#F5F0EB]">TableOS</span>
                <span className="text-[9px] font-mono tracking-[0.2em] text-[var(--color-amber)] uppercase">Network Engine</span>
              </div>
            </a>
            
            <p className="text-sm text-[rgba(245,240,235,0.55)] font-light max-w-sm leading-relaxed">
              The premium SaaS infrastructure solution for hospitality groups, multi-room dining lounges, and fine-dining operations globally.
            </p>

            <div className="text-xs text-[var(--color-amber)] font-mono uppercase tracking-widest">
              SYSTEM STATUS: OPERATIONAL
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="text-[11px] font-mono tracking-widest text-[#F5F0EB]/40 uppercase">Platform</h4>
            <ul className="space-y-2.5">
              {['Features', 'Showcase', 'Process', 'Pricing'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    onClick={(e) => { e.preventDefault(); handleScrollTo(item.toLowerCase()); }}
                    className="text-xs text-[rgba(245,240,235,0.65)] hover:text-[var(--color-amber)] transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/app/login" className="text-xs text-[rgba(245,240,235,0.65)] hover:text-[var(--color-amber)] transition-colors duration-300">
                  Live Console
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-xs text-[rgba(245,240,235,0.65)] hover:text-[var(--color-amber)] transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="text-[11px] font-mono tracking-widest text-[#F5F0EB]/40 uppercase">Company</h4>
            <ul className="space-y-2.5 text-xs text-[rgba(245,240,235,0.65)]">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--color-amber)] transition-colors">About Us</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--color-amber)] transition-colors">Careers</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--color-amber)] transition-colors">Press Room</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--color-amber)] transition-colors">Security Audit</a></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h4 className="text-[11px] font-mono tracking-widest text-[#F5F0EB]/40 uppercase">Legal & Compliance</h4>
            <ul className="space-y-2.5 text-xs text-[rgba(245,240,235,0.65)]">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--color-amber)] transition-colors">Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--color-amber)] transition-colors">Terms of Service</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--color-amber)] transition-colors">Service Level Agreement (SLA)</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--color-amber)] transition-colors">GDPR & PCI Compliance</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[rgba(245,240,235,0.4)]">
          <p className="text-center md:text-left">
            Built by TableOS Agency Core Team. © {new Date().getFullYear()} TableOS. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--color-amber)] transition-colors">Twitter</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--color-amber)] transition-colors">GitHub</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[var(--color-amber)] transition-colors">LinkedIn</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
