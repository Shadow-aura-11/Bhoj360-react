import React from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import { useLanguage } from '../../hooks/useLanguage';

export default function ShowcasePage() {
  const { lang, t } = useLanguage();
  const isHindi = lang === 'hi';

  const items = isHindi ? [
    {
      name: "वेटर डिस्पैच टर्मिनल",
      desc: "वेटर और कर्मचारियों के लिए डिज़ाइन किया गया एक मोबाइल-उत्तरदायी डार्क-थीम इंटरफ़ेस। यह उन्हें सीधे टेबल से ऑर्डर लेने, रसोई में भेजने, वेटर कॉल अलर्ट प्राप्त करने और वास्तविक समय में ऑर्डर स्थिति अपडेट देखने की अनुमति देता है। 10-अंकीय फोन सत्यापन के साथ त्वरित स्टाफ पिन लॉगिन सुविधा भी शामिल है।",
      img: "/waiter_terminal.png",
      badge: "स्टाफ मॉड्यूल"
    },
    {
      name: "कैशियर पीओएस कंसोल",
      desc: "कैशियर और प्रबंधकों के लिए बिल निपटान केंद्र। एक क्लिक से विभाजित भुगतान (कैश, यूपीआई, या अन्य), रीयल-टाइम रसीद लाइव थर्मल पूर्वावलोकन, क्यूआर-कोड जनरेटर, और अनुकूलित प्रिंटर आकार (80mm/58mm) विन्यास का समर्थन करता है। निपटान के बाद ग्राहक को व्हाट्सएप या गूगल रिव्यू लिंक के लिए निर्देशित करने का विकल्प देता है।",
      img: "/cashier_pos.png",
      badge: "बिलिंग मॉड्यूल"
    },
    {
      name: "रसोई प्रदर्शन प्रणाली (KDS)",
      desc: "रसोई के अंदर शेफ के लिए एक वास्तविक समय डिस्प्ले कार्ड ग्रिड। यह कागजी पर्चियों की आवश्यकता को समाप्त करता है। टिकटिंग प्रणाली को समय के आधार पर ग्रीन (ताज़ा), ऑरेंज (समय बीत रहा है) और रेड (विलंबित) रंगों में वर्गीकृत किया जाता है। शेफ एक टैप से ऑर्डर की तैयारी पूरी होने की घोषणा कर सकते हैं।",
      img: "/kds_screen.png",
      badge: "उत्पादन मॉड्यूल"
    },
    {
      name: "ग्राहक डाइनिंग पोर्टल",
      desc: "डाइनिंग टेबल पर ग्राहकों के लिए क्यूआर-आधारित स्वयं-ऑर्डरिंग और मेनू ब्राउज़िंग ब्राउज़र। इसमें सुंदर रंग थीम (Onyx Dark, Emerald Clean, Ruby Royal, Amber Light) का समर्थन है। ग्राहक अपने फोन से सीधे वेटर को कॉल कर सकते हैं, ऑर्डर की स्थिति देख सकते हैं, और भुगतान निपटाने के बाद बिल देख सकते हैं।",
      img: "/customer_dining.png",
      badge: "अतिथि अनुभव"
    }
  ] : [
    {
      name: "Waiter Dispatch Terminal",
      desc: "A mobile-responsive, dark-themed interface crafted for waiters and floor staff. Supports instant table-side order intake, real-time sync with kitchen queues, visual waiter call banners, and status updates. Equipped with quick staff PIN login verified with a 10-digit phone profile.",
      img: "/waiter_terminal.png",
      badge: "Staff Module"
    },
    {
      name: "Cashier POS Console",
      desc: "The nerve center of billing operations for cashier managers. Features instant splitting for Cash & Online payments, dynamic base64 UPI QR code generation, custom receipt footer configuration, and live thermal preview matching the printed slip. Offers post-settlement options to send reviews to Google or share bills over WhatsApp.",
      img: "/cashier_pos.png",
      badge: "Billing Module"
    },
    {
      name: "Kitchen Display System (KDS)",
      desc: "A live, reactive touch-screen display grid that replaces paper KOT slips for chefs in the kitchen. Orders are automatically color-coded by preparation duration (Green for fresh, Orange for pending, and Red for delayed) to ensure high-priority speed, course management, and meal dispatch.",
      img: "/kds_screen.png",
      badge: "Production Module"
    },
    {
      name: "Guest Dining Portal",
      desc: "A browser-based self-dining menu powered by table-specific QR codes. Supports stunning branded skins (Onyx Dark, Emerald Clean, Ruby Royal, Amber Light) tailored by the restaurant admin. Allows guests to place orders, trigger waiter assistance, view historical checks, and receive review prompts upon checkout.",
      img: "/customer_dining.png",
      badge: "Guest Experience"
    }
  ];

  return (
    <div className="tableos-landing min-h-screen flex flex-col justify-between bg-[#080808] text-[#F5F0EB] relative">
      <div className="noise-overlay"></div>
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(212,146,10,0.03)] blur-[100px] pointer-events-none"></div>
      
      <Nav />
      <FloatingWhatsApp />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="max-w-4xl mx-auto space-y-12 text-left">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase block">
              {isHindi ? "सिस्टम इंटरफेस गैलरी" : "System Interface Gallery"}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-[#F5F0EB] leading-tight">
              {isHindi ? "लाइव काम के दौरान वास्तविक समय प्रणालियां।" : "Visualizing Bhoj360 in active operations."}
            </h1>
            <p className="text-[rgba(245,240,235,0.7)] text-lg md:text-xl font-light leading-relaxed">
              {isHindi
                ? "Bhoj360 इंटरफ़ेस को परिचालन रूप से मजबूत और अत्यंत सुंदर बनाया गया है। नीचे हमारे मुख्य संचालन मॉड्यूल देखें।"
                : "Explore how Bhoj360 operates across active staff terminals and customer layouts, built to streamline orders and eliminate communication delays."
              }
            </p>
          </div>

          <hr className="border-white/10" />

          {/* Demos Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {items.map((item, idx) => (
              <div key={idx} className="glass-card-dark rounded-2xl border border-white/5 bg-black/40 overflow-hidden flex flex-col justify-between hover:border-amber-500/20 transition-all duration-300 reveal">
                <div className="p-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-[var(--color-amber)] tracking-[0.1em] border border-amber-500/20 px-2.5 py-0.5 rounded-full bg-amber-500/5">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-[#F5F0EB]">{item.name}</h3>
                  <p className="text-xs text-[rgba(245,240,235,0.65)] font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                {/* Visual Image container - premium mockup */}
                <div className="relative h-60 bg-gradient-to-t from-black/80 to-[#111111] border-t border-white/5 overflow-hidden group">
                  <div className="absolute inset-0 bg-grid-pattern opacity-40 z-0"></div>
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 relative z-10"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
