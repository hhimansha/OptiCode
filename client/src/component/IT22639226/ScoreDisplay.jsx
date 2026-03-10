import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

// ─── Score Ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score, max = 10, size = 68, stroke = 5 }) => {
  const pct = score / max;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color = pct >= 0.8 ? '#4fffce' : pct >= 0.5 ? '#ffc857' : '#ff6b6b';
  const glowColor = pct >= 0.8 ? '#4fffce66' : pct >= 0.5 ? '#ffc85766' : '#ff6b6b66';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0, filter: `drop-shadow(0 0 6px ${glowColor})` }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#0d1b2a" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.22} fontWeight="800" fontFamily="'Space Grotesk', monospace"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>{score}</text>
    </svg>
  );
};

// ─── Overall Gauge ─────────────────────────────────────────────────────────────
const OverallGauge = ({ score, max = 100 }) => {
  const pct = score / max;
  const color = pct >= 0.8 ? '#4fffce' : pct >= 0.5 ? '#ffc857' : '#ff6b6b';
  const label = pct >= 0.8 ? 'Excellent' : pct >= 0.6 ? 'Good' : pct >= 0.4 ? 'Fair' : 'Needs Work';
  const size = 130, stroke = 11;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 20px ${color}44)` }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#0d1b2a" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }} />
          <text x="50%" y="44%" textAnchor="middle" dominantBaseline="central"
            fill={color} fontSize="28" fontWeight="900" fontFamily="'Space Grotesk', sans-serif"
            style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>{score}</text>
          <text x="50%" y="64%" textAnchor="middle" dominantBaseline="central"
            fill="#2a3f56" fontSize="11" fontFamily="'Space Grotesk', sans-serif" fontWeight="600"
            style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>/ {max}</text>
        </svg>
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color, fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
    </div>
  );
};

// ─── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ score }) => {
  const pct = score / 10;
  const config = pct >= 0.8
    ? { bg: 'rgba(79,255,206,0.08)', color: '#4fffce', border: 'rgba(79,255,206,0.25)', label: '★ Strong' }
    : pct >= 0.5
    ? { bg: 'rgba(255,200,87,0.08)', color: '#ffc857', border: 'rgba(255,200,87,0.25)', label: '◆ Average' }
    : { bg: 'rgba(255,107,107,0.08)', color: '#ff6b6b', border: 'rgba(255,107,107,0.25)', label: '▼ Weak' };
  return (
    <span style={{
      background: config.bg, color: config.color, fontSize: 10, fontWeight: 800,
      padding: '3px 10px', borderRadius: 99, fontFamily: "'Space Grotesk', monospace",
      letterSpacing: '0.1em', border: `1px solid ${config.border}`
    }}>{config.label}</span>
  );
};

// ─── Stat Pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ label, value, color }) => (
  <div style={{
    background: 'rgba(13,27,42,0.8)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 14, padding: '14px 20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }}>
    <span style={{ fontSize: 22, fontWeight: 900, color: color || '#e2e8f0', fontFamily: "'Space Grotesk', monospace", letterSpacing: '-0.02em' }}>{value}</span>
    <span style={{ fontSize: 9, color: '#2a4060', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</span>
  </div>
);

// ─── Emotion Timeline ─────────────────────────────────────────────────────────
const EmotionTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;
  const emotionConfig = {
    Neutral:   { color: '#94a3b8', icon: '😐' },
    Happy:     { color: '#ffc857', icon: '😊' },
    Sad:       { color: '#60a5fa', icon: '😢' },
    Angry:     { color: '#ff6b6b', icon: '😠' },
    Surprised: { color: '#c084fc', icon: '😲' },
    Fearful:   { color: '#fb923c', icon: '😨' },
    Disgusted: { color: '#6b7280', icon: '🤢' },
  };
  const emotionColor = (e) => emotionConfig[e]?.color || '#64748b';
  const totalDuration = timeline.reduce((sum, e) => sum + (e.durationSec || 0), 0);
  const emotionTotals = timeline.reduce((acc, e) => {
    acc[e.emotion] = (acc[e.emotion] || 0) + (e.durationSec || 0);
    return acc;
  }, {});

  return (
    <div style={{ marginTop: 28, background: 'rgba(8,18,34,0.9)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: '24px 28px', backdropFilter: 'blur(20px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4fffce', boxShadow: '0 0 8px #4fffce' }} />
        <p style={{ fontSize: 10, color: '#2a4060', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800 }}>
          Emotion Timeline
        </p>
        {timeline[0]?.timestamp && (
          <span style={{ fontSize: 10, color: '#1e3045', marginLeft: 'auto' }}>
            {timeline[0].timestamp} — {timeline[timeline.length-1]?.timestamp}
          </span>
        )}
      </div>

      {/* Timeline bar */}
      <div style={{ display: 'flex', height: 44, borderRadius: 10, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
        {timeline.map((entry, idx) => {
          const width = entry.durationSec
            ? `${(entry.durationSec / totalDuration) * 100}%`
            : `${100 / timeline.length}%`;
          return (
            <div key={idx} style={{
              width,
              backgroundColor: emotionColor(entry.emotion),
              opacity: 0.85,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#050d17', fontWeight: 800,
              transition: 'opacity 0.2s', cursor: 'default',
              position: 'relative',
            }}
              title={`${entry.emotion} @ ${entry.timestamp} (${entry.durationSec}s)`}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
            >
              {parseFloat(width) > 6 && entry.emotion[0]}
            </div>
          );
        })}
      </div>

      {/* Emotion stats grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {Object.entries(emotionTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([emotion, totalSec]) => {
            const pct = Math.round((totalSec / totalDuration) * 100);
            const col = emotionColor(emotion);
            return (
              <div key={emotion} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: `${col}10`, border: `1px solid ${col}25`,
                borderRadius: 10, padding: '6px 12px',
              }}>
                <span style={{ fontSize: 14 }}>{emotionConfig[emotion]?.icon || '●'}</span>
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{emotion}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: col, fontFamily: "'Space Grotesk', monospace" }}>{pct}%</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

// ─── Score color helper ────────────────────────────────────────────────────────
const scoreColor = (score, max = 100) => {
  const pct = score / max;
  return pct >= 0.8 ? '#4fffce' : pct >= 0.5 ? '#ffc857' : '#ff6b6b';
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ScoreDisplay = () => {
  const [interviews, setInterviews]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [selectedId, setSelectedId]   = useState(null);
  const [expandedQ, setExpandedQ]     = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/score/my-results', { withCredentials: true });
        if (res.data.success) {
          setInterviews(res.data.data);
          if (res.data.data.length > 0) setSelectedId(res.data.data[0]._id || 0);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load scores');
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const session  = interviews.find((s, i) => (s._id || i) === selectedId);
  const avgScore = session ? (session.questionsAnalysis.reduce((a,q) => a + q.marksOutOf10, 0) / session.questionsAnalysis.length).toFixed(1) : 0;
  const best     = session ? Math.max(...session.questionsAnalysis.map(q => q.marksOutOf10)) : 0;
  const worst    = session ? Math.min(...session.questionsAnalysis.map(q => q.marksOutOf10)) : 0;

  const handleSessionSelect = (sid) => {
    if (sid === selectedId) { setShowDetails(p => !p); }
    else { setSelectedId(sid); setShowDetails(true); setExpandedQ(null); }
    setDropdownOpen(false);
  };

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #03080f;
      font-family: 'Space Grotesk', sans-serif;
    }

    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #05101a; }
    ::-webkit-scrollbar-thumb { background: #1a3050; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #254468; }

    .q-card {
      transition: transform 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s cubic-bezier(.4,0,.2,1), border-color 0.22s;
    }
    .q-card:hover { transform: translateY(-3px); }

    .session-opt { transition: background 0.15s, padding-left 0.15s; }
    .session-opt:hover { background: rgba(79,255,206,0.04) !important; padding-left: 26px !important; }

    .stat-pill:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.5); }

    .details-enter { animation: fadeUp 0.4s cubic-bezier(.4,0,.2,1) forwards; }
    .expand-anim   { animation: fadeUp 0.28s cubic-bezier(.4,0,.2,1) forwards; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    .shimmer-text {
      background: linear-gradient(90deg, #4fffce 0%, #60efff 30%, #4fffce 60%, #7bffdf 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 3s linear infinite;
    }

    .glow-teal { box-shadow: 0 0 24px rgba(79,255,206,0.15); }

    .toggle-btn {
      display: flex; align-items: center; gap: 7px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px; padding: 7px 16px;
      cursor: pointer;
      color: #2a4060;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      transition: all 0.2s;
    }
    .toggle-btn:hover, .toggle-btn.active {
      border-color: rgba(79,255,206,0.3);
      color: #4fffce;
      background: rgba(79,255,206,0.06);
    }

    .dropdown-trigger {
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    .dropdown-trigger:hover {
      border-color: rgba(79,255,206,0.25) !important;
      background: rgba(10,22,40,0.95) !important;
    }

    .score-bar-segment {
      transition: transform 0.2s, opacity 0.2s;
    }
    .score-bar-segment:hover {
      transform: scaleY(1.1) !important;
      transform-origin: bottom;
      opacity: 1 !important;
    }
  `;

  // ── Loading ──
  if (loading) return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', background: '#03080f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52,
            border: '2px solid rgba(79,255,206,0.1)',
            borderTop: '2px solid #4fffce',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            margin: '0 auto 20px',
            boxShadow: '0 0 20px rgba(79,255,206,0.2)'
          }} />
          <p style={{ color: '#1e3a52', fontSize: 11, letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase' }}>Loading Results</p>
        </div>
      </div>
    </>
  );

  // ── Error ──
  if (error) return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', background: '#03080f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          background: 'rgba(20,5,5,0.9)',
          border: '1px solid rgba(255,107,107,0.2)',
          borderRadius: 20, padding: '40px 60px', textAlign: 'center',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(255,107,107,0.08)'
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠</div>
          <p style={{ color: '#ff6b6b', fontSize: 15, fontWeight: 700 }}>{error}</p>
        </div>
      </div>
    </>
  );

  // ── Empty ──
  if (!interviews.length) return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', background: '#03080f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 60, marginBottom: 20, filter: 'grayscale(0.3)' }}>📋</div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#1a3050', fontFamily: "'Syne', sans-serif" }}>No Sessions Yet</p>
          <p style={{ fontSize: 13, color: '#0f2035', marginTop: 10 }}>Complete an interview to see your results here.</p>
        </div>
      </div>
    </>
  );

  // ── Main ──
  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', background: '#03080f', fontFamily: "'Space Grotesk', sans-serif", color: '#c8d8e8' }}>

        {/* ── Ambient background ── */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `
            radial-gradient(ellipse 60% 40% at 10% 0%, rgba(79,255,206,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 90% 100%, rgba(59,130,246,0.04) 0%, transparent 70%)
          `
        }} />

        {/* ── Top Bar ── */}
        <div style={{
          background: 'rgba(4,10,20,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          padding: '0 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66,
          position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(24px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Logo mark */}
            <div style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #4fffce, #3b82f6)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17,
              boxShadow: '0 0 20px rgba(79,255,206,0.3), 0 4px 12px rgba(0,0,0,0.4)'
            }}>◈</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: '-0.01em', color: '#e2f0ff' }}>
              InterviewIQ
            </span>
            <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.07)', margin: '0 4px' }} />
            <span style={{ color: '#1e3a52', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em' }}>Performance History</span>
          </div>
          <div style={{
            background: 'rgba(79,255,206,0.07)',
            border: '1px solid rgba(79,255,206,0.15)',
            borderRadius: 20, padding: '5px 16px',
            fontSize: 11, color: '#4fffce', fontWeight: 700,
            letterSpacing: '0.08em'
          }}>
            {interviews.length} Session{interviews.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: 1020, margin: '0 auto', padding: '40px 28px', position: 'relative', zIndex: 1 }}>

          {/* ── Session Selector ── */}
          <div style={{ marginBottom: 32, position: 'relative' }} ref={dropdownRef}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 9, color: '#1a3050', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800 }}>
                Select Session
              </span>
              {session && (
                <button
                  className={`toggle-btn${showDetails ? ' active' : ''}`}
                  onClick={() => setShowDetails(p => !p)}
                >
                  <span style={{ fontSize: 13 }}>{showDetails ? '▾' : '▸'}</span>
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              )}
            </div>

            {/* Dropdown trigger */}
            <button
              className="dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: '100%',
                background: dropdownOpen ? 'rgba(10,22,40,0.95)' : 'rgba(8,18,34,0.7)',
                border: `1px solid ${dropdownOpen ? 'rgba(79,255,206,0.3)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 18, padding: '16px 22px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', color: '#c8d8e8',
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, outline: 'none',
                backdropFilter: 'blur(20px)',
                boxShadow: dropdownOpen ? '0 0 0 3px rgba(79,255,206,0.08), 0 20px 60px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: session ? `${scoreColor(session.overallScore)}12` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${session ? scoreColor(session.overallScore) + '30' : 'rgba(255,255,255,0.06)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19
                }}>📅</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#dce8f5' }}>
                    {session
                      ? new Date(session.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Select a session…'}
                  </div>
                  {session && (
                    <div style={{ fontSize: 11, color: '#1e3a52', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{session.questionsAnalysis.length} questions</span>
                      <span style={{ opacity: 0.3 }}>·</span>
                      <span style={{ color: scoreColor(session.overallScore), fontWeight: 700 }}>
                        Score: {session.overallScore}/100
                      </span>
                      <span style={{ opacity: 0.3 }}>·</span>
                      <span style={{ color: showDetails ? '#4fffce' : '#1e3a52' }}>
                        {showDetails ? 'Details visible' : 'Details hidden'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <span style={{
                color: '#1e3a52', fontSize: 16,
                transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.25s', display: 'inline-block'
              }}>⌄</span>
            </button>

            {/* Dropdown list */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0,
                background: 'rgba(6,14,26,0.97)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 18, zIndex: 200, overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
                backdropFilter: 'blur(24px)',
                animation: 'fadeUp 0.2s cubic-bezier(.4,0,.2,1)'
              }}>
                <div style={{ padding: '8px 0' }}>
                  {interviews.map((s, i) => {
                    const sid = s._id || i;
                    const isActive = sid === selectedId;
                    const sc = scoreColor(s.overallScore);
                    const pct = s.overallScore / 100;
                    return (
                      <div
                        key={sid}
                        className="session-opt"
                        onClick={() => handleSessionSelect(sid)}
                        style={{
                          padding: '13px 22px', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: isActive ? 'rgba(79,255,206,0.05)' : 'transparent',
                          borderLeft: `2px solid ${isActive ? sc : 'transparent'}`,
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ position: 'relative', width: 38, height: 38 }}>
                            <svg width={38} height={38} style={{ transform: 'rotate(-90deg)', filter: isActive ? `drop-shadow(0 0 6px ${sc}55)` : 'none' }}>
                              <circle cx={19} cy={19} r={15} fill="none" stroke="#0d1b2a" strokeWidth={3} />
                              <circle cx={19} cy={19} r={15} fill="none" stroke={sc} strokeWidth={3}
                                strokeDasharray={`${2 * Math.PI * 15 * pct} ${2 * Math.PI * 15}`}
                                strokeLinecap="round" />
                            </svg>
                            <span style={{
                              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 900, color: sc, fontFamily: "'JetBrains Mono', monospace"
                            }}>{s.overallScore}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#e2f0ff' : '#4a6a88' }}>
                              {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div style={{ fontSize: 10, color: '#0f2035', marginTop: 2, letterSpacing: '0.06em' }}>
                              {s.questionsAnalysis.length} questions
                              {isActive && <span style={{ marginLeft: 8, color: showDetails ? '#4fffce' : '#1e3a52' }}>{showDetails ? '● showing' : '○ hidden'}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {isActive && (
                            <span style={{ fontSize: 9, color: sc, fontWeight: 800, letterSpacing: '0.12em',
                              background: `${sc}12`, border: `1px solid ${sc}28`, borderRadius: 6, padding: '3px 8px', textTransform: 'uppercase' }}>
                              Active
                            </span>
                          )}
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 17, fontWeight: 900, color: sc, fontFamily: "'JetBrains Mono', monospace" }}>{s.overallScore}</span>
                            <span style={{ fontSize: 10, color: '#1e3a52' }}>/100</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Session Details ── */}
          {session && showDetails && (
            <div className="details-enter">

              {/* ── Stats Row ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: 16, marginBottom: 28 }}>

                {/* Overall gauge card */}
                <div style={{
                  background: 'rgba(8,18,34,0.8)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 20, padding: '24px 20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* glow accent */}
                  <div style={{
                    position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
                    width: 80, height: 80, borderRadius: '50%',
                    background: `radial-gradient(circle, ${scoreColor(session.overallScore)}20, transparent 70%)`,
                    pointerEvents: 'none'
                  }} />
                  <OverallGauge score={session.overallScore} />
                  <span style={{ fontSize: 9, color: '#1a3050', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800 }}>Overall Score</span>
                </div>

                {/* Stats grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div className="stat-pill" style={{ background: 'rgba(8,18,34,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, backdropFilter: 'blur(10px)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: '#4fffce', fontFamily: "'JetBrains Mono', monospace" }}>{avgScore}</span>
                      <span style={{ fontSize: 9, color: '#1a3050', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Avg / Question</span>
                    </div>
                    <div className="stat-pill" style={{ background: 'rgba(8,18,34,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, backdropFilter: 'blur(10px)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: '#34d399', fontFamily: "'JetBrains Mono', monospace" }}>{best}/10</span>
                      <span style={{ fontSize: 9, color: '#1a3050', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Best Answer</span>
                    </div>
                    <div className="stat-pill" style={{ background: 'rgba(8,18,34,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, backdropFilter: 'blur(10px)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                      <span style={{ fontSize: 24, fontWeight: 900, color: '#ff6b6b', fontFamily: "'JetBrains Mono', monospace" }}>{worst}/10</span>
                      <span style={{ fontSize: 9, color: '#1a3050', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Weakest Answer</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[
                      { label: 'Questions', value: session.questionsAnalysis.length, color: '#8fa8c8' },
                      { label: 'Date', value: new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: '#8fa8c8' },
                      { label: 'Task', value: session.task || '—', color: '#60a5fa' },
                      { label: 'Code', value: session.code || '—', color: '#ffc857' },
                    ].map(p => (
                      <div key={p.label} className="stat-pill" style={{ background: 'rgba(8,18,34,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, backdropFilter: 'blur(10px)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: p.color, fontFamily: "'JetBrains Mono', monospace" }}>{p.value}</span>
                        <span style={{ fontSize: 9, color: '#1a3050', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Skill Level ── */}
              {session.skillLevel && (
                <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 9, color: '#1a3050', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800 }}>Skill Level</span>
                  <span style={{
                    background: 'rgba(139,92,246,0.12)', color: '#a78bfa',
                    border: '1px solid rgba(139,92,246,0.25)',
                    borderRadius: 8, padding: '5px 16px', fontSize: 13, fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em'
                  }}>{session.skillLevel}</span>
                </div>
              )}

              {/* ── Score Distribution ── */}
              <div style={{
                background: 'rgba(8,18,34,0.8)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 20, padding: '22px 26px', marginBottom: 28,
                backdropFilter: 'blur(20px)', boxShadow: '0 8px 40px rgba(0,0,0,0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4fffce', boxShadow: '0 0 6px #4fffce' }} />
                  <p style={{ fontSize: 9, color: '#1a3050', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800 }}>
                    Score Distribution
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 5, height: 64, alignItems: 'flex-end' }}>
                  {session.questionsAnalysis.map((q, i) => {
                    const pct = q.marksOutOf10 / 10;
                    const col = pct >= 0.8 ? '#4fffce' : pct >= 0.5 ? '#ffc857' : '#ff6b6b';
                    const isHL = expandedQ === i;
                    return (
                      <div key={i}
                        className="score-bar-segment"
                        title={`Q${i+1}: ${q.marksOutOf10}/10`}
                        onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                        style={{
                          flex: 1,
                          background: isHL
                            ? `linear-gradient(to top, ${col}, ${col}cc)`
                            : `linear-gradient(to top, ${col}80, ${col}50)`,
                          borderRadius: '5px 5px 0 0',
                          height: `${pct * 100}%`, minHeight: 5,
                          cursor: 'pointer',
                          boxShadow: isHL ? `0 0 18px ${col}70` : 'none',
                          transform: isHL ? 'scaleY(1.06)' : 'scaleY(1)',
                          transformOrigin: 'bottom',
                          transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 5, marginTop: 7 }}>
                  {session.questionsAnalysis.map((_, i) => (
                    <div key={i} style={{
                      flex: 1, textAlign: 'center',
                      fontSize: 8, fontWeight: 700,
                      color: expandedQ === i ? '#4a7a9b' : '#0d1f30',
                      letterSpacing: '0.06em', transition: 'color 0.2s',
                      textTransform: 'uppercase'
                    }}>Q{i+1}</div>
                  ))}
                </div>
              </div>

              {/* ── Question Breakdown ── */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ffc857', boxShadow: '0 0 6px #ffc857' }} />
                  <p style={{ fontSize: 9, color: '#1a3050', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 800 }}>
                    Question Breakdown
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {session.questionsAnalysis.map((item, qi) => {
                    const isOpen = expandedQ === qi;
                    const pct = item.marksOutOf10 / 10;
                    const col = pct >= 0.8 ? '#4fffce' : pct >= 0.5 ? '#ffc857' : '#ff6b6b';
                    return (
                      <div
                        key={item._id || qi}
                        className="q-card"
                        style={{
                          background: isOpen ? 'rgba(10,22,38,0.95)' : 'rgba(8,18,34,0.7)',
                          border: `1px solid ${isOpen ? col + '35' : 'rgba(255,255,255,0.04)'}`,
                          borderRadius: 18, overflow: 'hidden',
                          boxShadow: isOpen ? `0 0 40px ${col}10, 0 12px 40px rgba(0,0,0,0.3)` : '0 4px 20px rgba(0,0,0,0.2)',
                          backdropFilter: 'blur(20px)',
                          transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
                        }}
                      >
                        <button
                          onClick={() => setExpandedQ(isOpen ? null : qi)}
                          style={{
                            width: '100%', background: 'transparent', border: 'none',
                            cursor: 'pointer', padding: '18px 22px',
                            display: 'flex', alignItems: 'center', gap: 18,
                            textAlign: 'left', outline: 'none',
                          }}
                        >
                          <ScoreRing score={item.marksOutOf10} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                              <span style={{ fontSize: 9, color: '#1a3050', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '0.12em' }}>Q{qi+1}</span>
                              <Badge score={item.marksOutOf10} />
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#8fa8c8', lineHeight: 1.5 }}>{item.question}</p>
                          </div>
                          <div style={{
                            flexShrink: 0, width: 30, height: 30, borderRadius: 9,
                            background: isOpen ? `${col}18` : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isOpen ? col + '35' : 'rgba(255,255,255,0.05)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isOpen ? col : '#1a3050', fontSize: 14,
                            transform: isOpen ? 'rotate(180deg)' : 'none',
                            transition: 'all 0.25s',
                          }}>⌄</div>
                        </button>

                        {isOpen && (
                          <div className="expand-anim" style={{ padding: '0 22px 22px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>

                              {/* Your Answer */}
                              <div style={{
                                background: 'rgba(3,8,15,0.7)',
                                borderRadius: 12, padding: '16px 18px',
                                borderLeft: '3px solid rgba(96,165,250,0.6)',
                              }}>
                                <p style={{ fontSize: 9, color: '#60a5fa', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 9 }}>Your Answer</p>
                                <p style={{ fontSize: 13, color: '#4a6a88', lineHeight: 1.7, fontStyle: 'italic' }}>"{item.userAnswer}"</p>
                              </div>

                              {/* AI Feedback */}
                              <div style={{
                                background: 'rgba(3,8,15,0.7)',
                                borderRadius: 12, padding: '16px 18px',
                                borderLeft: `3px solid ${col}80`,
                              }}>
                                <p style={{ fontSize: 9, color: col, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, marginBottom: 9 }}>AI Feedback</p>
                                <p style={{ fontSize: 13, color: '#4a6a88', lineHeight: 1.7 }}>{item.feedback}</p>
                              </div>

                              {/* Score bar */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <span style={{ fontSize: 10, color: '#1a3050', whiteSpace: 'nowrap', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Score</span>
                                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{
                                    width: `${pct * 100}%`, height: '100%',
                                    background: `linear-gradient(to right, ${col}cc, ${col})`,
                                    borderRadius: 3,
                                    boxShadow: `0 0 10px ${col}80`,
                                    transition: 'width 0.9s cubic-bezier(.4,0,.2,1)',
                                  }} />
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 900, color: col, fontFamily: "'JetBrains Mono', monospace", minWidth: 44, textAlign: 'right' }}>{item.marksOutOf10}/10</span>
                              </div>

                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Emotion Timeline ── */}
              {session.emotionTimeline && session.emotionTimeline.length > 0 && (
                <EmotionTimeline timeline={session.emotionTimeline} />
              )}

              {/* ── Footer ── */}
              <div style={{ marginTop: 40, textAlign: 'center', color: '#0d1f30', fontSize: 11, letterSpacing: '0.1em', fontWeight: 600 }}>
                Session recorded {new Date(session.createdAt).toLocaleString()} · {session.questionsAnalysis.length} questions evaluated
              </div>

            </div>
          )}

          {/* ── Collapsed hint ── */}
          {session && !showDetails && (
            <div style={{
              textAlign: 'center', padding: '48px 20px',
              border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 20,
              color: '#0d1f30', fontSize: 13,
              animation: 'fadeUp 0.25s ease forwards',
              background: 'rgba(8,18,34,0.4)', backdropFilter: 'blur(10px)',
            }}>
              <div style={{ fontSize: 32, marginBottom: 14, opacity: 0.5 }}>📊</div>
              <p style={{ color: '#1a3050', marginBottom: 14, fontWeight: 600 }}>Details hidden for this session</p>
              <button
                onClick={() => setShowDetails(true)}
                style={{
                  background: 'rgba(79,255,206,0.08)',
                  border: '1px solid rgba(79,255,206,0.2)',
                  borderRadius: 10, padding: '9px 22px',
                  color: '#4fffce', fontSize: 11, fontWeight: 800,
                  cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,255,206,0.14)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(79,255,206,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,255,206,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                Show Details ▸
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ScoreDisplay;