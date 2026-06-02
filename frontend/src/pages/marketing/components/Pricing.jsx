import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const { isHindi, formatPrice, t } = useLanguage();

  const plans = [
    {
      name: isHindi ? "कांस्य योजना" : "Bronze Plan",
      monthlyPrice: 99,
      yearlyPrice: 79,
      desc: isHindi ? "बुनियादी बैठने की व्यवस्था के प्रबंधन की आवश्यकता वाले स्टैंडअलोन पाक बिस्ट्रो के लिए।" : "For standalone culinary bistros requiring robust basic seating management.",
      features: isHindi ? [
        "1 पृथक आउटलेट नोड कंटेनर",
        "15 टेबल तक कॉन्फ़िगरेशन",
        "स्थिर क्यूआर कोड सिटिंग",
        "मानक रसोई प्रेषण दृश्य",
        "साप्ताहिक समेकित रिपोर्ट",
        "99.9% अपटाइम गारंटी"
      ] : [
        "1 Isolated Outlet Node Container",
        "Up to 15 Tables Configuration",
        "Static QR Code Seating",
        "Standard Kitchen Dispatch View",
        "Weekly Consolidated Reports",
        "99.9% Uptime Guarantee"
      ],
      cta: isHindi ? "कांस्य परीक्षण शुरू करें" : "Launch Bronze Trial",
      popular: false
    },
    {
      name: isHindi ? "रजत योजना" : "Silver Plan",
      monthlyPrice: 199,
      yearlyPrice: 159,
      desc: isHindi ? "उच्च मात्रा वाले, बहु-कक्षीय डाइनिंग लाउंज के लिए जिन्हें लाइव टीम प्रेषण की आवश्यकता होती है।" : "For high-volume, multi-room dining lounges requiring live team dispatch.",
      features: isHindi ? [
        "5 कनेक्टेड आउटलेट्स नोड्स तक",
        "असीमित टेबल कॉन्फ़िगरेशन",
        "डायनेमिक क्यूआर ऑर्डर रूटिंग",
        "सक्रिय वेटर कॉल प्रेषण कंसोल",
        "रीयल-टाइम रसोई केडीएस पाइप्स",
        "उन्नत विश्लेषण डैशबोर्ड",
        "प्राथमिकता 24/7 सर्वर सहायता"
      ] : [
        "Up to 5 Connected Outlets Nodes",
        "Unlimited Tables Configuration",
        "Dynamic QR Order routing",
        "Active Waiter Call Dispatch Console",
        "Real-time Kitchen KDS Pipes",
        "Advanced Analytics Dashboard",
        "Priority 24/7 Server Support"
      ],
      cta: isHindi ? "रजत परीक्षण शुरू करें" : "Launch Silver Trial",
      popular: true
    },
    {
      name: isHindi ? "स्वर्ण योजना" : "Gold Plan",
      monthlyPrice: 399,
      yearlyPrice: 319,
      desc: isHindi ? "समर्पित संसाधनों और अनुकूलित रूटिंग की आवश्यकता वाले वैश्विक आतिथ्य समूहों के लिए।" : "For hospitality groups requiring dedicated resources and customized routing.",
      features: isHindi ? [
        "असीमित प्रबंधित आउटलेट नोड्स",
        "बहु-क्षेत्रीय फ्लोरप्लान ब्लूप्रिंट",
        "कस्टम लोगो और एजेंसी ब्रांडिंग",
        "समर्पित डेटाबेस प्रतिकृति",
        "पूर्ण एपीआई प्रेषण पहुंच",
        "कस्टम भुगतान गेटवे बाइंडिंग",
        "समर्पित खाता प्रबंधक"
      ] : [
        "Unlimited Managed Outlets Nodes",
        "Multi-Zone Floorplan Blueprints",
        "Custom Logo & Agency branding",
        "Dedicated Database Replica",
        "Full API Dispatch access",
        "Custom Payment Gateway binding",
        "Dedicated Account Executive"
      ],
      cta: isHindi ? "उद्यम बिक्री से संपर्क करें" : "Contact Enterprise Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-32 relative z-10 border-b border-white/5 bg-[#070707]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase">
            {t('pricing_matrix')}
          </span>
          
          <h2 className="text-4xl md:text-5xl font-serif text-[#F5F0EB]">
            {t('pricing_title')}
          </h2>
          
          {/* Toggle billing cycle */}
          <div className="inline-flex items-center gap-4 bg-black border border-white/10 rounded-full p-1.5 mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-[var(--color-amber)] text-black' : 'text-[#F5F0EB]/60 hover:text-[#F5F0EB]'}`}
            >
              {t('monthly_billing')}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'bg-[var(--color-amber)] text-black' : 'text-[#F5F0EB]/60 hover:text-[#F5F0EB]'}`}
            >
              {t('yearly_billing')}
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                {t('save_20')}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`glass-card-dark rounded-xl p-8 border flex flex-col justify-between relative overflow-hidden transition-all duration-500 reveal ${plan.popular ? 'border-[var(--color-amber)] shadow-[0_15px_40px_-10px_rgba(212,146,10,0.15)] scale-102 lg:-translate-y-2' : 'border-white/5'}`}
            >
              {/* Highlight ribbon for most popular */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-[var(--color-amber)] text-black font-mono text-[8px] font-bold px-4 py-1.5 tracking-wider uppercase rounded-bl">
                  {t('recommended')}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-serif text-[#F5F0EB]">{plan.name}</h3>
                  <p className="text-xs text-[rgba(245,240,235,0.55)] font-light mt-2 min-h-[40px] leading-relaxed">
                    {plan.desc}
                  </p>
                </div>

                {/* Price Display */}
                <div className="border-y border-white/5 py-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-serif font-bold text-[#F5F0EB]">
                      {formatPrice(idx === 0 ? 'Bronze Plan' : idx === 1 ? 'Silver Plan' : 'Gold Plan', billingCycle, billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}
                    </span>
                    <span className="text-xs text-[rgba(245,240,235,0.4)] font-light">
                      / {isHindi ? 'महीना' : 'month'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)] font-mono mt-2 uppercase tracking-wide">
                    {billingCycle === 'yearly' 
                      ? `${t('billed_annually')} (${formatPrice(idx === 0 ? 'Bronze Plan' : idx === 1 ? 'Silver Plan' : 'Gold Plan', 'yearly', (billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice) * 12)}/${isHindi ? 'वर्ष' : 'yr'})`
                      : t('billed_monthly')}
                  </div>
                </div>

                {/* Features Checklist */}
                <ul className="space-y-3.5 text-left">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-xs text-[#F5F0EB]/85 font-light">
                      {/* Check icon */}
                      <svg className="w-4 h-4 text-[var(--color-amber)] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                {plan.name === 'Gold Plan' || plan.name === 'स्वर्ण योजना' ? (
                  <a
                    href="mailto:sales@bhoj360.com?subject=Bhoj360%20Gold%20Plan%20Inquiry"
                    className="w-full block py-4 text-center rounded font-semibold text-sm transition-all border border-white/15 bg-white/5 text-[#F5F0EB] hover:bg-white/10 hover:border-white/20 active:scale-95 animate-shimmer"
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    to="/app/login"
                    className={`w-full block py-4 text-center rounded font-semibold text-sm transition-all active:scale-95 shimmer-btn ${plan.popular ? 'bg-[var(--color-amber)] text-black hover:bg-[var(--color-amber-light)] shadow-md' : 'border border-white/10 bg-white/5 text-[#F5F0EB] hover:bg-white/10 hover:border-white/20'}`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
