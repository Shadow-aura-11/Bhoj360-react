import React from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import { useLanguage } from '../../hooks/useLanguage';

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  return (
    <div className="tableos-landing min-h-screen flex flex-col justify-between bg-[#080808] text-[#F5F0EB] relative">
      <div className="noise-overlay"></div>
      
      <Nav />
      <FloatingWhatsApp />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="max-w-3xl mx-auto space-y-8 text-left">
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-[var(--color-amber)] uppercase tracking-widest block">
              {isHindi ? "कानूनी अनुपालन" : "Legal & Compliance"}
            </span>
            <h1 className="text-3xl md:text-5xl font-serif text-[#F5F0EB]">
              {isHindi ? "गोपनीयता नीति" : "Privacy Policy"}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {isHindi ? "अंतिम अद्यतन: 1 जून 2026" : "Last Updated: June 1, 2026"}
            </p>
          </div>

          <hr className="border-white/10" />

          <div className="space-y-6 text-sm font-light text-[rgba(245,240,235,0.75)] leading-relaxed">
            <p>
              {isHindi
                ? "Bhoj360 में, हम आपकी गोपनीयता की रक्षा करने के लिए प्रतिबद्ध हैं। यह गोपनीयता नीति बताती है कि जब आप हमारे रेस्तरां प्रबंधन सॉफ्टवेयर का उपयोग करते हैं तो हम आपकी जानकारी कैसे एकत्र, उपयोग और सुरक्षित करते हैं।"
                : "At Bhoj360, accessible from our marketing site and staff console, one of our main priorities is the privacy of our visitors and clients. This Privacy Policy document outlines the types of information collected and recorded by our platform and how we use it."
              }
            </p>

            <h2 className="text-xl font-serif text-[#F5F0EB] pt-2">
              {isHindi ? "1. डेटा अलगाव और नोड्स" : "1. Database Isolation & Outlet Containers"}
            </h2>
            <p>
              {isHindi
                ? "प्रत्येक रेस्तरां आउटलेट अपनी पृथक डेटाबेस फ़ाइल पर चलता है। हम आउटलेट के डेटाबेस को दूसरों के साथ साझा या एकीकृत नहीं करते हैं। आपके ग्राहकों की संपर्क जानकारी पूरी तरह से सुरक्षित है और केवल आपके स्टाफ डैशबोर्ड के भीतर ही सुलभ है।"
                : "Because Bhoj360 employs a decentralized architecture, all transaction records, staff logs, and guest check details are kept inside isolated database containers per outlet. We do not sell or compile cross-outlet customer metrics to third parties."
              }
            </p>

            <h2 className="text-xl font-serif text-[#F5F0EB] pt-2">
              {isHindi ? "2. जानकारी हम एकत्र करते हैं" : "2. Information We Collect"}
            </h2>
            <p>
              {isHindi
                ? "पंजीकरण के दौरान हम संपर्क फ़ोन नंबर (बिल्कुल 10-अंकीय सत्यापित), ईमेल पता, आउटलेट नाम, कानूनी अनुपालन विवरण (FSSAI) और स्टाफ पिन जानकारी एकत्र करते हैं।"
                : "When registers or staff profiles are updated, we collect operational data including legal compliance parameters (e.g. FSSAI details), customer telephone numbers (validated to exactly 10 digits for WhatsApp bill triggers), and order totals."
              }
            </p>

            <h2 className="text-xl font-serif text-[#F5F0EB] pt-2">
              {isHindi ? "3. सुरक्षा नियंत्रण" : "3. Security Framework"}
            </h2>
            <p>
              {isHindi
                ? "हम सुरक्षा उल्लंघनों को रोकने के लिए एन्क्रिप्शन और सुरक्षित सॉकेट परतों का उपयोग करते हैं। आपकी बिलिंग सेटिंग्स और कर्मचारी लॉग सुरक्षित हैं।"
                : "We utilize industrial-standard secure sockets (SSL) and token-based staff authorization APIs. Backups are run locally inside isolated storage directories and are secured by access controls."
              }
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
