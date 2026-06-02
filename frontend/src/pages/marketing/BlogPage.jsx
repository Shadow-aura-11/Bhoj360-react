import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import { agencyApi } from '../../api/client';
import { useLanguage } from '../../hooks/useLanguage';
import toast from 'react-hot-toast';

export default function BlogPage() {
  const { lang, t } = useLanguage();
  const isHindi = lang === 'hi';
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const { data } = await agencyApi.get('/blogs');
        setBlogs(data || []);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
        toast.error('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="tableos-landing min-h-screen flex flex-col justify-between bg-[#080808] text-[#F5F0EB] relative">
      <div className="noise-overlay"></div>
      <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-[rgba(212,146,10,0.03)] blur-[100px] pointer-events-none"></div>
      
      <Nav />
      <FloatingWhatsApp />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="max-w-4xl mx-auto space-y-12 text-left">
          {/* Header */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase block">
              {isHindi ? "समाचार और विचार" : "Insights & News"}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-[#F5F0EB] leading-tight">
              {isHindi ? "Bhoj360 ब्लॉग" : "The Bhoj360 Blog"}
            </h1>
            <p className="text-[rgba(245,240,235,0.7)] text-lg md:text-xl font-light leading-relaxed">
              {isHindi
                ? "रेस्तरां संचालन, पीओएस नवाचारों और आतिथ्य प्रबंधन से संबंधित लेख पढ़ें।"
                : "Operational strategies, tech design briefs, and industry updates compiled by the Bhoj360 core team."
              }
            </p>
          </div>

          <hr className="border-white/10" />

          {/* Loading / Cards Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 font-mono text-xs">
              Loading posts...
            </div>
          ) : blogs.length === 0 ? (
            <div className="py-20 text-center text-slate-500 rounded-2xl border border-dashed border-white/10 p-8">
              <span className="text-4xl block mb-4">📰</span>
              <p className="text-sm font-semibold">{isHindi ? "कोई लेख उपलब्ध नहीं है" : "No articles published yet"}</p>
              <p className="text-xs text-slate-400 mt-1">
                {isHindi ? "कृपया बाद में दोबारा जांचें या नया ब्लॉग जोड़ने के लिए कंसोल पर लॉग इन करें।" : "Please check back later, or log in to the agency console to publish new posts."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {blogs.map((blog) => (
                <article key={blog.id} className="glass-card-dark rounded-2xl border border-white/5 bg-black/40 overflow-hidden flex flex-col justify-between hover:border-amber-500/20 transition-all duration-300">
                  <div className="p-6 space-y-4">
                    {blog.cover_image ? (
                      <div className="h-44 bg-slate-900 rounded-xl overflow-hidden mb-4 border border-white/5">
                        <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-44 bg-gradient-to-tr from-black/80 to-[#111111] rounded-xl flex items-center justify-center mb-4 border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                        <span className="text-[10px] font-mono text-[var(--color-amber)] tracking-[0.25em] uppercase">Bhoj360 INSIGHTS</span>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <span className="text-[9.5px] font-mono text-[rgba(245,240,235,0.4)] block">
                        {new Date(blog.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · By {blog.author}
                      </span>
                      <h3 className="text-xl font-serif text-[#F5F0EB] hover:text-[var(--color-amber)] transition-colors">
                        <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                      </h3>
                      <p className="text-xs text-[rgba(245,240,235,0.65)] font-light leading-relaxed line-clamp-3">
                        {blog.excerpt || "No summary provided."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end">
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="text-xs font-bold text-[var(--color-amber)] hover:text-[var(--color-amber-light)] flex items-center gap-1"
                    >
                      <span>{isHindi ? "आगे पढ़ें" : "Read Article"}</span>
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
