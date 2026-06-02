import React from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import { useLanguage } from '../../hooks/useLanguage';

export default function FeaturesPage() {
  const { lang, t } = useLanguage();
  const isHindi = lang === 'hi';

  const features = isHindi ? [
    { title: "एकीकृत पीओएस बिलिंग", desc: "जीएसटी-अनुपालन करों, सेवा शुल्क और स्प्लिट कैश/यूपीआई भुगतान निपटान के साथ पूर्ण बिलिंग कंसोल।" },
    { title: "इंटरैक्टिव फ्लोर प्लान", desc: "टेबल लेआउट खींचें और छोड़ें, वास्तविक समय की बैठने की स्थिति देखें, और वेटर ऑर्डर डिस्पैच पाइपलाइन प्रबंधित करें।" },
    { title: "डायनेमिक यूपीआई क्यूआर कोड", desc: "प्रत्येक टेबल चेक के लिए स्वचालित रूप से अद्वितीय यूपीआई क्यूआर कोड उत्पन्न करें। ग्राहक स्कैन करके तुरंत भुगतान कर सकते हैं।" },
    { title: "थर्मल केओटी प्रिंटिंग", desc: "स्वचालित रूप से रसोई ऑर्डर टिकट प्रिंट करें। प्रिंट प्रीव्यू देखने के लिए लाइव थर्मल रसीद कार्ड प्रीव्यू।" },
    { title: "वेटर और किचन टर्मिनल", desc: "कदम-दर-कदम भोजन निर्माण और वितरण प्रक्रिया के लिए वेटर टैबलेट लॉगिन और रसोई केडीएस लाइव डिस्प्ले पाइप।" },
    { title: "गूगल समीक्षा स्वचालन", desc: "भुगतान पूर्ण होने के बाद ग्राहकों को स्वतः गूगल समीक्षा लिंक पर रीडायरेक्ट करें। समीक्षा रेटिंग बढ़ाएं।" },
    { title: "व्हाट्सएप बिल शेयरिंग", desc: "बिना किसी महंगे बिजनेस एपीआई शुल्क के सीधे ग्राहकों के व्हाट्सएप नंबर पर बिल विवरण और रसीद संदेश साझा करें।" },
    { title: "कूपन और कूपन प्रबंधक", desc: "न्यूनतम ऑर्डर मूल्य नियंत्रण, प्रतिशत या निश्चित मूल्य छूट के साथ प्रोमो कूपन कोड बनाएं और सत्यापित करें।" }
  ] : [
    { title: "Unified POS Billing", desc: "Complete billing terminal with GST compliance, service charges, and split cash/online payment settlement." },
    { title: "Interactive Floorplans", desc: "Drag & drop table shapes, manage dynamic seating occupancy statuses, and synchronize live orders." },
    { title: "Dynamic UPI QR Codes", desc: "Instantly generate Base64 payment QR codes based on order totals and restaurant merchant UPI configurations." },
    { title: "Thermal KOT Print Engine", desc: "Send print commands to local receipt printers automatically. Check custom headers, footers and live bill previews." },
    { title: "Waiter & Kitchen Terminals", desc: "Mobile-first waiter dashboard interface and real-time Kitchen Display Systems (KDS) order tracking pipeline." },
    { title: "Google Review Automation", desc: "Redirect customers to leave a review immediately after their order is paid. Build online brand trust." },
    { title: "WhatsApp Receipt Shares", desc: "Simulate and send bills to customer numbers, pre-composing links for fast WhatsApp Web client sharing." },
    { title: "Promo Coupon Manager", desc: "Create percentage or fixed discounts, configure minimum check totals, and validate active coupons in real-time." }
  ];

  return (
    <div className="tableos-landing min-h-screen flex flex-col justify-between bg-[#080808] text-[#F5F0EB] relative">
      <div className="noise-overlay"></div>
      <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-[rgba(212,146,10,0.03)] blur-[100px] pointer-events-none"></div>
      
      <Nav />
      <FloatingWhatsApp />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="max-w-4xl mx-auto space-y-12 text-left">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase block">
              {isHindi ? "प्रणाली की क्षमताएं" : "System Capabilities"}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-[#F5F0EB] leading-tight">
              {isHindi ? "आधुनिक भोजनालयों के लिए निर्मित उपकरण।" : "Engineered for speed, built for reliability."}
            </h1>
            <p className="text-[rgba(245,240,235,0.7)] text-lg md:text-xl font-light leading-relaxed">
              {isHindi
                ? "Bhoj360 परिचालन दक्षता को अधिकतम करने और ग्राहक संतुष्टि को बढ़ाने के लिए उपकरणों का एक शक्तिशाली सेट प्रदान करता है।"
                : "Explore the comprehensive features that make Bhoj360 the premium orchestration engine for standalone tables and multi-restaurant networks alike."
              }
            </p>
          </div>

          <hr className="border-white/10" />

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {features.map((feat, idx) => (
              <div key={idx} className="glass-card-dark rounded-2xl p-6 border border-white/5 bg-black/40 space-y-3 hover:border-amber-500/20 transition-all duration-300">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-amber)]/10 text-[var(--color-amber)] flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <h3 className="text-xl font-serif text-[#F5F0EB]">{feat.title}</h3>
                <p className="text-xs text-[rgba(245,240,235,0.65)] font-light leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
