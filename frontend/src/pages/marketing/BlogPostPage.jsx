import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import { agencyApi } from '../../api/client';
import { useLanguage } from '../../hooks/useLanguage';
import toast from 'react-hot-toast';

export default function BlogPostPage() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const { data } = await agencyApi.get(`/blogs/${slug}`);
        setBlog(data);
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
        toast.error('Blog post not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  return (
    <div className="tableos-landing min-h-screen flex flex-col justify-between bg-[#080808] text-[#F5F0EB] relative">
      <div className="noise-overlay"></div>
      <div className="absolute top-1/4 left-1/2 w-[400px] h-[400px] rounded-full bg-[rgba(212,146,10,0.03)] blur-[100px] pointer-events-none"></div>
      
      <Nav />
      <FloatingWhatsApp />

      <main className="flex-grow pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full z-10">
        <div className="max-w-3xl mx-auto space-y-8 text-left">
          {/* Back button */}
          <div>
            <Link to="/blog" className="text-xs text-[var(--color-amber)] hover:underline flex items-center gap-1.5 w-fit">
              <span>←</span>
              <span>{isHindi ? "सभी ब्लॉग पर वापस जाएं" : "Back to Blog"}</span>
            </Link>
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 font-mono text-xs">
              Loading article...
            </div>
          ) : !blog ? (
            <div className="py-20 text-center text-slate-450 border border-white/10 rounded-2xl">
              <span className="text-3xl block mb-2">⚠️</span>
              <p className="text-sm font-semibold">{isHindi ? "लेख नहीं मिला" : "Article Not Found"}</p>
            </div>
          ) : (
            <article className="space-y-8">
              {/* Header Info */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-[var(--color-amber)] uppercase tracking-widest block">
                  Bhoj360 Insights
                </span>
                <h1 className="text-4xl md:text-5xl font-serif text-[#F5F0EB] leading-tight">
                  {blog.title}
                </h1>
                <div className="text-xs text-[rgba(245,240,235,0.45)] font-mono">
                  {new Date(blog.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })} · By {blog.author}
                </div>
              </div>

              {/* Cover Image */}
              {blog.cover_image && (
                <div className="w-full max-h-[380px] bg-slate-900 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                  <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Content */}
              <div 
                className="prose prose-invert prose-amber max-w-none text-sm md:text-base text-[rgba(245,240,235,0.85)] font-light leading-relaxed space-y-6 pt-4 border-t border-white/5"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </article>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
