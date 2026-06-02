import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';

export default function CTA({ onWatchDemo }) {
  const { lang, t } = useLanguage();
  return (
    <section className="py-32 relative z-10 border-b border-white/5 overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute inset-0 bg-grid-pattern"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[rgba(212,146,10,0.06)] blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10">
        <div className="glass-card-dark rounded-2xl p-12 md:p-16 border-white/10 text-center space-y-8 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8)] border-glow-amber">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500/90 text-[10px] font-mono tracking-widest uppercase">
            {t('cta_tag')}
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-6xl font-serif text-[#F5F0EB] leading-tight max-w-3xl mx-auto">
            {t('cta_title')}
          </h2>

          {/* Subtitle */}
          <p className="text-[rgba(245,240,235,0.7)] text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed">
            {t('cta_desc')}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center items-center pt-4">
            <Link
              to="/app/login"
              className="shimmer-btn px-8 py-4 rounded bg-[var(--color-amber)] text-black font-semibold text-base transition-all hover:bg-[var(--color-amber-light)] active:scale-95 shadow-[0_4px_20px_rgba(212,146,10,0.25)] flex items-center gap-3"
            >
              {lang === 'en' ? 'Access System Console' : 'सिस्टम कंसोल एक्सेस करें'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <button
              onClick={onWatchDemo}
              className="px-8 py-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-[#F5F0EB] font-medium text-base transition-all active:scale-95 flex items-center gap-3"
            >
              <span>{lang === 'en' ? 'Watch Live Demo Flow' : 'लाइव डेमो फ्लो देखें'}</span>
              <div className="w-6 h-6 rounded-full bg-[var(--color-amber)]/20 flex items-center justify-center text-[var(--color-amber)]">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
