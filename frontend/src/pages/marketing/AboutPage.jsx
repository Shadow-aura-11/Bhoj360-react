import React from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import { useLanguage } from '../../hooks/useLanguage';

export default function AboutPage() {
  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  const values = isHindi ? [
    { title: "नवाचार (Innovation)", desc: "हम अत्याधुनिक क्लाउड-नेटिव कंटेनर समाधानों के साथ पारंपरिक आतिथ्य प्रणालियों की सीमाओं को आगे बढ़ाते हैं।" },
    { title: "विश्वसनीयता (Reliability)", desc: "प्रत्येक आउटलेट एक अलग नोड पर चलता है, जिसका अर्थ है 99.99% अपटाइम और शून्य क्रॉस-कस्टमर डेटा लीक का खतरा।" },
    { title: "समर्थन (Support)", desc: "हमारी सहायता टीम आपकी सहायता के लिए सदैव उपलब्ध है — प्रिंटर कॉन्फ़िगरेशन से लेकर जीएसटी अनुपालन तक।" },
    { title: "स्थानीय फोकस (Local Focus)", desc: "भारतीय रेस्तरां की वास्तविक परिचालन आवश्यकताओं को समझते हुए, हम यूपीआई और जीएसटी जैसे स्थानीय नियमों और प्रणालियों के साथ एकीकृत हैं।" }
  ] : [
    { title: "Innovation", desc: "Pushing the boundaries of hospitality technology with cutting-edge, cloud-native containerized architecture." },
    { title: "Reliability", desc: "Every outlet runs on an isolated instance, ensuring 99.99% uptime and zero shared-database downtime risks." },
    { title: "Support", desc: "Dedicated support tailored to solve real-world hardware, network, and operational issues in real time." },
    { title: "Local Focus", desc: "Engineered specifically for the Indian market, integrating GST taxation, local thermal printing, and UPI payments." }
  ];

  return (
    <div className="tableos-landing min-h-screen flex flex-col justify-between bg-[#080808] text-[#F5F0EB] relative">
      <div className="noise-overlay"></div>
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(212,146,10,0.03)] blur-[100px] pointer-events-none"></div>
      
      <Nav />
      <FloatingWhatsApp />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="max-w-4xl mx-auto space-y-16 text-left">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase block">
              {isHindi ? "हमारे बारे में" : "About Bhoj360"}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-[#F5F0EB] leading-tight">
              {isHindi ? "रेस्तरां संचालन को नया रूप दे रहे हैं।" : "Architecting the future of dining."}
            </h1>
            <p className="text-[rgba(245,240,235,0.7)] text-lg md:text-xl font-light leading-relaxed">
              {isHindi 
                ? "Bhoj360 एक अगली पीढ़ी का रेस्तरां प्रौद्योगिकी मंच है, जिसे भारतीय आतिथ्य उद्योग के लिए ग्राउंड-अप से डिजाइन किया गया है। हम केवल एक सॉफ्टवेयर नहीं हैं, हम आधुनिक रेस्तरां के लिए एक पूर्ण परिचालन इंजन हैं।"
                : "Bhoj360 is a next-generation restaurant technology platform engineered from the ground up to power modern hospitality groups with decentralized, isolated node architecture."
              }
            </p>
          </div>

          <hr className="border-white/10" />

          {/* Grid Content: Core Value Prop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-[var(--color-amber)]">
                {isHindi ? "विकेंद्रीकृत नोड आर्किटेक्चर" : "Decentralized Database Instances"}
              </h2>
              <p className="text-sm text-[rgba(245,240,235,0.65)] leading-relaxed font-light">
                {isHindi
                  ? "पारंपरिक प्रणालियों के विपरीत जहां एकल सर्वर क्रैश होने से हजारों रेस्तरां प्रभावित होते हैं, Bhoj360 प्रत्येक आउटलेट के लिए एक अलग, अलग कंटेनर डेटाबेस प्रदान करता है। इससे उच्च गति सिंक और शून्य डाउनटाइम सुरक्षा सुनिश्चित होती है।"
                  : "Unlike monolithic systems where a single database outage compromises thousands of outlets, Bhoj360 provisions isolated node instances for every restaurant. This guarantees lightning-fast synchronizations, independent backups, and maximum security."
                }
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-[var(--color-amber)]">
                {isHindi ? "भारतीय बाजार की जरूरतें" : "Built for the Indian Ecosystem"}
              </h2>
              <p className="text-sm text-[rgba(245,240,235,0.65)] leading-relaxed font-light">
                {isHindi
                  ? "हम जीएसटी बिलिंग, वास्तविक समय थर्मल केओटी मुद्रण, यूपीआई भुगतान विभाजन और व्हाट्सएप बिल साझा करने जैसे आवश्यक स्थानीय संचालन का समर्थन करते हैं। हमारे सिस्टम आपके स्थानीय कर्मचारियों के लिए सहज और सटीक हैं।"
                  : "From GST-compliant billing and multi-terminal kitchen order tickets (KOT) to dynamic UPI QR codes and simulated WhatsApp billing, our ecosystem covers local operational requirements with absolute precision."
                }
              </p>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="space-y-8 pt-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-serif text-[#F5F0EB]">
                {isHindi ? "हमारे मूल मूल्य" : "Our Core Values"}
              </h2>
              <p className="text-sm text-[rgba(245,240,235,0.6)] font-light">
                {isHindi ? "सिद्धांत जो हमारे काम और तकनीकी निर्णयों को निर्देशित करते हैं।" : "The principles that guide our product engineering and customer success operations."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((v, idx) => (
                <div key={idx} className="glass-card-dark rounded-xl p-6 border border-white/5 bg-black/30 hover:border-amber-500/20 transition-all duration-300">
                  <h3 className="text-lg font-serif text-[var(--color-amber)] mb-2">{v.title}</h3>
                  <p className="text-xs text-[rgba(245,240,235,0.7)] font-light leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Architecture Details */}
          <div className="space-y-6 pt-8">
            <h2 className="text-3xl font-serif text-[#F5F0EB]">
              {isHindi ? "नोड कंटेनर वास्तुकला (Technical Architecture)" : "Isolated Node Container Architecture"}
            </h2>
            <div className="glass-card-dark rounded-2xl p-8 border border-white/5 bg-black/40 space-y-6">
              <p className="text-sm text-[rgba(245,240,235,0.7)] leading-relaxed font-light">
                {isHindi 
                  ? "Bhoj360 का मूल इसके उन्नत नोड ऑर्केस्ट्रेशन पर आधारित है। प्रत्येक रेस्तरां आउटलेट को अपना स्वयं का लिनक्स-आधारित नोड.जेएस वातावरण और स्थानीय एम्बेडेड डेटाबेस मिलता है। यह डेटाबेस मुख्य गेटवे के साथ स्वचालित रूप से सिंक होता है।"
                  : "At the core of Bhoj360 is our proprietary node orchestration model. When you boot an outlet on Bhoj360, our gateway provisions an isolated micro-service terminal with its own sandboxed configurations, active socket listeners, and independent local database sync capabilities."
                }
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-center">
                <div className="p-4 border border-white/5 rounded-xl bg-black/20">
                  <div className="text-2xl font-serif text-[var(--color-amber)] mb-1">01</div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#F5F0EB] mb-2">{isHindi ? "पूर्ण गोपनीयता" : "Absolute Sandbox"}</h4>
                  <p className="text-[11px] text-[rgba(245,240,235,0.5)] font-light leading-relaxed">
                    {isHindi ? "कोई साझा डेटाबेस नहीं। आपका डेटा पूरी तरह से आपका है।" : "Data is physically siloed per tenant. Risk of database-level leak is mathematically zero."}
                  </p>
                </div>
                <div className="p-4 border border-white/5 rounded-xl bg-black/20">
                  <div className="text-2xl font-serif text-[var(--color-amber)] mb-1">02</div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#F5F0EB] mb-2">{isHindi ? "सक्रिय ऑफ़लाइन क्षमता" : "Active Offline Cache"}</h4>
                  <p className="text-[11px] text-[rgba(245,240,235,0.5)] font-light leading-relaxed">
                    {isHindi ? "इंटरनेट अस्थिर होने पर भी आपका टर्मिनल काम करता रहता है।" : "Keep printing bills and placing table orders even during active WAN internet dropouts."}
                  </p>
                </div>
                <div className="p-4 border border-white/5 rounded-xl bg-black/20">
                  <div className="text-2xl font-serif text-[var(--color-amber)] mb-1">03</div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#F5F0EB] mb-2">{isHindi ? "कस्टम हार्डवेयर सेटिंग्स" : "Direct Hardware Binding"}</h4>
                  <p className="text-[11px] text-[rgba(245,240,235,0.5)] font-light leading-relaxed">
                    {isHindi ? "प्रत्येक काउंटर को अपनी खुद की थर्मल प्रिंटर चौड़ाई और फ़ॉन्ट मिलते हैं।" : "Map terminal layouts specifically to 58mm/80mm local printing dimensions independently."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual statement / Commitment */}
          <div className="glass-card-dark rounded-2xl p-8 border border-white/5 bg-black/40 text-center space-y-4">
            <h3 className="text-xl font-serif text-[#F5F0EB]">
              {isHindi ? "हमारा आतिथ्य के प्रति समर्पण" : "Our Commitment to Hospitality"}
            </h3>
            <p className="text-sm text-[rgba(245,240,235,0.7)] max-w-2xl mx-auto leading-relaxed font-light">
              {isHindi
                ? "हमारा लक्ष्य तकनीक को रेस्तरां के लिए सरल, तेज़ और विश्वसनीय बनाना है ताकि आप डाइनिंग अनुभव पर ध्यान केंद्रित कर सकें, जबकि Bhoj360 बाकी सब संभालता है।"
                : "To empower hospitality businesses with absolute operational sovereignty, minimizing checkout friction, and building beautiful, robust software tools that restaurant staffs actually enjoy using."
              }
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
