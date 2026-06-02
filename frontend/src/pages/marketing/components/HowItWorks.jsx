import React from 'react';
import { useLanguage } from '../../../hooks/useLanguage';

export default function HowItWorks() {
  const { isHindi, t } = useLanguage();

  const steps = isHindi ? [
    {
      step: "01",
      title: "अतिथि क्यूआर स्कैन और ऑर्डर करते हैं",
      desc: "मेहमान अपने फोन से सीधे डिजिटल मेनू ब्राउज़ करने और ऑर्डर देने के लिए टेबल क्यूआर कोड स्कैन करते हैं।",
      badge: "ऑर्डरिंग"
    },
    {
      step: "02",
      title: "वेटर ऑर्डर की पुष्टि करते हैं",
      desc: "वेटर अपने डैशबोर्ड पर तुरंत अलर्ट प्राप्त करते हैं, वस्तुओं की पुष्टि करते हैं, और रसोई में टिकट (KOT) प्रिंट करते हैं।",
      badge: "रूटिंग"
    },
    {
      step: "03",
      title: "रसोई भोजन तैयार करती है",
      desc: "रसोई कर्मचारी अपनी केडीएस स्क्रीन पर लाइव सक्रिय टिकट देखते हैं, ताजा व्यंजन तैयार करते हैं और उन्हें तैयार चिह्नित करते हैं।",
      badge: "तैयारी"
    },
    {
      step: "04",
      title: "त्वरित बिलिंग और समीक्षा",
      desc: "कैशियर स्प्लिट्स को संसाधित करते हैं, ग्राहक भुगतान करने के लिए यूपीआई क्यूआर कोड स्कैन करते हैं, और गूगल समीक्षा स्वचालित रूप से चालू हो जाती है।",
      badge: "निपटान"
    }
  ] : [
    {
      step: "01",
      title: "Guest Scans QR & Orders",
      desc: "Guests scan the table QR code to browse the digital menu and place orders directly from their phones.",
      badge: "ORDERING"
    },
    {
      step: "02",
      title: "Waiter Confirms Order",
      desc: "Waiters receive instant alerts on their dashboard, confirm items, and print kitchen order tickets (KOT).",
      badge: "ROUTING"
    },
    {
      step: "03",
      title: "Kitchen Prepares Food",
      desc: "The kitchen staff views live active tickets on their KDS screen, preparing dishes fresh and marking them ready.",
      badge: "PREPARATION"
    },
    {
      step: "04",
      title: "Instant Billing & Review",
      desc: "Cashiers process splits, customers scan UPI QR codes to pay, and leaving Google reviews is triggered automatically.",
      badge: "SETTLEMENT"
    }
  ];

  return (
    <section id="process" className="py-32 relative z-10 border-b border-white/5 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Heading */}
        <div className="max-w-3xl text-left mb-24 space-y-4">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase">
            {t('execution_lifecycle')}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#F5F0EB]">
            {t('workflow_subtitle')}
          </h2>
          <p className="text-[rgba(245,240,235,0.65)] font-light text-lg">
            {t('workflow_desc')}
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
