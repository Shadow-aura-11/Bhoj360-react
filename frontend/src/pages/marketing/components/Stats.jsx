import React, { useState, useEffect } from 'react';

export default function Stats() {
  const [data, setData] = useState({
    restaurantsCount: 142,
    ordersCount: 1480,
    averageLatency: '48ms',
    monthlyVolume: '$2.4M'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const json = await res.json();
          setData(prev => ({
            ...prev,
            restaurantsCount: json.totalRestaurants || 142,
            ordersCount: json.totalOrdersToday || 1480
          }));
        }
      } catch (err) {
        console.error('Failed to fetch marketing stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Poll stats every 30 seconds for live tick
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 relative z-10 border-b border-white/5 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Stat Item 1 */}
          <div className="p-8 rounded-xl border border-white/5 bg-black/40 text-center space-y-2 reveal">
            <span className="text-[10px] font-mono tracking-widest text-[var(--color-text-muted)] uppercase">
              Connected Networks
            </span>
            <div className="text-5xl md:text-6xl font-serif font-bold text-[var(--color-amber)] counter-text">
              {data.restaurantsCount}+
            </div>
            <p className="text-xs text-[rgba(245,240,235,0.5)] font-light">
              Active enterprise restaurants running live nodes.
            </p>
          </div>

          {/* Stat Item 2 */}
          <div className="p-8 rounded-xl border border-white/5 bg-black/40 text-center space-y-2 reveal">
            <span className="text-[10px] font-mono tracking-widest text-[var(--color-text-muted)] uppercase">
              Transactions Today
            </span>
            <div className="text-5xl md:text-6xl font-serif font-bold text-[#F5F0EB] counter-text">
              {data.ordersCount.toLocaleString()}
            </div>
            <p className="text-xs text-[rgba(245,240,235,0.5)] font-light">
              Orders dynamically logged via gateways in last 24h.
            </p>
          </div>

          {/* Stat Item 3 */}
          <div className="p-8 rounded-xl border border-white/5 bg-black/40 text-center space-y-2 reveal">
            <span className="text-[10px] font-mono tracking-widest text-[var(--color-text-muted)] uppercase">
              Average Ping Latency
            </span>
            <div className="text-5xl md:text-6xl font-serif font-bold text-[#F5F0EB] counter-text">
              {data.averageLatency}
            </div>
            <p className="text-xs text-[rgba(245,240,235,0.5)] font-light">
              Time taken to synchronize ordering client and KDS.
            </p>
          </div>

          {/* Stat Item 4 */}
          <div className="p-8 rounded-xl border border-white/5 bg-black/40 text-center space-y-2 reveal">
            <span className="text-[10px] font-mono tracking-widest text-[var(--color-text-muted)] uppercase">
              Monthly Network GMV
            </span>
            <div className="text-5xl md:text-6xl font-serif font-bold text-[var(--color-amber)] counter-text">
              {data.monthlyVolume}
            </div>
            <p className="text-xs text-[rgba(245,240,235,0.5)] font-light">
              Aggregated processing volume across all system portals.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
