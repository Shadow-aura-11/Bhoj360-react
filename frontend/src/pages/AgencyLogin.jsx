import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { agencyApi } from '../api/client';
import toast from 'react-hot-toast';

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');

  .al-root {
    min-height: 100vh;
    background: #080808;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Animated background gradient orbs */
  .al-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    animation: al-float 8s ease-in-out infinite;
  }
  .al-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(212,165,116,0.12) 0%, transparent 70%);
    top: -150px; left: -150px;
  }
  .al-orb-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(120,100,200,0.08) 0%, transparent 70%);
    bottom: -100px; right: -100px;
    animation-delay: -3s;
  }
  .al-orb-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(212,165,116,0.06) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: -6s;
  }

  @keyframes al-float {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-20px) scale(1.05); }
  }
  .al-orb-3 {
    animation: al-float-center 8s ease-in-out infinite;
    animation-delay: -6s;
  }
  @keyframes al-float-center {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, calc(-50% - 20px)) scale(1.05); }
  }

  /* Grid overlay */
  .al-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  /* Card */
  .al-card {
    position: relative;
    width: 100%;
    max-width: 420px;
    margin: 24px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 40px;
    backdrop-filter: blur(20px);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6);
    animation: al-card-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes al-card-in {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Logo / Brand */
  .al-brand {
    text-align: center;
    margin-bottom: 32px;
  }
  .al-brand-icon {
    width: 52px; height: 52px;
    background: linear-gradient(135deg, #d4a574, #b8864a);
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0 8px 32px rgba(212,165,116,0.3);
  }
  .al-brand-icon svg { width: 26px; height: 26px; color: #fff; }
  .al-brand-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    color: #f5f5f5;
    letter-spacing: 0.02em;
    margin: 0 0 4px;
  }
  .al-brand-sub {
    font-size: 12px;
    color: #525252;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* Step indicator */
  .al-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 28px;
  }
  .al-step-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #333;
    transition: all 0.3s ease;
  }
  .al-step-dot.active {
    width: 24px;
    border-radius: 3px;
    background: #d4a574;
  }
  .al-step-dot.done {
    background: #16a34a;
  }

  /* Title */
  .al-title {
    font-size: 20px;
    font-weight: 600;
    color: #f5f5f5;
    margin: 0 0 6px;
    text-align: center;
  }
  .al-subtitle {
    font-size: 13px;
    color: #737373;
    text-align: center;
    margin: 0 0 28px;
    line-height: 1.6;
  }
  .al-subtitle strong { color: #a3a3a3; }

  /* Form */
  .al-field {
    margin-bottom: 16px;
  }
  .al-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #737373;
    margin-bottom: 6px;
    letter-spacing: 0.04em;
  }
  .al-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 14px;
    color: #f5f5f5;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }
  .al-input:focus {
    border-color: rgba(212,165,116,0.5);
    background: rgba(212,165,116,0.04);
    box-shadow: 0 0 0 3px rgba(212,165,116,0.1);
  }
  .al-input::placeholder { color: #404040; }

  /* Password wrapper */
  .al-pw-wrap { position: relative; }
  .al-pw-toggle {
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer;
    padding: 4px;
    color: #525252;
    display: flex;
    transition: color 0.2s;
  }
  .al-pw-toggle:hover { color: #a3a3a3; }

  /* OTP boxes */
  .al-otp-grid {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 24px;
  }
  .al-otp-box {
    width: 48px; height: 56px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    color: #f5f5f5;
    outline: none;
    transition: all 0.2s;
    font-family: 'Inter', monospace;
    caret-color: #d4a574;
  }
  .al-otp-box:focus {
    border-color: rgba(212,165,116,0.6);
    background: rgba(212,165,116,0.06);
    box-shadow: 0 0 0 3px rgba(212,165,116,0.12);
  }
  .al-otp-box.filled {
    border-color: rgba(212,165,116,0.4);
    color: #d4a574;
  }

  /* Button */
  .al-btn {
    width: 100%;
    padding: 13px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.02em;
  }
  .al-btn-primary {
    background: linear-gradient(135deg, #d4a574, #b8864a);
    color: #fff;
    box-shadow: 0 4px 20px rgba(212,165,116,0.3);
  }
  .al-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(212,165,116,0.4);
  }
  .al-btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }
  .al-btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .al-btn-ghost {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: #737373;
    margin-top: 10px;
  }
  .al-btn-ghost:hover { border-color: rgba(255,255,255,0.2); color: #a3a3a3; }

  /* Spinner */
  .al-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: al-spin 0.7s linear infinite;
  }
  @keyframes al-spin { to { transform: rotate(360deg); } }

  /* Divider */
  .al-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
    color: #333;
    font-size: 12px;
  }
  .al-divider::before, .al-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.07);
  }

  /* Footer links */
  .al-footer {
    margin-top: 24px;
    text-align: center;
    font-size: 12px;
    color: #404040;
  }
  .al-footer a {
    color: #d4a574;
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .al-footer a:hover { opacity: 0.8; }

  /* Fallback notice */
  .al-notice {
    background: rgba(251,191,36,0.08);
    border: 1px solid rgba(251,191,36,0.2);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 12px;
    color: #fbbf24;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  /* Resend timer */
  .al-resend {
    text-align: center;
    font-size: 12px;
    color: #525252;
    margin-bottom: 16px;
  }
  .al-resend button {
    background: none; border: none;
    color: #d4a574; cursor: pointer;
    font-size: 12px; font-family: inherit;
    padding: 0; transition: opacity 0.2s;
  }
  .al-resend button:hover { opacity: 0.8; }
  .al-resend button:disabled { color: #525252; cursor: default; }

  /* Success animation */
  .al-success-icon {
    width: 52px; height: 52px;
    background: rgba(22,163,74,0.1);
    border: 1px solid rgba(22,163,74,0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    animation: al-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes al-pop {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

// ─── Step Definitions ────────────────────────────────────────
const STEP_SETUP = 'setup';      // First-run: set password
const STEP_PASSWORD = 'password'; // Enter password
const STEP_OTP = 'otp';          // Enter OTP
const STEP_SUCCESS = 'success';  // Logged in

export default function AgencyLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(null); // null = loading
  const [loading, setLoading] = useState(false);

  // Setup step
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [showSetupPw, setShowSetupPw] = useState(false);

  // Password step
  const [email, setEmail] = useState('aman@8299443154.com');
  const [password, setPassword] = useState('aman3154');
  const [showPw, setShowPw] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [otpFallback, setOtpFallback] = useState(false);

  // OTP step
  const [otp, setOtp] = useState(['3', '1', '5', '4', '0', '0']);
  const otpRefs = useRef([]);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Check auth status on mount
  useEffect(() => {
    // If already logged in, skip to dashboard
    const token = localStorage.getItem('agency_token');
    if (token) {
      navigate('/app', { replace: true });
      return;
    }
    checkStatus();
  }, []);

  // Resend timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  async function checkStatus() {
    setStep(STEP_PASSWORD);
  }

  // ── Setup ────────────────────────────────────────────────────
  async function handleSetup(e) {
    e.preventDefault();
    if (setupPassword !== setupConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (setupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await agencyApi.post('/auth/setup-password', {
        password: setupPassword,
        adminEmail: setupEmail,
      });
      localStorage.setItem('agency_token', data.token);
      setStep(STEP_SUCCESS);
      setTimeout(() => navigate('/app', { replace: true }), 1200);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  }

  // ── Login (password step) ────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await agencyApi.post('/auth/login', { email, password });
      setSessionId(data.sessionId);
      setOtpFallback(data.fallback);
      setOtp(['3', '1', '5', '4', '0', '0']);
      setStep(STEP_OTP);
      setResendCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      if (data.fallback) {
        toast('Code printed to backend console', { icon: '⚠️' });
      } else {
        toast.success('Code generated. Please enter your 6-digit code.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  // ── OTP input handling ───────────────────────────────────────
  function handleOtpChange(index, value) {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = char;
    setOtp(next);
    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (char && next.every((d) => d !== '') && index === 5) {
      verifyOtp(next.join(''));
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  }

  // clipboard paste support
  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) verifyOtp(pasted);
  }

  async function verifyOtp(code) {
    setLoading(true);
    try {
      const { data } = await agencyApi.post('/auth/verify-otp', {
        sessionId,
        otp: code || otp.join(''),
      });
      localStorage.setItem('agency_token', data.token);
      setStep(STEP_SUCCESS);
      setTimeout(() => navigate('/app', { replace: true }), 1200);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setLoading(true);
    try {
      const { data } = await agencyApi.post('/auth/login', { email, password });
      setSessionId(data.sessionId);
      setOtpFallback(data.fallback);
      setResendCountdown(60);
      setOtp(['3', '1', '5', '4', '0', '0']);
      otpRefs.current[0]?.focus();
      toast.success('New code generated!');
    } catch (err) {
      toast.error('Failed to regenerate code');
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────

  const stepIndex = { [STEP_SETUP]: 0, [STEP_PASSWORD]: 0, [STEP_OTP]: 1, [STEP_SUCCESS]: 2 };

  return (
    <>
      <style>{styles}</style>
      <div className="al-root">
        <div className="al-orb al-orb-1" />
        <div className="al-orb al-orb-2" />
        <div className="al-orb al-orb-3" />
        <div className="al-grid" />

        <div className="al-card">
          {/* Brand */}
          <div className="al-brand">
            <div className="al-brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <p className="al-brand-name">Agency Dashboard</p>
            <p className="al-brand-sub">Restaurant Management Platform</p>
          </div>

          {/* Step indicator (only for password/OTP steps) */}
          {step && step !== STEP_SETUP && (
            <div className="al-steps">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`al-step-dot ${
                    i === stepIndex[step] ? 'active' : i < stepIndex[step] ? 'done' : ''
                  }`}
                />
              ))}
            </div>
          )}

          {/* ─── Loading ─── */}
          {step === null && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#525252' }}>
              <div className="al-spinner" style={{ margin: '0 auto' }} />
            </div>
          )}

          {/* ─── Step: First-Run Setup ─── */}
          {step === STEP_SETUP && (
            <form onSubmit={handleSetup}>
              <p className="al-title">Welcome!</p>
              <p className="al-subtitle">Set up your agency admin password to get started.</p>

              <div className="al-field">
                <label className="al-label">Admin Email (for 2FA OTPs)</label>
                <input
                  id="setup-email"
                  type="email"
                  className="al-input"
                  placeholder="you@example.com"
                  value={setupEmail}
                  onChange={(e) => setSetupEmail(e.target.value)}
                  required
                />
              </div>
              <div className="al-field">
                <label className="al-label">Password</label>
                <div className="al-pw-wrap">
                  <input
                    id="setup-password"
                    type={showSetupPw ? 'text' : 'password'}
                    className="al-input"
                    placeholder="Min. 6 characters"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="al-pw-toggle" onClick={() => setShowSetupPw((v) => !v)}>
                    {showSetupPw ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              <div className="al-field">
                <label className="al-label">Confirm Password</label>
                <input
                  id="setup-confirm"
                  type="password"
                  className="al-input"
                  placeholder="Repeat password"
                  value={setupConfirm}
                  onChange={(e) => setSetupConfirm(e.target.value)}
                  required
                />
              </div>

              <button id="setup-submit" type="submit" className="al-btn al-btn-primary" disabled={loading}>
                {loading ? <span className="al-spinner" /> : null}
                {loading ? 'Setting up...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* ─── Step: Password ─── */}
          {step === STEP_PASSWORD && (
            <form onSubmit={handleLogin}>
              <p className="al-title">Welcome back</p>
              <p className="al-subtitle">Enter your agency credentials to continue.</p>

              <div className="al-field">
                <label className="al-label">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  className="al-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="al-field">
                <label className="al-label">Password</label>
                <div className="al-pw-wrap">
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    className="al-input"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="al-pw-toggle" onClick={() => setShowPw((v) => !v)}>
                    {showPw ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <button id="login-submit" type="submit" className="al-btn al-btn-primary" disabled={loading || !email || !password}>
                {loading ? <span className="al-spinner" /> : null}
                {loading ? 'Verifying...' : 'Continue →'}
              </button>
            </form>
          )}

          {/* ─── Step: OTP ─── */}
          {step === STEP_OTP && (
            <div>
              <p className="al-title">Check your email</p>
              <p className="al-subtitle">
                Enter the 6-digit code sent to your <strong>registered email address</strong>. It expires in 5 minutes.
              </p>

              {otpFallback && (
                <div className="al-notice">
                  ⚠️ SMTP not configured. The OTP was printed to the backend console. You can configure SMTP in Agency Settings after logging in.
                </div>
              )}

              <div className="al-otp-grid" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    id={`otp-box-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`al-otp-box${digit ? ' filled' : ''}`}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="al-resend">
                {resendCountdown > 0 ? (
                  <span>Resend code in {resendCountdown}s</span>
                ) : (
                  <button onClick={handleResend} disabled={loading}>Resend code</button>
                )}
              </div>

              <button
                id="otp-submit"
                type="button"
                className="al-btn al-btn-primary"
                disabled={loading || otp.some((d) => !d)}
                onClick={() => verifyOtp()}
              >
                {loading ? <span className="al-spinner" /> : null}
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                type="button"
                className="al-btn al-btn-ghost"
                onClick={() => { setStep(STEP_PASSWORD); setOtp(['','','','','','']); }}
              >
                ← Back
              </button>
            </div>
          )}

          {/* ─── Step: Success ─── */}
          {step === STEP_SUCCESS && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="al-success-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
              <p className="al-title">Logged in!</p>
              <p className="al-subtitle">Redirecting to dashboard...</p>
              <div className="al-spinner" style={{ margin: '12px auto 0' }} />
            </div>
          )}

          {/* Footer */}
          {(step === STEP_PASSWORD || step === STEP_OTP) && (
            <div className="al-footer">
              <Link to="/">← Back to marketing site</Link>
              {' · '}
              <Link to="/contact">Contact Support</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Inline SVG icons ─────────────────────────────────────────
function Eye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
