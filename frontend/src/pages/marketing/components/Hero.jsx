import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Hero({ onWatchDemo }) {
  // Simulator state
  const [tables, setTables] = useState([
    { id: 1, type: 'circle', x: 80, y: 70, r: 24, status: 'occupied', guests: 3, label: 'T-1' },
    { id: 2, type: 'rect', x: 190, y: 46, w: 48, h: 48, status: 'available', guests: 0, label: 'T-2' },
    { id: 3, type: 'circle', x: 310, y: 70, r: 24, status: 'reserved', guests: 2, label: 'T-3' },
    { id: 4, type: 'rect', x: 70, y: 170, w: 60, h: 40, status: 'occupied', guests: 4, label: 'T-4' },
    { id: 5, type: 'circle', x: 200, y: 190, r: 28, status: 'available', guests: 0, label: 'T-5' },
    { id: 6, type: 'rect', x: 300, y: 170, w: 60, h: 40, status: 'occupied', guests: 5, label: 'T-6' },
  ]);

  const [logs, setLogs] = useState([
    { id: 1, time: '14:42', text: 'Table 4 ordered Black Truffle Tagliatelle' },
    { id: 2, time: '14:44', text: 'Table 1 check settled ($342.50)' },
    { id: 3, time: '14:45', text: 'Table 3 reservation seated (Mr. Sterling)' }
  ]);

  const [simStats, setSimStats] = useState({
    occupancy: '66%',
    revenueToday: '$14,820',
    activeServers: '8 On Shift'
  });

  // Simple simulator loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random table
      const randIdx = Math.floor(Math.random() * tables.length);
      const targetTable = tables[randIdx];
      
      let nextStatus = 'available';
      let nextGuests = 0;
      let logMsg = '';

      if (targetTable.status === 'available') {
        nextStatus = 'occupied';
        nextGuests = Math.floor(Math.random() * 4) + 1;
        logMsg = `Table ${targetTable.id} is now seated (${nextGuests} guests)`;
      } else if (targetTable.status === 'occupied') {
        // either reserve it or free it
        if (Math.random() > 0.5) {
          nextStatus = 'reserved';
          nextGuests = 2;
          logMsg = `Table ${targetTable.id} reserved for 18:30 seating`;
        } else {
          nextStatus = 'available';
          nextGuests = 0;
          const bills = [124, 210, 85, 345, 190];
          const billAmt = bills[Math.floor(Math.random() * bills.length)];
          logMsg = `Table ${targetTable.id} cleared. Bill settled: $${billAmt}.00`;
        }
      } else {
        // reserved to occupied
        nextStatus = 'occupied';
        nextGuests = 2;
        logMsg = `Reservation check-in: Table ${targetTable.id} seated`;
      }

      // Update tables
      setTables(prev => prev.map((t, idx) => idx === randIdx ? { ...t, status: nextStatus, guests: nextGuests } : t));

      // Update log
      const timeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);
      setLogs(prev => [
        { id: Date.now(), time: timeStr, text: logMsg },
        ...prev.slice(0, 2)
      ]);

      // Randomly update revenue
      setSimStats(prev => {
        const numericRev = parseInt(prev.revenueToday.replace(/[^0-9]/g, ''));
        const gain = Math.random() > 0.6 ? Math.floor(Math.random() * 150) + 50 : 0;
        const nextRev = numericRev + gain;
        
        // Calculate occupancy
        const active = tables.filter(t => t.status === 'occupied').length;
        const newOccupancy = Math.round((active / tables.length) * 100) + '%';

        return {
          ...prev,
          occupancy: newOccupancy,
          revenueToday: `$${nextRev.toLocaleString()}`
        };
      });

    }, 5000);

    return () => clearInterval(interval);
  }, [tables]);

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background aesthetics */}
      <div className="bg-grid-pattern"></div>
      <div className="bg-gradient-glow"></div>
      
      {/* Dynamic Floating Ambient Circles */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-[rgba(212,146,10,0.04)] blur-[100px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] rounded-full bg-[rgba(255,255,255,0.01)] blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Premium Copy */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Elegant luxury tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500/90 text-xs font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)] animate-ping"></span>
              The Hospitality Standard
            </div>

            {/* Display Headline H1 */}
            <h1 className="text-5xl md:text-7xl font-serif text-[#F5F0EB] leading-[1.08] tracking-tight">
              The Fine-Dining <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-amber)] to-amber-200 italic font-serif">
                Operating System
              </span>
            </h1>

            {/* Paragraph Body Satoshi */}
            <p className="text-lg md:text-xl text-[rgba(245,240,235,0.7)] font-light max-w-xl leading-relaxed">
              Coordinatively synchronize table seating, waiter dispatch routing, live reservation books, and instant service-flow analytics across your luxury multi-restaurant group. Elegant by design. Uncompromisingly precise.
            </p>

            {/* Premium CTA Buttons */}
            <div className="flex flex-wrap gap-4 items-center">
              <Link
                to="/app"
                className="shimmer-btn px-8 py-4 rounded bg-[var(--color-amber)] text-black font-semibold text-base transition-all hover:bg-[var(--color-amber-light)] active:scale-95 shadow-[0_4px_20px_rgba(212,146,10,0.25)] flex items-center gap-3"
              >
                Access System Console
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              
              <button
                onClick={onWatchDemo}
                className="px-8 py-4 rounded border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-[#F5F0EB] font-medium text-base transition-all active:scale-95 flex items-center gap-3"
              >
                <span>Watch Platform Flow</span>
                <div className="w-6 h-6 rounded-full bg-[var(--color-amber)]/20 flex items-center justify-center text-[var(--color-amber)]">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Trust / Features Grid Badges */}
            <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-serif font-bold text-[#F5F0EB]">142+</div>
                <div className="text-[11px] font-mono tracking-wider text-[var(--color-text-muted)] uppercase mt-1">Active Outlets</div>
              </div>
              <div>
                <div className="text-3xl font-serif font-bold text-[#F5F0EB]">99.99%</div>
                <div className="text-[11px] font-mono tracking-wider text-[var(--color-text-muted)] uppercase mt-1">Gateway Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-serif font-bold text-[#F5F0EB]">&lt;100ms</div>
                <div className="text-[11px] font-mono tracking-wider text-[var(--color-text-muted)] uppercase mt-1">Sync Latency</div>
              </div>
            </div>

          </div>

          {/* Right Column: Live Simulator Frame */}
          <div className="lg:col-span-5 relative w-full flex justify-center">
            <div className="relative w-full max-w-[460px] glass-card-dark rounded-2xl p-6 border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
              
              {/* Simulator Card Header */}
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#F5F0EB]/90">Live Seating Network</span>
                </div>
                <span className="text-xs font-mono text-[var(--color-amber)]">OUTLET #3101</span>
              </div>

              {/* Dynamic stats row */}
              <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                <div className="bg-black/40 border border-white/5 rounded-lg py-2.5">
                  <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">Occupancy</div>
                  <div className="text-sm font-semibold font-mono text-emerald-400 mt-0.5">{simStats.occupancy}</div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-lg py-2.5">
                  <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">Today's Rev</div>
                  <div className="text-sm font-semibold font-mono text-[#F5F0EB] mt-0.5">{simStats.revenueToday}</div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-lg py-2.5">
                  <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase">Staff</div>
                  <div className="text-sm font-semibold font-mono text-[var(--color-amber)] mt-0.5">{simStats.activeServers}</div>
                </div>
              </div>

              {/* Floor Plan Grid Drawing */}
              <div className="relative border border-white/5 bg-black/80 rounded-xl p-4 overflow-hidden mb-6 flex justify-center">
                <svg width="380" height="260" viewBox="0 0 380 260" className="w-full h-auto">
                  {/* Decorative Floor Grid Line Details */}
                  <defs>
                    <pattern id="floor-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <rect width="20" height="20" fill="none" />
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#floor-grid)" />

                  {/* Room Boundary Walls (subtle luxury stroke) */}
                  <rect x="5" y="5" width="370" height="250" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Render Simulator Tables */}
                  {tables.map((t) => {
                    const statusColor = t.status === 'occupied' 
                      ? 'rgba(212,146,10,0.1)' 
                      : (t.status === 'reserved' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.05)');
                    const strokeColor = t.status === 'occupied' 
                      ? 'var(--color-amber)' 
                      : (t.status === 'reserved' ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.4)');

                    return (
                      <g key={t.id} className="grid-table">
                        {t.type === 'circle' ? (
                          <>
                            <circle 
                              cx={t.x} 
                              cy={t.y} 
                              r={t.r} 
                              fill={statusColor} 
                              stroke={strokeColor} 
                              strokeWidth="1.5" 
                              className="transition-all duration-700" 
                            />
                            {/* Inner ambient ring */}
                            <circle cx={t.x} cy={t.y} r={t.r - 5} fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.3" />
                          </>
                        ) : (
                          <>
                            <rect 
                              x={t.x} 
                              y={t.y} 
                              width={t.w} 
                              height={t.h} 
                              rx="6"
                              fill={statusColor} 
                              stroke={strokeColor} 
                              strokeWidth="1.5"
                              className="transition-all duration-700" 
                            />
                            {/* Inner ambient rect */}
                            <rect x={t.x + 4} y={t.y + 4} width={t.w - 8} height={t.h - 8} rx="3" fill="none" stroke={strokeColor} strokeWidth="0.5" opacity="0.3" />
                          </>
                        )}

                        {/* Guests representation (little seats around table) */}
                        {t.status === 'occupied' && (
                          <g opacity="0.8">
                            {Array.from({ length: t.guests }).map((_, i) => {
                              const angle = (i * 2 * Math.PI) / t.guests;
                              const offset = t.type === 'circle' ? t.r + 5 : 22;
                              const seatX = t.x + (t.type === 'circle' ? 0 : t.w/2) + Math.cos(angle) * offset - (t.type === 'circle' ? 0 : t.w/2);
                              const seatY = t.y + (t.type === 'circle' ? 0 : t.h/2) + Math.sin(angle) * offset - (t.type === 'circle' ? 0 : t.h/2);
                              return (
                                <circle 
                                  key={i} 
                                  cx={seatX} 
                                  cy={seatY} 
                                  r="3" 
                                  fill="var(--color-amber)" 
                                  className="animate-pulse" 
                                />
                              );
                            })}
                          </g>
                        )}

                        {/* Table text labels */}
                        <text 
                          x={t.type === 'circle' ? t.x : t.x + t.w/2} 
                          y={t.type === 'circle' ? t.y + 4 : t.y + t.h/2 + 4} 
                          fill="#F5F0EB" 
                          fontSize="9" 
                          fontFamily="var(--font-mono)"
                          textAnchor="middle" 
                          opacity="0.85"
                        >
                          {t.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Console log of events */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-2 border-b border-white/5 pb-1 text-left">
                  System Dispatch Events
                </div>
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs text-left leading-relaxed animate-fadeIn">
                    <span className="font-mono text-[var(--color-amber)] opacity-70 shrink-0">{log.time}</span>
                    <span className="text-[#F5F0EB]/85 font-light font-mono truncate">{log.text}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
