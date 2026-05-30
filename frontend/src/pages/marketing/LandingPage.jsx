import React, { useEffect, useRef, useState } from 'react';
import './marketing.css';

// Import marketing components
import Nav from './components/Nav';
import Hero from './components/Hero';
import LogoBar from './components/LogoBar';
import Features from './components/Features';
import DashboardShowcase from './components/DashboardShowcase';
import HowItWorks from './components/HowItWorks';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';
import DemoModal from './components/DemoModal';

export default function LandingPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [cursorActive, setCursorActive] = useState(false);
  
  const dotRef = useRef(null);
  const followerRef = useRef(null);

  // 1. Lenis Smooth Scrolling Integration
  useEffect(() => {
    if (window.Lenis) {
      const lenis = new window.Lenis({
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing curve
        smoothWheel: true,
        wheelMultiplier: 1.1,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    }
  }, []);

  // 2. Custom Cursor Follower Lag-less direct DOM implementation
  useEffect(() => {
    const dot = dotRef.current;
    const follower = followerRef.current;
    if (!dot || !follower) return;

    let mouseX = -100;
    let mouseY = -100;
    let followerX = -100;
    let followerY = -100;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const render = () => {
      const ease = 0.12; // Easing factor
      followerX += (mouseX - followerX) * ease;
      followerY += (mouseY - followerY) * ease;

      follower.style.left = `${followerX}px`;
      follower.style.top = `${followerY}px`;

      requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove);
    const animId = requestAnimationFrame(render);

    // Expand cursor ring on hover interactions
    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, [role="button"], input, select, textarea, .grid-table')) {
        setCursorActive(true);
      } else {
        setCursorActive(false);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 3. Scroll Reveal IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // Trigger once
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );

    // Run slightly delayed to ensure DOM rendering completes
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.reveal');
      elements.forEach((el) => observer.observe(el));
    }, 500);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`tableos-landing ${cursorActive ? 'cursor-active' : ''}`}>
      {/* Noise filter and grid overlays */}
      <div className="noise-overlay"></div>
      
      {/* Custom Cursor Followers (hidden on mobile layout via CSS) */}
      <div ref={dotRef} className="cursor-dot" />
      <div ref={followerRef} className="cursor-follower" />

      {/* Landing Sub-sections */}
      <Nav />
      
      <Hero onWatchDemo={() => setIsDemoOpen(true)} />
      
      <LogoBar />
      
      <Features />
      
      <DashboardShowcase />
      
      <HowItWorks />
      
      <Stats />
      
      <Testimonials />
      
      <Pricing />
      
      <FAQ />
      
      <CTA onWatchDemo={() => setIsDemoOpen(true)} />
      
      <Footer />

      {/* Interactive Modal walkthrough slideshow */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}
