import React, { useState, useEffect } from 'react';

export default function DemoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      title: "Step 1: Guest Ordering",
      role: "CUSTOMER VIEW",
      desc: "A patron scans the table QR code and places an order for a dry-aged Wagyu Steak and cocktail. The selection registers instantly without requiring account creation.",
      mockup: (
        <div className="space-y-4 max-w-xs mx-auto bg-[#0a0a0a] border border-amber-500/20 rounded-[2rem] p-5 shadow-2xl relative">
          <div className="pt-2 flex justify-between items-center mb-3 border-b border-white/5 pb-2">
            <div className="text-[10px] font-mono text-[var(--color-amber)]">SAGE & SMOKE</div>
            <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#F5F0EB]/80">Table 4</span>
          </div>
          <div className="bg-[#111111] p-3 rounded-lg border border-white/10 text-left space-y-2">
            <div className="text-xs font-serif text-[#F5F0EB]">Wagyu Ribeye Steak (1x)</div>
            <div className="text-[9px] text-[var(--color-text-muted)]">Medium Rare, Chimichurri</div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
              <span className="font-mono text-xs text-[var(--color-amber)]">$95.00</span>
              <span className="text-[9px] font-mono text-emerald-400">✓ Adding to Order...</span>
            </div>
          </div>
          <div className="w-full py-3 bg-[var(--color-amber)] text-black font-bold text-xs rounded-lg text-center animate-pulse">
            Submitting to Kitchen...
          </div>
        </div>
      )
    },
    {
      title: "Step 2: Kitchen KDS Pipeline",
      role: "CHEF DISPLAY",
      desc: "The Wagyu order hits the Kitchen Display System (KDS) immediately. Chefs see the table number, preparation preferences, and a cooking timer ticking down.",
      mockup: (
        <div className="space-y-4 bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl text-left">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="font-bold text-red-400 text-xs">HOT TICKET #401</span>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-red-500/15 text-red-400">ACTIVE: 1m 08s</span>
          </div>
          <div className="space-y-2 text-[#F5F0EB]/90">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-lg">1x Wagyu Ribeye Steak</span>
              <span className="text-red-400 font-bold font-mono">STAGE 1</span>
            </div>
            <div className="pl-4 text-[10px] text-[var(--color-text-muted)]">
              - Doneness: Medium Rare<br />
              - Sauce: Chimichurri
            </div>
          </div>
          <div className="pt-2">
            <div className="w-full bg-[#181818] h-1.5 rounded-full overflow-hidden mb-3">
              <div className="bg-amber-500 h-full animate-pulse" style={{ width: '45%' }}></div>
            </div>
            <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs uppercase tracking-wider">
              Mark Cooked & Ready
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Step 3: Waiter Dispatch Alert",
      role: "SERVER MONITOR",
      desc: "Once marked cooked, TableOS alerts the waiter assigned to Table 4. Their mobile screen illuminates with visual routing guides and auditory alerts.",
      mockup: (
        <div className="space-y-4 max-w-sm mx-auto bg-[#0e0e0e] border border-white/10 rounded-2xl p-5 shadow-2xl text-left">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="font-semibold text-[#F5F0EB]">Waiter Station #3</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[var(--color-amber)] text-[8px] font-mono">ALERT</span>
          </div>
          <div className="bg-amber-500/10 border border-[var(--color-amber)] p-4 rounded-xl space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-amber)]/20 flex items-center justify-center text-[var(--color-amber)] font-bold text-xs shrink-0 animate-ping">
                🔔
              </div>
              <div>
                <h5 className="font-bold text-[var(--color-amber)] text-xs">FOOD RUNNER ALERT</h5>
                <p className="text-[10px] text-[#F5F0EB]/90 mt-0.5">Table 4: 1x Wagyu Ribeye Steak is ready at Pass 1.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-1.5 bg-[var(--color-amber)] text-black font-semibold rounded text-[10px] uppercase text-center">
                Accept Call
              </button>
              <button className="px-3 py-1.5 border border-white/10 text-[#F5F0EB] text-[10px] rounded hover:bg-white/5">
                Delegate
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Step 4: Cashier Receipt Settlement",
      role: "CASHIER SYSTEM",
      desc: "Guests request checkout via their QR interface. The cashier terminal updates immediately, printing audited itemised receipts and logging payments.",
      mockup: (
        <div className="space-y-4 bg-[#111111] border border-white/10 rounded-xl p-5 shadow-2xl text-left font-mono">
          <div className="text-center border-b border-dashed border-white/10 pb-3">
            <div className="text-xs font-serif font-bold text-[#F5F0EB] not-italic">SAGE & SMOKE</div>
            <div className="text-[9px] text-[var(--color-text-muted)]">RECEIPT: #94031</div>
          </div>
          <div className="space-y-1.5 text-[10px] text-[#F5F0EB]/90">
            <div className="flex justify-between">
              <span>1x Wagyu Ribeye Steak</span>
              <span>$95.00</span>
            </div>
            <div className="flex justify-between">
              <span>1x Smoked Mezcal Sour</span>
              <span>$18.00</span>
            </div>
            <div className="flex justify-between">
              <span>1x Roasted Heirloom Carrots</span>
              <span>$14.00</span>
            </div>
            <div className="border-t border-dashed border-white/10 my-2"></div>
            <div className="flex justify-between font-bold text-xs text-[var(--color-amber)]">
              <span>TOTAL SETTLED</span>
              <span>$127.00</span>
            </div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center py-2 rounded text-[10px] font-bold">
            PAID VIA APPLE PAY (TRANS ID: TX-8490)
          </div>
        </div>
      )
    },
    {
      title: "Step 5: Corporate Aggregator",
      role: "ADMIN ANALYTICS",
      desc: "All transactions route directly to the parent agency analytics server. Group operators check consolidated revenues, table performance metrics, and outlet traffic volumes.",
      mockup: (
        <div className="space-y-4 bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl text-left">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">Aggregated Live GMV</span>
              <h4 className="text-xl font-mono font-bold text-emerald-400 mt-0.5">$184,392.50</h4>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
              ▲ 18.4% Live Growth
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
            <div className="bg-black/50 border border-white/5 p-2 rounded">
              <span className="text-[8px] text-[var(--color-text-muted)] font-mono uppercase">Sage & Smoke</span>
              <div className="font-bold text-[#F5F0EB] mt-0.5">$48,290</div>
            </div>
            <div className="bg-black/50 border border-white/5 p-2 rounded">
              <span className="text-[8px] text-[var(--color-text-muted)] font-mono uppercase">Maison Amour</span>
              <div className="font-bold text-[#F5F0EB] mt-0.5">$62,190</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-[9px] font-mono flex justify-between items-center">
            <span>AUDIT COMPLETED: 14:48:32</span>
            <span className="text-[var(--color-amber)]">PRINT STATUS: SUCCESS</span>
          </div>
        </div>
      )
    }
  ];

  // Auto-play steps loop
  useEffect(() => {
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setCurrentStep(s => (s + 1) % steps.length);
          return 0;
        }
        return p + 2; // Increments by 2% every 100ms (5 seconds total per step)
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentStep]);

  const handleStepSelect = (idx) => {
    setCurrentStep(idx);
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6 transition-all duration-300">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#090909] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-auto max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-[#F5F0EB] hover:text-[var(--color-amber)] hover:border-[var(--color-amber)] transition-colors active:scale-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left Side: Mockup Visual Representation */}
        <div className="flex-1 bg-black p-8 md:p-12 flex items-center justify-center border-r border-white/5 relative min-h-[360px] lg:min-h-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-60"></div>
          <div className="relative z-10 w-full flex justify-center">
            {steps[currentStep].mockup}
          </div>
        </div>

        {/* Right Side: Step Explanations & Controls */}
        <div className="w-full lg:w-[420px] p-8 md:p-10 flex flex-col justify-between bg-[#0a0a0a] text-left">
          
          <div className="space-y-6">
            
            {/* Step indicators */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStepSelect(idx)}
                  className="flex-grow h-1.5 rounded-full overflow-hidden bg-white/10 focus:outline-none"
                >
                  <div 
                    className="h-full bg-[var(--color-amber)] transition-all duration-100"
                    style={{
                      width: idx === currentStep ? `${progress}%` : (idx < currentStep ? '100%' : '0%'),
                      transition: idx === currentStep ? 'none' : 'width 0.3s ease'
                    }}
                  ></div>
                </button>
              ))}
            </div>

            {/* Role / Step Tag */}
            <span className="text-[10px] font-mono tracking-widest text-[var(--color-amber)] uppercase block">
              {steps[currentStep].role} — STEP {currentStep + 1} OF 5
            </span>

            {/* Title */}
            <h3 className="text-2xl md:text-3xl font-serif text-[#F5F0EB] tracking-tight leading-tight">
              {steps[currentStep].title}
            </h3>

            {/* Description */}
            <p className="text-sm text-[rgba(245,240,235,0.7)] font-light leading-relaxed">
              {steps[currentStep].desc}
            </p>
          </div>

          {/* Controls Footer */}
          <div className="flex justify-between items-center pt-8 border-t border-white/5 mt-8">
            <div className="flex gap-2">
              <button
                onClick={() => handleStepSelect((currentStep - 1 + steps.length) % steps.length)}
                className="w-10 h-10 rounded border border-white/10 bg-white/5 flex items-center justify-center text-[#F5F0EB] hover:bg-white/10 active:scale-95 transition-all"
              >
                ←
              </button>
              <button
                onClick={() => handleStepSelect((currentStep + 1) % steps.length)}
                className="w-10 h-10 rounded border border-white/10 bg-white/5 flex items-center justify-center text-[#F5F0EB] hover:bg-white/10 active:scale-95 transition-all"
              >
                →
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="px-6 py-2 rounded bg-[var(--color-amber)] hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider"
            >
              Exit Demo
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
