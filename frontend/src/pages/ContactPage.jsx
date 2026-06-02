import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { agencyApi } from '../api/client';
import toast from 'react-hot-toast';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

  .cp-root {
    min-height: 100vh;
    background: #080808;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  /* Orbs */
  .cp-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
  }
  .cp-orb-1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(212,165,116,0.08) 0%, transparent 70%);
    top: -200px; right: -200px;
  }
  .cp-orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(100,80,200,0.06) 0%, transparent 70%);
    bottom: -100px; left: -100px;
  }

  /* Nav */
  .cp-nav {
    position: sticky; top: 0; z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 40px;
    background: rgba(8,8,8,0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .cp-nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: inherit;
  }
  .cp-nav-logo {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #d4a574, #b8864a);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cp-nav-logo svg { width: 18px; height: 18px; color: #fff; }
  .cp-nav-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 600;
    color: #f5f5f5;
  }
  .cp-nav-links {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cp-nav-link {
    color: #737373;
    text-decoration: none;
    font-size: 13px;
    padding: 6px 14px;
    border-radius: 8px;
    transition: all 0.2s;
  }
  .cp-nav-link:hover { color: #f5f5f5; background: rgba(255,255,255,0.05); }
  .cp-nav-btn {
    color: #fff;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    padding: 7px 18px;
    border-radius: 8px;
    background: linear-gradient(135deg, #d4a574, #b8864a);
    transition: all 0.2s;
  }
  .cp-nav-btn:hover { opacity: 0.9; transform: translateY(-1px); }

  /* Hero */
  .cp-hero {
    position: relative; z-index: 1;
    text-align: center;
    padding: 80px 24px 60px;
    max-width: 640px;
    margin: 0 auto;
  }
  .cp-hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    background: rgba(212,165,116,0.1);
    border: 1px solid rgba(212,165,116,0.2);
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    color: #d4a574;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .cp-hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(36px, 5vw, 54px);
    font-weight: 600;
    color: #f5f5f5;
    line-height: 1.15;
    margin: 0 0 16px;
    letter-spacing: -0.02em;
  }
  .cp-hero-title em {
    color: #d4a574;
    font-style: italic;
  }
  .cp-hero-sub {
    font-size: 16px;
    color: #737373;
    line-height: 1.7;
    margin: 0;
  }

  /* Main layout */
  .cp-layout {
    position: relative; z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px 80px;
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 40px;
  }
  @media (max-width: 768px) {
    .cp-layout { grid-template-columns: 1fr; }
    .cp-sidebar { order: -1; }
  }

  /* Form card */
  .cp-form-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 36px;
    animation: cp-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes cp-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .cp-form-title {
    font-size: 18px;
    font-weight: 600;
    color: #f5f5f5;
    margin: 0 0 24px;
  }

  /* Form fields */
  .cp-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 500px) { .cp-grid-2 { grid-template-columns: 1fr; } }
  .cp-field {
    margin-bottom: 16px;
  }
  .cp-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #737373;
    margin-bottom: 6px;
    letter-spacing: 0.04em;
  }
  .cp-label span { color: #d4a574; }
  .cp-input, .cp-select, .cp-textarea {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 14px;
    color: #f5f5f5;
    outline: none;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
  }
  .cp-input:focus, .cp-select:focus, .cp-textarea:focus {
    border-color: rgba(212,165,116,0.5);
    background: rgba(212,165,116,0.04);
    box-shadow: 0 0 0 3px rgba(212,165,116,0.1);
  }
  .cp-input::placeholder, .cp-textarea::placeholder { color: #404040; }
  .cp-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23525252' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }
  .cp-select option { background: #1a1a1a; color: #f5f5f5; }
  .cp-textarea {
    resize: vertical;
    min-height: 120px;
    line-height: 1.6;
  }

  /* Submit button */
  .cp-submit {
    width: 100%;
    padding: 13px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #d4a574, #b8864a);
    color: #fff;
    box-shadow: 0 4px 20px rgba(212,165,116,0.3);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
  }
  .cp-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(212,165,116,0.4);
  }
  .cp-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Spinner */
  .cp-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: cp-spin 0.7s linear infinite;
  }
  @keyframes cp-spin { to { transform: rotate(360deg); } }

  /* Success state */
  .cp-success {
    text-align: center;
    padding: 48px 0;
  }
  .cp-success-icon {
    width: 72px; height: 72px;
    background: rgba(22,163,74,0.1);
    border: 1px solid rgba(22,163,74,0.25);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    animation: cp-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes cp-pop {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .cp-success-title {
    font-size: 22px;
    font-weight: 600;
    color: #f5f5f5;
    margin: 0 0 10px;
  }
  .cp-success-sub {
    font-size: 14px;
    color: #737373;
    margin: 0 0 24px;
    line-height: 1.6;
  }
  .cp-success-id {
    display: inline-block;
    background: rgba(212,165,116,0.1);
    border: 1px solid rgba(212,165,116,0.2);
    color: #d4a574;
    font-size: 13px;
    font-family: monospace;
    padding: 4px 12px;
    border-radius: 6px;
    margin-bottom: 24px;
  }
  .cp-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #737373;
    text-decoration: none;
    font-size: 13px;
    border: 1px solid rgba(255,255,255,0.1);
    padding: 8px 18px;
    border-radius: 8px;
    transition: all 0.2s;
  }
  .cp-back-btn:hover { color: #f5f5f5; border-color: rgba(255,255,255,0.2); }

  /* Sidebar */
  .cp-sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .cp-info-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 24px;
    animation: cp-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .cp-info-card:nth-child(2) { animation-delay: 0.05s; }
  .cp-info-card:nth-child(3) { animation-delay: 0.1s; }

  .cp-info-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }
  .cp-info-icon.gold { background: rgba(212,165,116,0.1); color: #d4a574; }
  .cp-info-icon.blue { background: rgba(99,102,241,0.1); color: #818cf8; }
  .cp-info-icon.green { background: rgba(34,197,94,0.1); color: #4ade80; }
  .cp-info-icon svg { width: 20px; height: 20px; }

  .cp-info-title {
    font-size: 14px;
    font-weight: 600;
    color: #f5f5f5;
    margin: 0 0 6px;
  }
  .cp-info-body {
    font-size: 13px;
    color: #737373;
    line-height: 1.6;
    margin: 0;
  }
  .cp-info-body a { color: #d4a574; text-decoration: none; }
  .cp-info-body a:hover { text-decoration: underline; }

  /* Footer */
  .cp-foot {
    position: relative; z-index: 1;
    text-align: center;
    padding: 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
    font-size: 12px;
    color: #404040;
  }
  .cp-foot a { color: #737373; text-decoration: none; }
  .cp-foot a:hover { color: #f5f5f5; }
`;

const SUBJECTS = [
  'General Inquiry',
  'Sales & Pricing',
  'Technical Support',
  'Partnership',
  'Feature Request',
  'Billing',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null); // { id }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanPhone = form.phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error('Exactly 10-digit phone number is required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await agencyApi.post('/contact', { ...form, phone: cleanPhone });
      setSubmitted({ id: data.id });
      toast.success('Message sent!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="cp-root">
        <div className="cp-orb cp-orb-1" />
        <div className="cp-orb cp-orb-2" />

        {/* Nav */}
        <nav className="cp-nav">
          <Link to="/" className="cp-nav-brand">
            <div className="cp-nav-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <span className="cp-nav-name">Bhoj360</span>
          </Link>
          <div className="cp-nav-links">
            <Link to="/" className="cp-nav-link">Home</Link>
            <Link to="/app/login" className="cp-nav-btn">Dashboard →</Link>
          </div>
        </nav>

        {/* Hero */}
        <div className="cp-hero">
          <div className="cp-hero-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Get in touch
          </div>
          <h1 className="cp-hero-title">
            We'd love to <em>hear from you</em>
          </h1>
          <p className="cp-hero-sub">
            Have a question, want a demo, or need support? Send us a message and our team will get back to you within 24 hours.
          </p>
        </div>

        {/* Main */}
        <div className="cp-layout">
          {/* Form */}
          <div className="cp-form-card">
            {submitted ? (
              <div className="cp-success">
                <div className="cp-success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
                <p className="cp-success-title">Message sent!</p>
                <p className="cp-success-sub">
                  Thank you for reaching out. Our team will review your message and respond to your email within 24 hours.
                </p>
                <div className="cp-success-id">Ref: {submitted.id}</div>
                <br />
                <Link to="/" className="cp-back-btn">
                  ← Back to home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="cp-form-title">Send us a message</p>

                <div className="cp-grid-2">
                  <div className="cp-field">
                    <label className="cp-label">Full Name <span>*</span></label>
                    <input
                      id="contact-name"
                      className="cp-input"
                      placeholder="John Smith"
                      value={form.name}
                      onChange={set('name')}
                      required
                    />
                  </div>
                  <div className="cp-field">
                    <label className="cp-label">Email <span>*</span></label>
                    <input
                      id="contact-email"
                      type="email"
                      className="cp-input"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={set('email')}
                      required
                    />
                  </div>
                </div>

                <div className="cp-grid-2">
                  <div className="cp-field">
                    <label className="cp-label">Phone</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      className="cp-input"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={set('phone')}
                    />
                  </div>
                  <div className="cp-field">
                    <label className="cp-label">Restaurant / Company</label>
                    <input
                      id="contact-company"
                      className="cp-input"
                      placeholder="Spice Garden"
                      value={form.company}
                      onChange={set('company')}
                    />
                  </div>
                </div>

                <div className="cp-field">
                  <label className="cp-label">Subject</label>
                  <select
                    id="contact-subject"
                    className="cp-select"
                    value={form.subject}
                    onChange={set('subject')}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="cp-field">
                  <label className="cp-label">Message <span>*</span></label>
                  <textarea
                    id="contact-message"
                    className="cp-textarea"
                    placeholder="Tell us how we can help you..."
                    value={form.message}
                    onChange={set('message')}
                    required
                  />
                </div>

                <button
                  id="contact-submit"
                  type="submit"
                  className="cp-submit"
                  disabled={loading}
                >
                  {loading && <span className="cp-spinner" />}
                  {loading ? 'Sending...' : 'Send Message →'}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="cp-sidebar">
            <div className="cp-info-card">
              <div className="cp-info-icon gold">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
              </div>
              <p className="cp-info-title">Response Time</p>
              <p className="cp-info-body">We typically respond within 24 hours on business days. For urgent matters, please indicate it in your message.</p>
            </div>

            <div className="cp-info-card">
              <div className="cp-info-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <p className="cp-info-title">Sales & Demos</p>
              <p className="cp-info-body">Interested in a live product demo? Select "Sales & Pricing" as your subject and we'll schedule a personalized walkthrough.</p>
            </div>

            <div className="cp-info-card">
              <div className="cp-info-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className="cp-info-title">Already a Customer?</p>
              <p className="cp-info-body">
                Log into your{' '}
                <a href="/app/login">Agency Dashboard</a>
                {' '}for direct access to support resources and account management.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="cp-foot">
          © {new Date().getFullYear()} Bhoj360 · <Link to="/">Home</Link> · <Link to="/app/login">Dashboard</Link>
        </footer>
      </div>
    </>
  );
}
