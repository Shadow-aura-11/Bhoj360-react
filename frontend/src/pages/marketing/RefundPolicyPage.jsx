import React from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import { useLanguage } from '../../hooks/useLanguage';

export default function RefundPolicyPage() {
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
              {isHindi ? "रद्दीकरण और धनवापसी नीति" : "Cancellation & Refund Policy"}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {isHindi ? "अंतिम अद्यतन: 1 जून 2026" : "Last Updated: June 1, 2026"}
            </p>
          </div>

          <hr className="border-white/10" />

          <div className="space-y-6 text-sm font-light text-[rgba(245,240,235,0.75)] leading-relaxed">
            <p>
              {isHindi
                ? "Bhoj360 में, हम पारदर्शी व्यापारिक व्यवहार में विश्वास करते हैं। हमारे रेस्तरां प्रबंधन सदस्यता के संबंध में हमारी रद्दीकरण और धनवापसी नीति नीचे दी गई है।"
                : "At Bhoj360, we believe in transparent business transactions. This Cancellation & Refund Policy outlines the terms governing your SaaS subscriptions and outlet node instances."
              }
            </p>

            <h2 className="text-xl font-serif text-[#F5F0EB] pt-2">
              {isHindi ? "1. सदस्यता रद्दीकरण" : "1. Subscription Cancellation"}
            </h2>
            <p>
              {isHindi
                ? "आप अपने बिलिंग चक्र की समाप्ति से पहले किसी भी समय अपने व्यवस्थापक डैशबोर्ड से अपनी सदस्यता रद्द कर सकते हैं। रद्द करने पर, आपका आउटलेट डेटाबेस बंद कर दिया जाएगा, और डेटा बैकअप 30 दिनों के भीतर सुरक्षित रूप से हटा दिया जाएगा।"
                : "You may cancel your restaurant subscription at any time via the agency dashboard. Upon cancellation, your database container will be stopped, and your tables configuration and menu items registry will be permanently deleted after a 30-day grace period."
              }
            </p>

            <h2 className="text-xl font-serif text-[#F5F0EB] pt-2">
              {isHindi ? "2. धनवापसी नीति" : "2. Refund Eligibility"}
            </h2>
            <p>
              {isHindi
                ? "चूंकि हमारी सेवाएं एकमुश्त सेटअप और तत्काल कंटेनर प्रावधान प्रदान करती हैं, इसलिए हम पहले से उपयोग की जा चुकी बिलिंग अवधियों के लिए आंशिक या पूर्ण रिफंड जारी नहीं करते हैं। नए सक्रिय खातों के लिए 7 दिन की मनी-बैक गारंटी उपलब्ध है।"
                : "Because Bhoj360 incurs direct server computing costs when provisioning node containers instantly, we do not offer refunds on active billing periods. However, new clients are eligible for a 7-day money-back guarantee if the platform fails to meet operational standards."
              }
            </p>

            <h2 className="text-xl font-serif text-[#F5F0EB] pt-2">
              {isHindi ? "3. भुगतान विवाद" : "3. Payment Disputes"}
            </h2>
            <p>
              {isHindi
                ? "किसी भी बिलिंग विसंगति या विवाद के लिए, कृपया support@bhoj360.com पर तुरंत हमारी सहायता टीम से संपर्क करें। हम 3 व्यावसायिक दिनों के भीतर आपकी समस्या का समाधान करेंगे।"
                : "For any billing errors, duplicate charges, or dispute claims, please contact our support desk at support@bhoj360.com immediately. Verified billing errors will be refunded back to the original payment source within 5-7 business days."
              }
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
