import React from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Pricing from './components/Pricing';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';

export default function PricingPage() {
  return (
    <div className="tableos-landing min-h-screen flex flex-col justify-between bg-[#080808] text-[#F5F0EB] relative">
      <div className="noise-overlay"></div>
      
      <Nav />
      <FloatingWhatsApp />

      <main className="flex-grow">
        {/* Render the standard marketing pricing component inside the page shell */}
        <Pricing />
      </main>

      <Footer />
    </div>
  );
}
