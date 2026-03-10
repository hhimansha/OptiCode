import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

// --- SVG Score Ring ---
const ScoreRing = ({ score, max = 10, size = 64, stroke = 5 }) => {
  const pct = score / max;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const color = pct >= 0.8 ? '#22d3a5' : pct >= 0.5 ? '#f59e0b' : '#f87171';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.24} fontWeight="700" fontFamily="'DM Mono', monospace"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>{score}</text>
    </svg>
  );
};

// --- Overall Gauge ---
const OverallGauge = ({ score, max = 100 }) => {
  const pct = score / max;
  const color = pct >= 0.8 ? '#22d3a5' : pct >= 0.5 ? '#f59e0b' : '#f87171';
  const label = pct >= 0.8 ? 'Excellent' : pct >= 0.6 ? 'Good' : pct >= 0.4 ? 'Fair' : 'Needs Work';
  const size = 120, stroke = 10;
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 8px ${color}80)` }} />
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central"
          fill={color} fontSize="26" fontWeight="800" fontFamily="'DM Mono', monospace"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>{score}</text>
        <text x="50%" y="66%" textAnchor="middle" dominantBaseline="central"
          fill="#64748b" fontSize="11" fontFamily="'DM Sans', sans-serif"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>/ {max}</text>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color }}>{label}</span>
    </div>
  );
};

// --- Badge ---
const Badge = ({ score }) => {
  const pct = score / 10;
  const bg = pct >= 0.8 ? '#064e3b' : pct >= 0.5 ? '#422006' : '#450a0a';
  const color = pct >= 0.8 ? '#34d399' : pct >= 0.5 ? '#fbbf24' : '#f87171';
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 700,
      padding: '2px 10px', borderRadius: 99, fontFamily: "'DM Mono', monospace",
      letterSpacing: '0.08em', border: `1px solid ${color}30`
    }}>
      {pct >= 0.8 ? '★ Strong' : pct >= 0.5 ? '◆ Average' : '▼ Weak'}
    </span>
  );
};

// --- Stat Pill ---
const StatPill = ({ label, value, color }) => (
  <div style={{
    background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
    padding: '10px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
  }}>
    <span style={{ fontSize: 20, fontWeight: 800, color: color || '#e2e8f0', fontFamily: "'DM Mono', monospace" }}>{value}</span>
    <span style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
  </div>
);

// --- Score color helper ---
const scoreColor = (score, max = 100) => {
  const pct = score / max;
  return pct >= 0.8 ? '#22d3a5' : pct >= 0.5 ? '#f59e0b' : '#f87171';
};

// --- Main Component ---
const ScoreDisplay = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/score/my-results', { withCredentials: true });
        if (response.data.success) {
          setInterviews(response.data.data);
          if (response.data.data.length > 0) setSelectedId(response.data.data[0]._id || 0);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load scores");
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const session = interviews.find((s, i) => (s._id || i) === selectedId);
  const avgScore = session
    ? (session.questionsAnalysis.reduce((a, q) => a + q.marksOutOf10, 0) / session.questionsAnalysis.length).toFixed(1)
    : 0;
  const best = session ? Math.max(...session.questionsAnalysis.map(q => q.marksOutOf10)) : 0;
  const worst = session ? Math.min(...session.questionsAnalysis.map(q => q.marksOutOf10)) : 0;

  const handleSessionSelect = (sid) => {
    if (sid === selectedId) {
      // Same session clicked → toggle details
      setShowDetails(prev => !prev);
    } else {
      // New session → select it and show details
      setSelectedId(sid);
      setShowDetails(true);
      setExpandedQ(null);
    }
    setDropdownOpen(false);
  };

  const fonts = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #060d17; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }

    .q-card { transition: transform 0.18s, box-shadow 0.18s, border-color 0.2s; }
    .q-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px #0008; }
    .session-opt { transition: background 0.15s; }
    .session-opt:hover { background: #162032 !important; }
    .expand-btn { transition: background 0.2s; }
    .expand-btn:hover { background: #0d1c2e !important; }

    .details-enter {
      animation: detailsFadeIn 0.35s cubic-bezier(.4,0,.2,1) forwards;
    }
    @keyframes detailsFadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .toggle-details-btn {
      display: flex; align-items: center; gap: 8px;
      background: transparent;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 7px 16px;
      cursor: pointer;
      color: #64748b;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
    }
    .toggle-details-btn:hover {
      border-color: #22d3a580;
      color: #22d3a5;
      background: #22d3a510;
    }
    .toggle-details-btn.active {
      border-color: #22d3a560;
      color: #22d3a5;
      background: #22d3a515;
    }

    .dropdown-trigger {
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .dropdown-trigger:hover {
      border-color: #334155 !important;
      box-shadow: 0 4px 20px #0006;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  if (loading) return (
    <>
      <style>{fonts}</style>
      <div style={{ minHeight: '100vh', background: '#060d17', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #1e293b', borderTop: '3px solid #22d3a5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: 14, letterSpacing: '0.1em' }}>LOADING RESULTS</p>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{fonts}</style>
      <div style={{ minHeight: '100vh', background: '#060d17', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 16, padding: '32px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠</div>
          <p style={{ color: '#f87171', fontSize: 16, fontWeight: 600 }}>{error}</p>
        </div>
      </div>
    </>
  );

  if (!interviews.length) return (
    <>
      <style>{fonts}</style>
      <div style={{ minHeight: '100vh', background: '#060d17', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', color: '#475569' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#94a3b8' }}>No interview sessions yet</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Complete an interview to see your results here.</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{fonts}</style>
      <div style={{ minHeight: '100vh', background: '#060d17', fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0' }}>

        {/* Top Bar */}
        <div style={{
          background: '#08111f', borderBottom: '1px solid #1a2744',
          padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
          position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #22d3a5, #3b82f6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 0 16px #22d3a540' }}>◈</div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>InterviewIQ</span>
            <span style={{ color: '#1e293b', fontSize: 18, marginLeft: 4 }}>|</span>
            <span style={{ color: '#475569', fontSize: 13 }}>Performance History</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#22d3a518', border: '1px solid #22d3a535', borderRadius: 20, padding: '4px 14px', fontSize: 12, color: '#22d3a5', fontWeight: 600 }}>
              {interviews.length} Session{interviews.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px' }}>

          {/* Session Selector */}
          <div style={{ marginBottom: 28, position: 'relative' }} ref={dropdownRef}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontSize: 11, color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                Select Session
              </p>
              {session && (
                <button
                  className={`toggle-details-btn${showDetails ? ' active' : ''}`}
                  onClick={() => setShowDetails(prev => !prev)}
                >
                  <span style={{ fontSize: 14, lineHeight: 1 }}>{showDetails ? '▾' : '▸'}</span>
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              )}
            </div>

            {/* Dropdown trigger */}
            <button
              className="dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: '100%', background: '#0a1628',
                border: `1px solid ${dropdownOpen ? '#22d3a560' : '#1e293b'}`,
                borderRadius: 14, padding: '14px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, outline: 'none',
                boxShadow: dropdownOpen ? '0 0 0 3px #22d3a518' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: session ? `${scoreColor(session.overallScore)}18` : '#1e293b',
                  border: `1px solid ${session ? scoreColor(session.overallScore) + '30' : '#334155'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                }}>📅</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>
                    {session
                      ? new Date(session.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Select a session...'}
                  </div>
                  {session && (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{session.questionsAnalysis.length} questions</span>
                      <span style={{ color: '#1e293b' }}>·</span>
                      <span style={{ color: scoreColor(session.overallScore), fontWeight: 600 }}>
                        Score: {session.overallScore}/100
                      </span>
                      <span style={{ color: '#1e293b' }}>·</span>
                      <span style={{ color: showDetails ? '#22d3a5' : '#475569' }}>
                        {showDetails ? 'Details visible' : 'Details hidden'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <span style={{
                color: '#64748b', fontSize: 18,
                transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s', display: 'inline-block'
              }}>⌄</span>
            </button>

            {/* Dropdown list */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                background: '#0a1628', border: '1px solid #1e293b', borderRadius: 14,
                zIndex: 200, overflow: 'hidden', boxShadow: '0 24px 64px #000c',
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
                          padding: '12px 20px', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          background: isActive ? '#0f1e33' : 'transparent',
                          borderLeft: `3px solid ${isActive ? sc : 'transparent'}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          {/* Mini score bar */}
                          <div style={{ position: 'relative', width: 36, height: 36 }}>
                            <svg width={36} height={36} style={{ transform: 'rotate(-90deg)' }}>
                              <circle cx={18} cy={18} r={14} fill="none" stroke="#1e293b" strokeWidth={3} />
                              <circle cx={18} cy={18} r={14} fill="none" stroke={sc} strokeWidth={3}
                                strokeDasharray={`${2 * Math.PI * 14 * pct} ${2 * Math.PI * 14}`}
                                strokeLinecap="round" />
                            </svg>
                            <span style={{
                              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 800, color: sc, fontFamily: "'DM Mono', monospace"
                            }}>{s.overallScore}</span>
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#e2e8f0' : '#94a3b8' }}>
                              {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                              {s.questionsAnalysis.length} questions
                              {isActive && (
                                <span style={{ marginLeft: 8, color: showDetails ? '#22d3a5' : '#475569' }}>
                                  {showDetails ? '● showing' : '○ hidden'} — click to toggle
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {isActive && (
                            <span style={{ fontSize: 10, color: sc, fontWeight: 700, letterSpacing: '0.08em',
                              background: `${sc}18`, border: `1px solid ${sc}30`, borderRadius: 6, padding: '3px 8px' }}>
                              ACTIVE
                            </span>
                          )}
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 16, fontWeight: 800, color: sc, fontFamily: "'DM Mono', monospace" }}>{s.overallScore}</span>
                            <span style={{ fontSize: 11, color: '#475569' }}>/100</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Session details (toggleable) ── */}
          {session && showDetails && (
            <div className="details-enter">

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
                <div style={{
                  background: '#0a1628', border: '1px solid #1e293b', borderRadius: 16, padding: '20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
                }}>
                  <OverallGauge score={session.overallScore} />
                  <span style={{ fontSize: 10, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Overall Score</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, gridColumn: '2 / 5' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <StatPill label="Avg / Question" value={avgScore} color="#22d3a5" />
                    <StatPill label="Best Answer" value={`${best}/10`} color="#34d399" />
                    <StatPill label="Weakest Answer" value={`${worst}/10`} color="#f87171" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    <StatPill label="Questions" value={session.questionsAnalysis.length} color="#94a3b8" />
                    <StatPill label="Session Date" value={new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} color="#94a3b8" />
                    <StatPill label="Task" value={session.task || '—'} color="#3b82f6" />
                    <StatPill label="Code" value={session.code || '—'} color="#f59e0b" />
                  </div>
                </div>
              </div>

              {/* Skill Level pill (if present) */}
              {session.skillLevel && (
                <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Skill Level</span>
                  <span style={{
                    background: '#2e1065', color: '#a78bfa', border: '1px solid #6d28d930',
                    borderRadius: 8, padding: '4px 14px', fontSize: 13, fontWeight: 700,
                    fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em'
                  }}>{session.skillLevel}</span>
                </div>
              )}

              {/* Score Distribution */}
              <div style={{ background: '#0a1628', border: '1px solid #1e293b', borderRadius: 16, padding: '20px 24px', marginBottom: 28 }}>
                <p style={{ fontSize: 11, color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>
                  Score Distribution
                </p>
                <div style={{ display: 'flex', gap: 6, height: 56, alignItems: 'flex-end' }}>
                  {session.questionsAnalysis.map((q, i) => {
                    const pct = q.marksOutOf10 / 10;
                    const col = pct >= 0.8 ? '#22d3a5' : pct >= 0.5 ? '#f59e0b' : '#f87171';
                    const isHighlighted = expandedQ === i;
                    return (
                      <div
                        key={i}
                        title={`Q${i + 1}: ${q.marksOutOf10}/10`}
                        onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                        style={{
                          flex: 1, background: isHighlighted ? col : col + '99',
                          borderRadius: '4px 4px 0 0',
                          height: `${pct * 100}%`, minHeight: 4, cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: isHighlighted ? `0 0 14px ${col}90` : 'none',
                          transform: isHighlighted ? 'scaleY(1.04)' : 'scaleY(1)',
                          transformOrigin: 'bottom',
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {session.questionsAnalysis.map((_, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: expandedQ === i ? '#94a3b8' : '#334155', transition: 'color 0.2s' }}>Q{i + 1}</div>
                  ))}
                </div>
              </div>

              {/* Questions List */}
              <div>
                <p style={{ fontSize: 11, color: '#475569', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>
                  Question Breakdown
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {session.questionsAnalysis.map((item, qi) => {
                    const isOpen = expandedQ === qi;
                    const pct = item.marksOutOf10 / 10;
                    const col = pct >= 0.8 ? '#22d3a5' : pct >= 0.5 ? '#f59e0b' : '#f87171';
                    return (
                      <div
                        key={item._id || qi}
                        className="q-card"
                        style={{
                          background: '#0a1628',
                          border: `1px solid ${isOpen ? col + '50' : '#1a2744'}`,
                          borderRadius: 14, overflow: 'hidden',
                          boxShadow: isOpen ? `0 0 28px ${col}12` : 'none',
                        }}
                      >
                        <button
                          className="expand-btn"
                          onClick={() => setExpandedQ(isOpen ? null : qi)}
                          style={{
                            width: '100%', background: 'transparent', border: 'none',
                            cursor: 'pointer', padding: '16px 20px',
                            display: 'flex', alignItems: 'center', gap: 16,
                            textAlign: 'left', outline: 'none', borderRadius: 14
                          }}
                        >
                          <ScoreRing score={item.marksOutOf10} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <span style={{ fontSize: 10, color: '#475569', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>Q{qi + 1}</span>
                              <Badge score={item.marksOutOf10} />
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1', lineHeight: 1.4 }}>{item.question}</p>
                          </div>
                          <div style={{
                            flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                            background: isOpen ? `${col}20` : '#1e293b',
                            border: `1px solid ${isOpen ? col + '40' : 'transparent'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isOpen ? col : '#64748b', fontSize: 14,
                            transform: isOpen ? 'rotate(180deg)' : 'none',
                            transition: 'all 0.25s'
                          }}>⌄</div>
                        </button>

                        {isOpen && (
                          <div style={{ padding: '0 20px 20px', borderTop: '1px solid #1a2744', animation: 'detailsFadeIn 0.25s ease forwards' }}>
                            <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

                              <div style={{ background: '#060d17', borderRadius: 10, padding: '14px 16px', borderLeft: '3px solid #3b82f6' }}>
                                <p style={{ fontSize: 10, color: '#3b82f6', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Your Answer</p>
                                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, fontStyle: 'italic' }}>"{item.userAnswer}"</p>
                              </div>

                              <div style={{ background: '#060d17', borderRadius: 10, padding: '14px 16px', borderLeft: `3px solid ${col}` }}>
                                <p style={{ fontSize: 10, color: col, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>AI Feedback</p>
                                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65 }}>{item.feedback}</p>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <span style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap' }}>Score</span>
                                <div style={{ flex: 1, height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{
                                    width: `${pct * 100}%`, height: '100%', background: col,
                                    borderRadius: 3, boxShadow: `0 0 8px ${col}80`,
                                    transition: 'width 0.8s cubic-bezier(.4,0,.2,1)'
                                  }} />
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: col, fontFamily: "'DM Mono', monospace", minWidth: 40, textAlign: 'right' }}>{item.marksOutOf10}/10</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: 32, textAlign: 'center', color: '#2d3f57', fontSize: 12, letterSpacing: '0.06em' }}>
                Session recorded {new Date(session.createdAt).toLocaleString()} · {session.questionsAnalysis.length} questions evaluated
              </div>
            </div>
          )}

          {/* Collapsed hint */}
          {session && !showDetails && (
            <div style={{
              textAlign: 'center', padding: '32px 20px',
              border: '1px dashed #1e293b', borderRadius: 16,
              color: '#334155', fontSize: 13,
              animation: 'detailsFadeIn 0.25s ease forwards'
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
              <p style={{ color: '#475569', marginBottom: 6 }}>Details are hidden for this session.</p>
              <button
                onClick={() => setShowDetails(true)}
                style={{
                  background: '#22d3a518', border: '1px solid #22d3a540', borderRadius: 8,
                  padding: '7px 18px', color: '#22d3a5', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.06em',
                  marginTop: 4
                }}
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