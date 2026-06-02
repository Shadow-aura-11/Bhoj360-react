import React from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import { useLanguage } from '../../hooks/useLanguage';

export default function TermsPage() {
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
              {isHindi ? "नियम और शर्तें" : "Terms & Conditions"}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {isHindi ? "अंतिम अद्यतन: 1 जून 2026" : "Last Updated: June 1, 2026"}
            </p>
          </div>

          <hr className="border-white/10" />

          <div className="space-y-6 text-sm font-light text-[rgba(245,240,235,0.75)] leading-relaxed">
            <p>
              {isHindi
                ? "Bhoj360 में आपका स्वागत है। हमारी सेवाओं का उपयोग करके, आप इन नियमों और शर्तों से बंधे होने के लिए सहमत होते हैं। कृपया उन्हें ध्यान से पढ़ें।"
                : "Welcome to Bhoj360. By provisioning outlet nodes, using the staff dashboards, or registering subscriptions, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully."
              }
            </p>

            <h2 className="text-xl font-serif text-[#F5F0EB] pt-2">
              {isHindi ? "1. सेवा लाइसेंस" : "1. Service Licensing"}
            </h2>
            <p>
              {isHindi
                ? "हम आपको अपने रेस्तरां आउटलेट के प्रबंधन के लिए हमारे सॉफ़्टवेयर को तैनात करने का एक गैर-अनन्य, गैर-हस्तांतरणीय लाइसेंस प्रदान करते हैं। आप रिवर्स-इंजीनियरिंग नहीं कर सकते हैं या सुरक्षा नियंत्रणों को बायपास नहीं कर सकते हैं।"
                : "Bhoj360 grants client restaurants a non-exclusive, non-transferable, revocable subscription license to run their database container instances. Any attempt to reverse engineer, bypass login setups, or corrupt peer database files is strictly prohibited."
              }
            </p>

            <h2 className="text-xl font-serif text-[#F5F0EB] pt-2">
              {isHindi ? "2. ग्राहक डेटा और FSSAI" : "2. Customer Data & FSSAI Compliance"}
            </h2>
            <p>
              {isHindi
                ? "रेस्तरां के मालिक अपने ग्राहकों के 10-अंकीय फोन नंबरों के सटीक संग्रह और उनके FSSAI लाइसेंस पंजीकरण के कानूनी अनुपालन के लिए ज़िम्मेदार हैं। हम किसी भी अनधिकृत उपयोग के लिए उत्तरदायी नहीं हैं।"
                : "Restaurant managers are solely responsible for compliance with local food safety standards (such as registering valid FSSAI numbers on staff settings) and respecting customer data collected for billing. Bhoj360 acts as a passive database runner."
              }
            </p>

            <h2 className="text-xl font-serif text-[#F5F0EB] pt-2">
              {isHindi ? "3. बिलिंग शर्तें" : "3. Subscriptions & Payments"}
            </h2>
            <p>
              {isHindi
                ? "सभी भुगतानों को चुने गए चक्र (मासिक या वार्षिक) के अनुसार इनर (INR) में बिल किया जाता है। बिलिंग विफलता के परिणामस्वरूप आपकी नोड कंटेनर सेवा निलंबित हो सकती है।"
                : "Subscriptions are billed recurringly on a monthly or yearly cycle. Non-payment within 7 days of the renewal date will trigger automatic suspension of the restaurant database instance."
              }
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
