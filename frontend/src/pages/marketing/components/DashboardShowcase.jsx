import React, { useState } from 'react';

export default function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState('admin');

  const tabs = [
    { id: 'admin', label: 'Admin Controller', desc: 'Manage tables, configure menu pricing, deploy live staff permissions, and inspect outlet-wide analytics.' },
    { id: 'waiter', label: 'Waiter Dispatch', desc: 'Mobile terminal for waitstaff. View table call states, register orders directly, and receive kitchen alerts.' },
    { id: 'kitchen', label: 'Kitchen & Counter', desc: 'Display active table orders instantly, sort by preparation urgency, and ping waitstaff on completion.' },
    { id: 'guest', label: 'Guest Self-Order', desc: 'QR-enabled digital menu. Let patrons browse dishes, order items, and request checkout from their personal phones.' }
  ];

  return (
    <section id="showcase" className="py-32 relative z-10 border-b border-white/5 bg-[#070707]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-20">
          <div className="lg:col-span-8 space-y-4 text-left">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase">
              Operational Interfaces
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#F5F0EB]">
              Complete synchronization from lounge to kitchen.
            </h2>
          </div>
          <div className="lg:col-span-4 text-left lg:text-right">
            <p className="text-[rgba(245,240,235,0.65)] font-light text-sm max-w-sm">
              Explore the dedicated interfaces customized for each role in your restaurant team.
            </p>
          </div>
        </div>

        {/* Responsive Tabs Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Tabs Column */}
          <div className="lg:col-span-4 space-y-4 text-left">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-6 rounded-xl transition-all duration-300 border ${activeTab === tab.id ? 'border-[var(--color-amber)] bg-[rgba(212,146,10,0.04)] shadow-lg' : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`text-lg font-serif font-medium transition-colors ${activeTab === tab.id ? 'text-[var(--color-amber)]' : 'text-[#F5F0EB]'}`}>
                    {tab.label}
                  </h3>
                  {activeTab === tab.id && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-amber)] animate-pulse"></span>
                  )}
                </div>
                <p className="text-xs text-[rgba(245,240,235,0.55)] font-light leading-relaxed">
                  {tab.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Browser Simulator Column */}
          <div className="lg:col-span-8">
            <div className="browser-chrome border-glow-amber">
              {/* Fake Chrome Header */}
              <div className="browser-header">
                <div className="flex gap-2">
                  <span className="dot-red"></span>
                  <span className="dot-yellow"></span>
                  <span className="dot-green"></span>
                </div>
                <div className="browser-address">
                  {activeTab === 'admin' && 'https://bhoj360.com/outlet/3101/admin'}
                  {activeTab === 'waiter' && 'https://bhoj360.com/outlet/3101/waiter'}
                  {activeTab === 'kitchen' && 'https://bhoj360.com/outlet/3101/kitchen'}
                  {activeTab === 'guest' && 'https://bhoj360.com/r/outlet_3101/menu'}
                </div>
                <div className="w-12"></div>
              </div>

              {/* Mock Screen Content */}
              <div className="p-6 md:p-8 bg-[#090909] min-h-[420px] text-left font-sans text-xs relative overflow-hidden transition-all duration-500">
                
                {/* ─── ADMIN MOCK ─── */}
                {activeTab === 'admin' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div>
                        <h4 className="text-base font-serif font-semibold text-[#F5F0EB]">Outlet Analytics Summary</h4>
                        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">Live Data Feed</span>
                      </div>
                      <span className="px-2 py-1 rounded bg-[var(--color-amber)]/10 text-[var(--color-amber)] font-mono text-[9px] uppercase tracking-wider">Sync State OK</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Grid cards */}
                      <div className="bg-[#111111] p-4 rounded-lg border border-white/5">
                        <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">Sales Target Status</span>
                        <div className="text-lg font-mono font-bold text-[#F5F0EB] mt-1">$14,820</div>
                        <div className="text-[9px] text-emerald-400 mt-1">▲ 14.2% vs Yesterday</div>
                      </div>
                      <div className="bg-[#111111] p-4 rounded-lg border border-white/5">
                        <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">Table Turnover Index</span>
                        <div className="text-lg font-mono font-bold text-[#F5F0EB] mt-1">42 mins</div>
                        <div className="text-[9px] text-amber-400 mt-1">● Optimal flow speed</div>
                      </div>
                      <div className="bg-[#111111] p-4 rounded-lg border border-white/5">
                        <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase">Total Orders Inflow</span>
                        <div className="text-lg font-mono font-bold text-[#F5F0EB] mt-1">118 today</div>
                        <div className="text-[9px] text-[#F5F0EB]/60 mt-1">0 pending dispatch</div>
                      </div>
                    </div>

                    {/* SVG analytics chart */}
                    <div className="bg-[#111111] p-4 rounded-lg border border-white/5">
                      <span className="text-[9px] font-mono text-[var(--color-text-muted)] uppercase block mb-3">Order Frequency Load curve</span>
                      <svg viewBox="0 0 500 100" width="100%" height="80" className="w-full h-auto">
                        <path d="M 0 80 Q 80 50 160 20 T 320 60 T 480 10 L 500 10 L 500 100 L 0 100 Z" fill="rgba(212, 146, 10, 0.05)" />
                        <path d="M 0 80 Q 80 50 160 20 T 320 60 T 480 10" fill="none" stroke="var(--color-amber)" strokeWidth="1.5" />
                        <circle cx="160" cy="20" r="4" fill="var(--color-amber)" />
                        <text x="160" y="10" fill="#F5F0EB" fontSize="8" fontFamily="monospace" textAnchor="middle">Peak (13:00)</text>
                      </svg>
                    </div>
                  </div>
                )}

                {/* ─── WAITER MOCK ─── */}
                {activeTab === 'waiter' && (
                  <div className="space-y-4 max-w-sm mx-auto bg-[#0e0e0e] border border-white/10 rounded-2xl p-5 shadow-2xl animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-[var(--color-amber)] font-bold text-[10px]">W</div>
                        <div>
                          <div className="font-semibold text-[#F5F0EB]">Waiter Panel</div>
                          <div className="text-[8px] font-mono text-[var(--color-text-muted)]">STAFF: MARCUS V.</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[8px] uppercase">Active</span>
                    </div>

                    {/* Table notifications list */}
                    <div className="space-y-2.5">
                      <div className="bg-[#181818] p-3 rounded-lg border border-red-500/20 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-red-400 text-xs">Table 4: Call Pressed</div>
                          <span className="text-[8px] font-mono text-red-400/70">WAIT TIME: 2m 14s</span>
                        </div>
                        <button className="px-3 py-1.5 rounded bg-red-600 text-white font-semibold text-[10px] uppercase">Dismiss</button>
                      </div>

                      <div className="bg-[#121212] p-3 rounded-lg border border-white/5 flex justify-between items-center opacity-85">
                        <div>
                          <div className="font-semibold text-[#F5F0EB]">Table 1: Ready to Serve</div>
                          <span className="text-[8px] font-mono text-[var(--color-text-muted)]">Oysters Rockefeller (Ready)</span>
                        </div>
                        <button className="px-3 py-1.5 rounded bg-amber-500 text-black font-semibold text-[10px] uppercase">Served</button>
                      </div>

                      <div className="bg-[#121212] p-3 rounded-lg border border-white/5 flex justify-between items-center opacity-85">
                        <div>
                          <div className="font-semibold text-[#F5F0EB]">Table 7: Payment requested</div>
                          <span className="text-[8px] font-mono text-[var(--color-text-muted)]">Print receipt ($184.00)</span>
                        </div>
                        <button className="px-3 py-1.5 rounded border border-white/10 text-[#F5F0EB] text-[10px] uppercase">Print</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── KITCHEN MOCK ─── */}
                {activeTab === 'kitchen' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div>
                        <h4 className="text-base font-serif font-semibold text-[#F5F0EB]">Kitchen Display Console (KDS)</h4>
                        <span className="text-[10px] font-mono text-amber-500">6 ACTIVE MEALS IN PIPELINE</span>
                      </div>
                      <span className="text-xs font-mono text-[#F5F0EB]/60">OUTLET: MAIN GRILL</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Ticket 1 */}
                      <div className="bg-[#121212] border-t-2 border-red-500 rounded-lg p-4 space-y-3 shadow-md">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#F5F0EB] text-xs">TABLE #4 (T-4)</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">14 MINS AGO</span>
                        </div>
                        <div className="space-y-1 text-[#F5F0EB]/90">
                          <div className="flex justify-between items-center">
                            <span>1x Wagyu Filet Mignon (Medium-Rare)</span>
                            <span className="text-red-400 font-bold">STG-1</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>1x Roasted Heirloom Carrots</span>
                            <span className="text-[9px] text-[var(--color-text-muted)]">Side</span>
                          </div>
                        </div>
                        <button className="w-full py-1.5 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[10px] uppercase tracking-wider transition-colors">
                          Complete & Dispatch
                        </button>
                      </div>

                      {/* Ticket 2 */}
                      <div className="bg-[#121212] border-t-2 border-amber-500 rounded-lg p-4 space-y-3 shadow-md">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#F5F0EB] text-xs">TABLE #3 (T-3)</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">4 MINS AGO</span>
                        </div>
                        <div className="space-y-1 text-[#F5F0EB]/90">
                          <div className="flex justify-between items-center">
                            <span>2x Pan-Seared Chilean Sea Bass</span>
                            <span className="text-amber-400 font-bold">STG-2</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>1x Truffle Fries</span>
                            <span className="text-[9px] text-[var(--color-text-muted)]">Side</span>
                          </div>
                        </div>
                        <button className="w-full py-1.5 mt-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded text-[10px] uppercase tracking-wider transition-colors">
                          Dispatch Meal
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── GUEST MOCK ─── */}
                {activeTab === 'guest' && (
                  <div className="space-y-4 max-w-xs mx-auto bg-[#0a0a0a] border border-amber-500/20 rounded-[2rem] p-5 shadow-2xl relative animate-fadeIn">
                    
                    {/* Phone Notch/Speaker decoration */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-full flex items-center justify-center">
                      <div className="w-8 h-[2px] bg-white/10 rounded-full"></div>
                    </div>

                    <div className="pt-2 flex justify-between items-center mb-3">
                      <div className="text-[10px] font-mono tracking-widest text-[var(--color-amber)]">ONYX DINING</div>
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#F5F0EB]/80">T-8 Seated</span>
                    </div>

                    {/* Guest Menu Showcase Card */}
                    <div className="space-y-3 overflow-y-auto max-h-[300px] scrollbar-thin">
                      <div className="relative rounded-lg overflow-hidden border border-white/5 bg-[#121212] p-2 flex gap-3">
                        {/* Vector graphic of a plate */}
                        <div className="w-16 h-16 rounded bg-[#202020] shrink-0 flex items-center justify-center border border-white/10">
                          <svg className="w-8 h-8 text-[var(--color-amber)] opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="1" />
                            <circle cx="12" cy="12" r="6" strokeWidth="0.5" strokeDasharray="2 2" />
                            <path d="M12 9v6M9 12h6" strokeWidth="1" />
                          </svg>
                        </div>
                        <div className="flex flex-col justify-between py-1 text-left">
                          <div>
                            <div className="font-serif font-semibold text-[#F5F0EB] text-xs">Maine Lobster Thermidor</div>
                            <p className="text-[8px] text-[var(--color-text-muted)] line-clamp-1">Fresh lobster tail, gruyère, cognac mustard.</p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-mono text-xs text-[var(--color-amber)]">$78.00</span>
                            <button className="px-2 py-0.5 bg-[var(--color-amber)] text-black text-[9px] font-bold rounded hover:bg-amber-400">+</button>
                          </div>
                        </div>
                      </div>

                      <div className="relative rounded-lg overflow-hidden border border-white/5 bg-[#121212] p-2 flex gap-3">
                        <div className="w-16 h-16 rounded bg-[#202020] shrink-0 flex items-center justify-center border border-white/10">
                          <svg className="w-8 h-8 text-[var(--color-amber)] opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="1" />
                            <path d="M12 9v6M9 12h6" strokeWidth="1" />
                          </svg>
                        </div>
                        <div className="flex flex-col justify-between py-1 text-left">
                          <div>
                            <div className="font-serif font-semibold text-[#F5F0EB] text-xs">Périgord Truffle Risotto</div>
                            <p className="text-[8px] text-[var(--color-text-muted)] line-clamp-1">Acquerello carnaroli rice, shaved black truffle.</p>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="font-mono text-xs text-[var(--color-amber)]">$64.00</span>
                            <button className="px-2 py-0.5 bg-[var(--color-amber)] text-black text-[9px] font-bold rounded hover:bg-amber-400">+</button>
                          </div>
                        </div>
                      </div>

                      {/* Sticky Checkout Bar inside mobile representation */}
                      <div className="mt-4 border-t border-white/10 pt-3">
                        <div className="flex justify-between text-xs font-semibold text-[#F5F0EB] mb-2">
                          <span>Basket Total (2 items)</span>
                          <span className="font-mono text-[var(--color-amber)]">$142.00</span>
                        </div>
                        <button className="w-full py-2 bg-[var(--color-amber)] hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-colors text-center">
                          Submit Order to Bhoj360
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
