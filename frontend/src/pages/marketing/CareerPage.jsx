import React, { useState } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import { useLanguage } from '../../hooks/useLanguage';

export default function CareerPage() {
  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resumeLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'

  const jobs = isHindi ? [
    { title: "सेल्स मैनेजर / ग्रोथ लीड", location: "बेंगलुरु / हाइब्रिड", dept: "बिक्री और विपणन", desc: "भारतीय बाजारों में हमारे विकेंद्रीकृत रेस्तरां पीओएस इंजनों के विकास को आगे बढ़ाएं। नए आउटलेट्स और आतिथ्य श्रृंखलाओं के साथ संबंध बनाएं।" },
    { title: "नोड.जेएस बैकएंड इंजीनियर", location: "बेंगलुरु / रिमोट", dept: "इंजीनियरिंग", desc: "हमारे विकेंद्रीकृत डेटाबेस कंटेनर आर्किटेक्चर, रीयल-टाइम सॉकेट पाइप और स्केलेबल एपीआई कोर विकसित करें।" },
    { title: "रिएक्ट यूआई / यूएक्स डेवलपर", location: "बेंगलुरु / हाइब्रिड", dept: "डिजाइन और फ्रंटएंड", desc: "रेस्तरां के लिए बेहद प्रीमियम, विजुअल स्टाफ और अतिथि इंटरफेस और इंटरेक्टिव फ्लोर-प्लान का निर्माण करें।" },
    { title: "संचालन और सहायता विशेषज्ञ", location: "रिमोट (भारत)", dept: "ग्राहक सफलता", desc: "रेस्तरां को प्लेटफॉर्म ऑनबोर्डिंग में मदद करें, FSSAI अनुपालन प्रविष्टियों और स्थानीय प्रिंटर सेटिंग्स को हल करें।" }
  ] : [
    { title: "Sales Manager / Growth Lead", location: "Bengaluru / Hybrid", dept: "Sales & Marketing", desc: "Drive customer acquisition, expand restaurant network, negotiate contracts, and accelerate agency sales operations in tier-1/tier-2 Indian cities." },
    { title: "Node.js Backend Engineer", location: "Bengaluru / Remote", dept: "Engineering", desc: "Scale our isolated SQLite database container architecture, optimize local REST endpoints, and implement robust socket rooms." },
    { title: "React UI/UX Developer", location: "Bengaluru / Hybrid", dept: "Design & Frontend", desc: "Build state-of-the-art interactive table floorplans, beautiful dark-themed dashboards, and responsive customer dining layouts." },
    { title: "Operations & Support Specialist", location: "Remote (India)", dept: "Customer Success", desc: "Coordinate new restaurant onboarding processes, troubleshoot local thermal print setups, and assist manager PIN configurations." }
  ];

  const handleOpenModal = (roleTitle) => {
    setSelectedRole(roleTitle);
    setFormData({
      name: '',
      email: '',
      phone: '',
      coverLetter: '',
      resumeLink: ''
    });
    setMessage({ text: '', type: '' });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // Validate name, email, phone, and role
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !selectedRole) {
      setMessage({ text: isHindi ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill out all required fields.', type: 'error' });
      return;
    }

    // Validate phone number is exactly 10 digits
    const cleanedPhone = formData.phone.trim().replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleanedPhone)) {
      setMessage({ text: isHindi ? 'फोन नंबर बिल्कुल 10 अंकों का होना चाहिए।' : 'Phone number must be exactly 10 digits.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Find Port - assuming agency-core runs on gateway PORT 4000 or relative url since they are proxying
      // The gateway is running at http://localhost:4000
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: cleanedPhone,
          role: selectedRole,
          coverLetter: formData.coverLetter.trim(),
          resumeLink: formData.resumeLink.trim()
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || (isHindi ? 'आवेदन जमा करने में विफल।' : 'Failed to submit application.'));
      }

      setMessage({ text: isHindi ? 'आपका आवेदन सफलतापूर्वक जमा हो गया है! धन्यवाद।' : 'Your application was submitted successfully! Thank you.', type: 'success' });
      
      // Close modal after brief timeout
      setTimeout(() => {
        setModalOpen(false);
      }, 2500);

    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tableos-landing min-h-screen flex flex-col justify-between bg-[#080808] text-[#F5F0EB] relative">
      <div className="noise-overlay"></div>
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(212,146,10,0.03)] blur-[100px] pointer-events-none"></div>
      
      <Nav />
      <FloatingWhatsApp />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="max-w-4xl mx-auto space-y-12 text-left">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase block">
              {isHindi ? "हमारे साथ काम करें" : "Careers"}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-[#F5F0EB] leading-tight">
              {isHindi ? "भोजन तकनीक के भविष्य का निर्माण करें।" : "Shape the future of dining technology."}
            </h1>
            <p className="text-[rgba(245,240,235,0.7)] text-lg md:text-xl font-light leading-relaxed">
              {isHindi
                ? "Bhoj360 में, हम आतिथ्य क्षेत्र के सबसे जटिल परिचालन मुद्दों को हल करने के लिए समर्पित हैं। हमारे मिशन में शामिल हों और हमारी बिक्री या तकनीकी टीम का हिस्सा बनें।"
                : "Join a fast-growing, mission-driven team dedicated to simplifying operations and building beautiful software tools for restaurants globally."
              }
            </p>
          </div>

          <hr className="border-white/10" />

          {/* Jobs List */}
          <div className="space-y-6 pt-4">
            <h2 className="text-2xl font-serif text-[#F5F0EB]">
              {isHindi ? "खुली भूमिकाएँ" : "Open Opportunities"}
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job, idx) => (
                <div key={idx} className="glass-card-dark rounded-2xl p-6 border border-white/5 bg-black/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-amber-500/20 transition-all duration-300">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[9px] font-mono text-[var(--color-amber)] border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                        {job.dept}
                      </span>
                      <span className="text-xs text-[rgba(245,240,235,0.4)] font-mono">
                        {job.location}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif text-[#F5F0EB]">{job.title}</h3>
                    <p className="text-xs text-[rgba(245,240,235,0.65)] font-light leading-relaxed">
                      {job.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenModal(job.title)}
                    className="px-6 py-2.5 rounded bg-[var(--color-amber)] text-black font-semibold text-xs transition-all hover:bg-[var(--color-amber-light)] active:scale-95 whitespace-nowrap shrink-0"
                  >
                    {isHindi ? "आवेदन करें" : "Apply Now"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Application Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card-dark max-w-lg w-full rounded-2xl border border-white/10 bg-[#0e0e0e] p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[rgba(245,240,235,0.5)] hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-1 text-left">
              <h3 className="text-2xl font-serif text-[#F5F0EB]">
                {isHindi ? "नौकरी आवेदन" : "Job Application"}
              </h3>
              <p className="text-xs text-[var(--color-amber)] font-mono">
                {isHindi ? `भूमिका: ${selectedRole}` : `Applying for: ${selectedRole}`}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[rgba(245,240,235,0.5)] uppercase">
                  {isHindi ? "आपका नाम *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded px-4 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[var(--color-amber)]"
                  placeholder="Aman Sharma"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[rgba(245,240,235,0.5)] uppercase">
                  {isHindi ? "ईमेल पता *" : "Email Address *"}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded px-4 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[var(--color-amber)]"
                  placeholder="aman@example.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[rgba(245,240,235,0.5)] uppercase">
                  {isHindi ? "मोबाइल नंबर (10 अंक) *" : "Mobile Number (10 digits) *"}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded px-4 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[var(--color-amber)]"
                  placeholder="8299443154"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[rgba(245,240,235,0.5)] uppercase">
                  {isHindi ? "बायो / कवर लेटर" : "Cover Letter / Notes"}
                </label>
                <textarea
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-black/60 border border-white/10 rounded px-4 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[var(--color-amber)] resize-none"
                  placeholder={isHindi ? "अपने अनुभव के बारे में बताएं..." : "Describe your experience and motivation..."}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[rgba(245,240,235,0.5)] uppercase">
                  {isHindi ? "रेज़्यूमे / सीवी लिंक" : "Resume / CV Link"}
                </label>
                <input
                  type="url"
                  name="resumeLink"
                  value={formData.resumeLink}
                  onChange={handleInputChange}
                  className="w-full bg-black/60 border border-white/10 rounded px-4 py-2.5 text-sm text-[#F5F0EB] focus:outline-none focus:border-[var(--color-amber)]"
                  placeholder="https://drive.google.com/file/..."
                />
              </div>

              {message.text && (
                <div className={`p-3 rounded text-xs font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full shimmer-btn py-3 rounded bg-[var(--color-amber)] text-black font-semibold text-sm transition-all hover:bg-[var(--color-amber-light)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (isHindi ? 'भेजा जा रहा है...' : 'Submitting...') : (isHindi ? 'आवेदन जमा करें' : 'Submit Application')}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
