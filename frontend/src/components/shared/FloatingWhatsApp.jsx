import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function FloatingWhatsApp() {
  // Agency WhatsApp number: +91 8299443154
  const whatsappUrl = "https://wa.me/918299443154?text=Hello%20Bhoj360%20Team%2C%20I%20am%20interested%20in%20your%20services.%20Please%20guide%20me.";
  
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-3.5 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
      title="Chat with us on WhatsApp"
    >
      {/* WhatsApp Message icon */}
      <MessageSquare className="w-5 h-5 fill-current animate-pulse" />
      <span className="text-xs font-bold tracking-wide">
        Chat with us
      </span>
    </a>
  );
}
