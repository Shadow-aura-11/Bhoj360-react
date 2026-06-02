import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';

export default function Footer() {
  const { lang, t } = useLanguage();

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
    <footer className="bg-[#050505] border-t border-white/5 py-20 relative z-10 text-[#F5F0EB]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <Link to="/" className="flex items-center gap-3 group cursor-pointer w-fit">
              <div className="w-10 h-10 rounded-full border border-[var(--color-amber)] flex items-center justify-center relative overflow-hidden bg-black transition-transform duration-500 group-hover:rotate-180">
                <span className="text-[var(--color-amber)] font-serif text-lg font-semibold tracking-widest relative z-10">B</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-serif tracking-wide text-[#F5F0EB]">Bhoj360</span>
                <span className="text-[9px] font-mono tracking-[0.2em] text-[var(--color-amber)] uppercase">Operations Engine</span>
              </div>
            </Link>
            
            <p className="text-sm text-[rgba(245,240,235,0.55)] font-light max-w-sm leading-relaxed">
              {t('footer_desc')}
            </p>

            <div className="text-xs text-[var(--color-amber)] font-mono uppercase tracking-widest">
              SYSTEM STATUS: OPERATIONAL
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="text-[11px] font-mono tracking-widest text-[#F5F0EB]/45 uppercase">{t('footer_quick_links')}</h4>
            <ul className="space-y-2.5">
              {['Features', 'Showcase', 'Process', 'Pricing'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    onClick={(e) => { e.preventDefault(); handleScrollTo(item.toLowerCase()); }}
                    className="text-xs text-[rgba(245,240,235,0.65)] hover:text-[var(--color-amber)] transition-colors duration-300"
                  >
                    {t(item.toLowerCase())}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/app/login" className="text-xs text-[rgba(245,240,235,0.65)] hover:text-[var(--color-amber)] transition-colors duration-300">
                  {t('launch_console')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="text-[11px] font-mono tracking-widest text-[#F5F0EB]/45 uppercase">{lang === 'en' ? 'Company' : 'कंपनी'}</h4>
            <ul className="space-y-2.5 text-xs text-[rgba(245,240,235,0.65)]">
              <li><Link to="/about" className="hover:text-[var(--color-amber)] transition-colors">{lang === 'en' ? 'About Us' : 'हमारे बारे में'}</Link></li>
              <li><Link to="/career" className="hover:text-[var(--color-amber)] transition-colors">{lang === 'en' ? 'Careers' : 'करियर'}</Link></li>
              <li><Link to="/blog" className="hover:text-[var(--color-amber)] transition-colors">{lang === 'en' ? 'Blog' : 'ब्लॉग'}</Link></li>
              <li><Link to="/contact" className="hover:text-[var(--color-amber)] transition-colors">{lang === 'en' ? 'Contact Us' : 'संपर्क करें'}</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="text-[11px] font-mono tracking-widest text-[#F5F0EB]/45 uppercase">{t('footer_legal')}</h4>
            <ul className="space-y-2.5 text-xs text-[rgba(245,240,235,0.65)]">
              <li><Link to="/privacy" className="hover:text-[var(--color-amber)] transition-colors">{lang === 'en' ? 'Privacy Policy' : 'गोपनीयता नीति'}</Link></li>
              <li><Link to="/terms" className="hover:text-[var(--color-amber)] transition-colors">{lang === 'en' ? 'Terms & Conditions' : 'नियम और शर्तें'}</Link></li>
              <li><Link to="/cancellation-refund" className="hover:text-[var(--color-amber)] transition-colors">{lang === 'en' ? 'Cancellation & Refund' : 'रद्दीकरण और धनवापसी'}</Link></li>
            </ul>
          </div>

          {/* Column 5: Contact Details */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="text-[11px] font-mono tracking-widest text-[#F5F0EB]/45 uppercase">{t('footer_contact')}</h4>
            <p className="text-xs text-[rgba(245,240,235,0.55)] leading-relaxed">
              {t('footer_address')}
            </p>
            <div className="text-xs space-y-1 font-mono text-[rgba(245,240,235,0.65)]">
              <div>Phone: {t('footer_phone')}</div>
              <div className="break-all">Email: {t('footer_email')}</div>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[rgba(245,240,235,0.4)]">
          <p className="text-center md:text-left">
            {t('footer_copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6">
            <a href="https://twitter.com/bhoj360" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-amber)] transition-colors">Twitter</a>
            <a href="https://github.com/bhoj360" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-amber)] transition-colors">GitHub</a>
            <a href="https://linkedin.com/company/bhoj360" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-amber)] transition-colors">LinkedIn</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
