import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Form = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const navigate = useNavigate();

  // handle form input changes
  const handleInputChanges = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const url = isLogin
      ? 'http://localhost:5000/api/users/login'
      : 'http://localhost:5000/api/users/register';

    try {
      console.log('🟡 Making request to:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      console.log('🟡 Response status:', response.status);
      const data = await response.json();
      console.log('🟡 Response data:', data);

      if (data.success) {
        setLoginSuccess(true);
        console.log(isLogin ? 'Logged in user:' : 'Registered user:', data.user);
        if (isLogin) {
          navigate('/interview');
        }
      } else {
        setLoginSuccess(false);
        setErrorMessage(data.message || 'Something went wrong. Try again.');
      }
    } catch (error) {
      console.error('🔴 Network error:', error);
      setLoginSuccess(false);
      setErrorMessage('Network error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #03070f;
          --surface:   #070d1a;
          --surface2:  #0a1220;
          --border:    #0e1f35;
          --border2:   #132840;
          --cyan:      #00d4ff;
          --cyan-dim:  #0891b2;
          --cyan-glow: rgba(0,212,255,0.18);
          --teal:      #14b8a6;
          --red:       #ef4444;
          --green:     #10b981;
          --text:      #cdd9e8;
          --text-muted:#4a6280;
          --text-dim:  #1e3555;
        }

        .fr-root {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .fr-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        .fr-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none; z-index: 0;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        .fr-glow-a {
          position: fixed; width: 600px; height: 600px; border-radius: 50%;
          top: -200px; right: -200px;
          background: radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .fr-glow-b {
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          bottom: -150px; left: -150px;
          background: radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        .fr-shape { position: fixed; pointer-events: none; z-index: 0; }
        .fr-diamond {
          width: 180px; height: 180px;
          border: 1px solid rgba(0,212,255,0.1);
          transform: rotate(45deg);
          top: 8%; left: 4%;
          animation: fr-spin 28s linear infinite;
        }
        .fr-diamond-sm {
          width: 70px; height: 70px;
          border: 1px solid rgba(20,184,166,0.15);
          transform: rotate(45deg);
          bottom: 12%; right: 8%;
          animation: fr-spin 18s linear infinite reverse;
        }
        .fr-dot-a {
          width: 5px; height: 5px; background: var(--cyan); border-radius: 50%;
          top: 22%; right: 12%;
          box-shadow: 0 0 14px 5px rgba(0,212,255,0.5);
          animation: fr-pulse 3s ease-in-out infinite;
        }
        .fr-dot-b {
          width: 4px; height: 4px; background: var(--teal); border-radius: 50%;
          bottom: 30%; left: 18%;
          box-shadow: 0 0 12px 4px rgba(20,184,166,0.5);
          animation: fr-pulse 4.5s ease-in-out infinite 1s;
        }
        .fr-hline {
          width: 100px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
          top: 45%; right: 3%; opacity: 0.25;
          animation: fr-blink 4s ease-in-out infinite;
        }

        @keyframes fr-spin   { from{transform:rotate(45deg)} to{transform:rotate(405deg)} }
        @keyframes fr-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(2.2)} }
        @keyframes fr-blink  { 0%,100%{opacity:.25} 50%{opacity:.06} }
        @keyframes fr-up     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fr-shimmer{ 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fr-spinsm { to{transform:rotate(360deg)} }
        @keyframes fr-scan   { 0%{top:-4px} 100%{top:100%} }

        /* card */
        .fr-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 980px;
          display: grid; grid-template-columns: 400px 1fr;
          background: var(--surface);
          border-radius: 4px;
          border: 1px solid var(--border2);
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(0,212,255,0.05), 0 30px 80px rgba(0,0,0,0.7), 0 0 80px rgba(0,212,255,0.04);
          animation: fr-up 0.5s ease-out both;
        }
        .fr-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent 0%, var(--cyan) 40%, var(--teal) 70%, transparent 100%);
          z-index: 20;
        }

        @media (max-width: 768px) {
          .fr-card { grid-template-columns: 1fr; }
          .fr-left  { display: none; }
        }

        /* left panel */
        .fr-left {
          background: var(--surface2);
          border-right: 1px solid var(--border2);
          padding: 3rem 2.5rem;
          display: flex; flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        .fr-left::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 10% 10%, rgba(0,212,255,0.06) 0%, transparent 55%),
            radial-gradient(ellipse at 90% 90%, rgba(20,184,166,0.05) 0%, transparent 50%);
          pointer-events: none;
        }
        .fr-left::after {
          content: ''; position: absolute; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, rgba(0,212,255,0.12), transparent);
          animation: fr-scan 6s linear infinite; pointer-events: none;
        }

        .fr-bkt { position: absolute; width: 26px; height: 26px; }
        .fr-bkt-tl { top:14px; left:14px; border-top: 2px solid var(--cyan-dim); border-left: 2px solid var(--cyan-dim); }
        .fr-bkt-tr { top:14px; right:14px; border-top: 2px solid var(--cyan-dim); border-right: 2px solid var(--cyan-dim); }
        .fr-bkt-bl { bottom:14px; left:14px; border-bottom: 2px solid var(--teal); border-left: 2px solid var(--teal); }
        .fr-bkt-br { bottom:14px; right:14px; border-bottom: 2px solid var(--teal); border-right: 2px solid var(--teal); }

        .fr-hex {
          position: absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:260px; height:260px; opacity:.03;
          background: linear-gradient(135deg, var(--cyan), var(--teal));
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
        }

        .fr-logo {
          width:50px; height:50px;
          border: 1px solid rgba(0,212,255,0.3); border-radius:4px;
          display:flex; align-items:center; justify-content:center;
          background: rgba(0,212,255,0.05);
          box-shadow: 0 0 20px rgba(0,212,255,0.12), inset 0 0 10px rgba(0,212,255,0.04);
          margin-bottom: 1.75rem; position:relative;
        }
        .fr-logo svg { stroke: var(--cyan); }

        .fr-ltitle {
          font-family: 'Rajdhani', sans-serif;
          font-size: 2.3rem; font-weight: 700;
          color: #e2eaf5; line-height: 1.1;
          letter-spacing: 0.03em; margin-bottom:.75rem;
          text-transform: uppercase; position:relative; z-index:1;
        }
        .fr-ltitle span { color: var(--cyan); text-shadow: 0 0 20px rgba(0,212,255,0.45); }

        .fr-lsub {
          color: var(--text-muted); font-size:.875rem;
          line-height:1.65; position:relative; z-index:1;
        }

        .fr-feats { display:flex; flex-direction:column; gap:.875rem; position:relative; z-index:1; }
        .fr-feat  { display:flex; align-items:center; gap:.875rem; color:var(--text-muted); font-size:.8125rem; letter-spacing:.03em; }
        .fr-ficon {
          width:30px; height:30px; border:1px solid var(--border2); border-radius:3px;
          background:rgba(0,212,255,0.04); display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .fr-ficon svg { width:13px; height:13px; stroke:var(--cyan-dim); fill:none; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }

        .fr-status {
          display:flex; align-items:center; gap:.5rem;
          font-size:.65rem; font-family:'Rajdhani',sans-serif; font-weight:600;
          letter-spacing:.12em; text-transform:uppercase;
          color:var(--text-dim); margin-top:1.5rem;
        }
        .fr-sdot {
          width:6px; height:6px; border-radius:50%; background:var(--green);
          box-shadow:0 0 8px rgba(16,185,129,0.6);
          animation:fr-pulse 2s ease-in-out infinite;
        }

        /* right panel */
        .fr-right {
          padding: 3rem 2.75rem;
          display:flex; flex-direction:column; justify-content:center;
          background: var(--surface); position:relative;
        }
        .fr-right::before {
          content:''; position:absolute; bottom:18px; right:18px;
          width:22px; height:22px;
          border-bottom:1px solid var(--border2); border-right:1px solid var(--border2);
          pointer-events:none;
        }

        .fr-eyebrow {
          font-family:'Rajdhani',sans-serif; font-size:.68rem; font-weight:600;
          letter-spacing:.2em; text-transform:uppercase;
          color:var(--cyan-dim); margin-bottom:.375rem;
          display:flex; align-items:center; gap:.5rem;
        }
        .fr-eyebrow::before {
          content:''; display:inline-block; width:18px; height:1px; background:var(--cyan-dim);
        }

        .fr-title {
          font-family:'Rajdhani',sans-serif; font-size:2rem; font-weight:700;
          color:#dce8f5; letter-spacing:.05em; text-transform:uppercase; margin-bottom:.2rem;
        }
        .fr-sub { color:var(--text-muted); font-size:.8125rem; margin-bottom:1.75rem; letter-spacing:.02em; }

        /* alerts */
        .fr-alert {
          display:flex; align-items:center; gap:.75rem;
          padding:.75rem 1rem; border-radius:3px;
          margin-bottom:1.5rem; font-size:.8125rem; letter-spacing:.02em;
          animation:fr-up 0.25s ease;
        }
        .fr-ok  { background:rgba(16,185,129,0.07); border:1px solid rgba(16,185,129,0.22); color:#34d399; border-left:3px solid #10b981; }
        .fr-err { background:rgba(239,68,68,0.07);  border:1px solid rgba(239,68,68,0.18);  color:#f87171; border-left:3px solid #ef4444; }
        .fr-abadge {
          width:20px; height:20px; border-radius:2px;
          display:flex; align-items:center; justify-content:center;
          font-size:.7rem; font-weight:800; flex-shrink:0;
        }
        .fr-ok  .fr-abadge { background:rgba(16,185,129,0.2); color:#34d399; }
        .fr-err .fr-abadge { background:rgba(239,68,68,0.2);  color:#f87171; }

        /* fields */
        .fr-field { margin-bottom:1.125rem; }
        .fr-label {
          display:flex; align-items:center; gap:.375rem;
          font-family:'Rajdhani',sans-serif; font-size:.68rem; font-weight:600;
          letter-spacing:.14em; text-transform:uppercase;
          color:var(--text-dim); margin-bottom:.375rem; transition:color .2s;
        }
        .fr-label.on { color:var(--cyan); }
        .fr-label::before { content:''; display:inline-block; width:3px; height:3px; background:currentColor; border-radius:50%; }

        .fr-wrap { position:relative; }
        .fr-ico {
          position:absolute; left:.875rem; top:50%; transform:translateY(-50%);
          color:var(--text-dim); display:flex; align-items:center;
          transition:color .2s; pointer-events:none;
        }
        .fr-ico.on { color:var(--cyan); }

        .fr-input {
          width:100%;
          background:rgba(0,0,0,0.4);
          border:1px solid var(--border2); border-radius:3px;
          padding:.8rem 1rem .8rem 2.625rem;
          color:var(--text); font-family:'Inter',sans-serif;
          font-size:.9rem; outline:none;
          transition:border-color .2s, box-shadow .2s, background .2s;
          caret-color:var(--cyan); letter-spacing:.01em;
        }
        .fr-input::placeholder { color:var(--text-dim); }
        .fr-input:focus {
          border-color:var(--cyan-dim);
          background:rgba(0,212,255,0.03);
          box-shadow:0 0 0 3px rgba(0,212,255,0.07), inset 0 0 8px rgba(0,212,255,0.02);
        }

        .fr-pwbtn {
          position:absolute; right:.875rem; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer;
          color:var(--text-dim); display:flex; align-items:center;
          padding:.25rem; border-radius:3px; transition:color .2s;
        }
        .fr-pwbtn:hover { color:var(--cyan); }

        /* submit */
        .fr-submit {
          width:100%; margin-top:.5rem; padding:.875rem;
          border:none; border-radius:3px; cursor:pointer;
          font-family:'Rajdhani',sans-serif; font-size:1rem;
          font-weight:700; letter-spacing:.12em; text-transform:uppercase;
          color:#000; background:var(--cyan);
          position:relative; overflow:hidden;
          transition:transform .12s, box-shadow .2s, background .2s;
          box-shadow:0 0 22px rgba(0,212,255,0.3);
        }
        .fr-submit::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
          background-size:200% 100%; opacity:0; transition:opacity .2s;
        }
        .fr-submit:not(:disabled):hover {
          background:#22e0ff; transform:translateY(-1px);
          box-shadow:0 0 38px rgba(0,212,255,0.55);
        }
        .fr-submit:not(:disabled):hover::before { opacity:1; animation:fr-shimmer 1s infinite; }
        .fr-submit:not(:disabled):active { transform:translateY(0); }
        .fr-submit:disabled { opacity:.35; cursor:not-allowed; box-shadow:none; }

        .fr-spinner {
          display:inline-block; width:13px; height:13px;
          border:2px solid rgba(0,0,0,0.3); border-top-color:#000;
          border-radius:50%; animation:fr-spinsm .65s linear infinite;
          margin-right:8px; vertical-align:-2px;
        }

        /* divider */
        .fr-divider { display:flex; align-items:center; gap:1rem; margin:1.5rem 0 1.25rem; }
        .fr-dline   { flex:1; height:1px; background:var(--border2); }
        .fr-dtxt    { font-size:.68rem; font-family:'Rajdhani',sans-serif; letter-spacing:.15em; color:var(--text-dim); text-transform:uppercase; }

        /* toggle */
        .fr-trow { text-align:center; font-size:.8125rem; color:var(--text-muted); }
        .fr-tbtn {
          background:none; border:none; cursor:pointer;
          font-family:'Rajdhani',sans-serif; font-weight:700;
          font-size:.8125rem; letter-spacing:.08em; text-transform:uppercase;
          color:var(--cyan); padding:0 3px;
          text-decoration:underline; text-underline-offset:3px;
          text-decoration-color:rgba(0,212,255,0.22);
          transition:color .2s, text-shadow .2s;
        }
        .fr-tbtn:hover { color:#22e0ff; text-shadow:0 0 12px rgba(0,212,255,0.5); }

        /* badge */
        .fr-badge {
          display:flex; align-items:center; justify-content:center; gap:.5rem;
          margin-top:1.5rem; font-size:.63rem;
          font-family:'Rajdhani',sans-serif; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase; color:var(--text-dim);
        }
        .fr-badge svg { width:11px; height:11px; stroke:var(--text-dim); fill:none; stroke-width:2; }
      `}</style>

      <div className="fr-root">
        <div className="fr-grid" />
        <div className="fr-glow-a" />
        <div className="fr-glow-b" />
        <div className="fr-shape fr-diamond" />
        <div className="fr-shape fr-diamond-sm" />
        <div className="fr-shape fr-dot-a" />
        <div className="fr-shape fr-dot-b" />
        <div className="fr-shape fr-hline" />

        <div className="fr-card">

          {/* ── Left panel ── */}
          <div className="fr-left">
            <div className="fr-bkt fr-bkt-tl" />
            <div className="fr-bkt fr-bkt-tr" />
            <div className="fr-bkt fr-bkt-bl" />
            <div className="fr-bkt fr-bkt-br" />
            <div className="fr-hex" />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="fr-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div className="fr-ltitle">
                {isLogin ? (<>Welcome<br /><span>Back</span></>) : (<>Create<br /><span>Account</span></>)}
              </div>
              <p className="fr-lsub">
                {isLogin
                  ? 'Access your secure portal and continue where you left off.'
                  : 'Register to unlock full access to the platform.'}
              </p>
            </div>

            <div className="fr-feats">
              {[
                { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', txt: 'End-to-end encryption' },
                { d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',              txt: 'Lightning fast access'  },
                { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', txt: '24/7 dedicated support' },
              ].map((f, i) => (
                <div key={i} className="fr-feat">
                  <div className="fr-ficon"><svg viewBox="0 0 24 24"><path d={f.d} /></svg></div>
                  <span>{f.txt}</span>
                </div>
              ))}
              <div className="fr-status">
                <div className="fr-sdot" />
                All systems operational
              </div>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div className="fr-right">
            <div className="fr-eyebrow">{isLogin ? 'Authentication' : 'Registration'}</div>
            <h2 className="fr-title">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
            <p className="fr-sub">{isLogin ? 'Enter credentials to proceed' : 'Fill in your details below'}</p>

            {loginSuccess && (
              <div className="fr-alert fr-ok">
                <div className="fr-abadge">✓</div>
                <span>{isLogin ? 'Authentication successful.' : 'Account created successfully.'}</span>
              </div>
            )}
            {errorMessage && (
              <div className="fr-alert fr-err">
                <div className="fr-abadge">!</div>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="fr-field">
                  <label className={`fr-label ${focused === 'name' ? 'on' : ''}`}>Full Name</label>
                  <div className="fr-wrap">
                    <div className={`fr-ico ${focused === 'name' ? 'on' : ''}`}><User size={16} /></div>
                    <input
                      className="fr-input"
                      type="text" name="name" placeholder="Your name"
                      value={formData.name} onChange={handleInputChanges}
                      onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="fr-field">
                <label className={`fr-label ${focused === 'email' ? 'on' : ''}`}>Email Address</label>
                <div className="fr-wrap">
                  <div className={`fr-ico ${focused === 'email' ? 'on' : ''}`}><Mail size={16} /></div>
                  <input
                    className="fr-input"
                    type="email" name="email" placeholder="you@example.com"
                    value={formData.email} onChange={handleInputChanges}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    required
                  />
                </div>
              </div>

              <div className="fr-field">
                <label className={`fr-label ${focused === 'password' ? 'on' : ''}`}>Password</label>
                <div className="fr-wrap">
                  <div className={`fr-ico ${focused === 'password' ? 'on' : ''}`}><Lock size={16} /></div>
                  <input
                    className="fr-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password" placeholder="••••••••••"
                    value={formData.password} onChange={handleInputChanges}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    required autoComplete="current-password"
                    style={{ paddingRight: '3rem' }}
                  />
                  <button type="button" className="fr-pwbtn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="fr-submit" disabled={isLoading}>
                {isLoading && <span className="fr-spinner" />}
                {isLoading ? 'Processing...' : isLogin ? 'Access System →' : 'Create Account →'}
              </button>
            </form>

            <div className="fr-divider">
              <div className="fr-dline" /><span className="fr-dtxt">or</span><div className="fr-dline" />
            </div>

            <div className="fr-trow">
              {isLogin ? "No account? " : "Have an account? "}
              <button
                type="button" className="fr-tbtn"
                onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); setLoginSuccess(false); }}
              >
                {isLogin ? 'Register' : 'Sign In'}
              </button>
            </div>

            <div className="fr-badge">
              <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              SSL Secured · 256-bit AES Encrypted
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Form;