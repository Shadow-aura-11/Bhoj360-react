import React from 'react';

export default function Testimonials() {
  const reviews = [
    {
      quote: "TableOS has completely transformed our double-service. The waiter call sync and kitchen display integration saved us over 8 minutes of delay per course. It is an absolute operational masterpiece.",
      author: "Chef Jean-Louis Granger",
      role: "Culinary Director, Maison d'Amour Group",
      stars: 5
    },
    {
      quote: "Managing 12 separate fine-dining locations was an administrative nightmare until we unified under TableOS. The node provisioning speed and aggregated group audits are completely unparalleled.",
      author: "Victoria Sterling",
      role: "Managing Director, Aether Hospitality Group",
      stars: 5
    },
    {
      quote: "Our guest self-ordering volume jumped by 32% since we deployed the TableOS dynamic QR codes. The client layout is beautiful, lightning fast, and requires zero user app installations.",
      author: "Marcus Thorne",
      role: "Owner, Onyx Steakhouse Concepts",
      stars: 5
    }
  ];

  return (
    <section className="py-32 relative z-10 border-b border-white/5 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="max-w-3xl text-left mb-20 space-y-4">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase">
            Acclaimed Credentials
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#F5F0EB]">
            Trusted by the world's most demanding operators.
          </h2>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div 
              key={idx} 
              className="glass-card-dark rounded-xl p-8 border-white/5 flex flex-col justify-between relative overflow-hidden group reveal"
            >
              {/* Quote icon watermark decoration */}
              <span className="absolute top-4 right-6 text-9xl font-serif text-white/[0.02] pointer-events-none select-none select-none">
                “
              </span>

              <div className="space-y-6 relative z-10">
                {/* 5-star rating SVG */}
                <div className="flex gap-1">
                  {Array.from({ length: rev.stars }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[var(--color-amber)]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-base text-[#F5F0EB]/90 font-serif italic leading-relaxed">
                  "{rev.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="border-t border-white/5 pt-6 mt-8 relative z-10 text-left">
                <h4 className="font-serif font-semibold text-[#F5F0EB] text-sm">
                  {rev.author}
                </h4>
                <p className="text-[10px] font-mono text-[var(--color-amber)] tracking-wider mt-1 uppercase">
                  {rev.role}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
