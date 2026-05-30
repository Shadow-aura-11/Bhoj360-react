import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      // Offset for sticky nav
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4 glass-header shadow-lg' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand Logo */}
        <a href="#hero" onClick={(e) => { e.preventDefault(); handleScrollTo('hero'); }} className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 rounded-full border border-[var(--color-amber)] flex items-center justify-center relative overflow-hidden bg-black transition-transform duration-500 group-hover:rotate-180">
            <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(212,146,10,0.2)] to-transparent"></div>
            {/* Elegant Lettermark T */}
            <span className="text-[var(--color-amber)] font-serif text-lg font-semibold tracking-widest relative z-10">T</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold font-serif tracking-wide text-[#F5F0EB]">TableOS</span>
            <span className="text-[9px] font-mono tracking-[0.2em] text-[var(--color-amber)] uppercase">Network Engine</span>
          </div>
        </a>

        {/* Desktop Navigation links */}
        <nav className="hidden lg:flex items-center gap-10">
          {['Features', 'Showcase', 'Process', 'Pricing', 'FAQ'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={(e) => { e.preventDefault(); handleScrollTo(item.toLowerCase()); }}
              className="text-sm font-medium text-[rgba(245,240,235,0.7)] hover:text-[var(--color-amber)] transition-colors relative group py-2"
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[var(--color-amber)] transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            to="/contact"
            className="text-sm font-medium text-[rgba(245,240,235,0.7)] hover:text-[var(--color-amber)] transition-colors relative group py-2"
          >
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[var(--color-amber)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link
            to="/app/login"
            className="shimmer-btn px-6 py-2.5 rounded bg-[var(--color-amber)] text-black font-semibold text-sm transition-all hover:bg-[var(--color-amber-light)] active:scale-95 flex items-center gap-2"
          >
            Launch Console
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none relative z-50 text-[#F5F0EB]"
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-[1.5px] bg-[#F5F0EB] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7.5px]' : ''}`}></span>
          <span className={`w-6 h-[1.5px] bg-[#F5F0EB] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`w-6 h-[1.5px] bg-[#F5F0EB] transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7.5px]' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      <div className={`fixed inset-0 bg-[#080808]/98 backdrop-blur-2xl z-40 flex flex-col justify-center items-center transition-all duration-500 lg:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center gap-8 text-center">
          {['Features', 'Showcase', 'Process', 'Pricing', 'FAQ'].map((item, idx) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={(e) => { e.preventDefault(); handleScrollTo(item.toLowerCase()); }}
              className="text-2xl font-serif text-[#F5F0EB] hover:text-[var(--color-amber)] transition-colors"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {item}
            </a>
          ))}
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-serif text-[rgba(245,240,235,0.7)] hover:text-[var(--color-amber)] transition-colors"
          >
            Contact
          </Link>
          <Link
            to="/app/login"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-6 px-10 py-3 rounded bg-[var(--color-amber)] text-black font-semibold text-lg hover:bg-[var(--color-amber-light)] active:scale-95 transition-all shadow-md"
          >
            Launch Console
          </Link>
        </div>
      </div>
    </header>
  );
}
