import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const Interviewquestion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [interviews, setInterviews] = useState([]);

  const createInterview = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/question/generate-questions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (response.ok) {
        navigate("/livekit");
      } else {
        console.error("Interview creation failed");
      }
    } catch (error) {
      console.error("Server error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#030507", fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        /* ── Scrollbar ── */
        .scroll::-webkit-scrollbar { width: 3px; }
        .scroll::-webkit-scrollbar-track { background: transparent; }
        .scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #7c3aed);
          border-radius: 10px;
        }

        /* ── Animated BG ── */
        @keyframes bgDrift {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .bg-anim {
          background: linear-gradient(-45deg, #030507, #05080f, #070e1e, #030507);
          background-size: 400% 400%;
          animation: bgDrift 22s ease infinite;
        }

        /* ── Entrance ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a1 { animation: fadeUp 0.5s 0.05s ease both; }
        .a2 { animation: fadeUp 0.5s 0.15s ease both; }
        .a3 { animation: fadeUp 0.5s 0.25s ease both; }

        /* ── Spin ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        /* ── Orb float ── */
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(25px,-20px) scale(1.05); }
          66%      { transform: translate(-18px,12px) scale(0.97); }
        }
        .orb { border-radius: 50%; filter: blur(130px); animation: orbFloat 14s ease infinite; pointer-events: none; }

        /* ── Online dot pulse ── */
        @keyframes dotGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.55); }
          50%      { box-shadow: 0 0 0 6px rgba(74,222,128,0); }
        }
        .online-dot {
          width: 12px; height: 12px; border-radius: 50%;
          background: #4ade80;
          border: 2.5px solid #060d1a;
          animation: dotGlow 2s ease infinite;
        }

        /* ── Avatar ring pulse ── */
        @keyframes ringPulse {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.65); opacity: 0; }
        }
        .avatar-ring {
          position: absolute; inset: -4px; border-radius: 50%;
          border: 1.5px solid rgba(6,182,212,0.55);
          animation: ringPulse 2.8s ease-out infinite;
        }

        /* ── Welcome card ── */
        .welcome-card {
          position: relative;
          background: linear-gradient(145deg,
            rgba(6,182,212,0.055) 0%,
            rgba(255,255,255,0.018) 50%,
            rgba(124,58,237,0.04) 100%);
          border: 1px solid rgba(255,255,255,0.075);
          border-radius: 22px;
          padding: 28px 32px;
          overflow: hidden;
          backdrop-filter: blur(24px);
        }
        .welcome-card::before {
          content: '';
          position: absolute; top: -90px; right: -70px;
          width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .welcome-card::after {
          content: '';
          position: absolute; bottom: -70px; left: 15%;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 65%);
          pointer-events: none;
        }

        /* ── Section bar ── */
        .section-bar {
          width: 3px; height: 22px; border-radius: 4px;
          background: linear-gradient(180deg, #06b6d4, #7c3aed);
        }

        /* ── Glass card ── */
        .g-card {
          position: relative;
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(255,255,255,0.055);
          border-radius: 20px;
          backdrop-filter: blur(14px);
          overflow: hidden;
          text-align: left;
          cursor: pointer;
          transition: transform 0.38s cubic-bezier(0.34,1.56,0.64,1),
                      border-color 0.28s ease,
                      box-shadow 0.28s ease;
        }
        .g-card:hover  { transform: translateY(-7px); }
        .g-card:active { transform: translateY(-2px) scale(0.99); }

        /* Radial inner glow on hover */
        .g-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 20px;
          opacity: 0; transition: opacity 0.3s; pointer-events: none;
        }

        /* Shimmer sweep */
        .sweep {
          position: absolute; top: 0; left: 0;
          width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.028), transparent);
          transform: translateX(-100%); pointer-events: none;
        }
        .g-card:hover .sweep { transform: translateX(230%); transition: transform 0.75s ease; }

        /* Cyan variant */
        .card-c:hover {
          border-color: rgba(6,182,212,0.42);
          box-shadow: 0 28px 70px rgba(0,0,0,0.6),
                      0 0 0 1px rgba(6,182,212,0.08),
                      inset 0 1px 0 rgba(6,182,212,0.1);
        }
        .card-c::before { background: radial-gradient(ellipse at 10% 10%, rgba(6,182,212,0.07) 0%, transparent 55%); }
        .card-c:hover::before { opacity: 1; }

        /* Violet variant */
        .card-v:hover {
          border-color: rgba(124,58,237,0.42);
          box-shadow: 0 28px 70px rgba(0,0,0,0.6),
                      0 0 0 1px rgba(124,58,237,0.08),
                      inset 0 1px 0 rgba(124,58,237,0.1);
        }
        .card-v::before { background: radial-gradient(ellipse at 10% 10%, rgba(124,58,237,0.07) 0%, transparent 55%); }
        .card-v:hover::before { opacity: 1; }

        /* Bottom accent glow line */
        .glow-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          opacity: 0; transition: opacity 0.3s;
        }
        .glow-line-c { background: linear-gradient(90deg, transparent, rgba(6,182,212,0.7), transparent); }
        .glow-line-v { background: linear-gradient(90deg, transparent, rgba(124,58,237,0.7), transparent); }
        .card-c:hover .glow-line-c,
        .card-v:hover .glow-line-v { opacity: 1; }

        /* ── Icon box ── */
        .icon-box {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
        }
        .icon-box-c {
          background: linear-gradient(135deg, #0891b2, #06b6d4);
          box-shadow: 0 4px 18px rgba(6,182,212,0.22);
        }
        .icon-box-v {
          background: linear-gradient(135deg, #6d28d9, #7c3aed);
          box-shadow: 0 4px 18px rgba(124,58,237,0.22);
        }
        .card-c:hover .icon-box-c {
          transform: scale(1.12) rotate(-7deg);
          box-shadow: 0 10px 30px rgba(6,182,212,0.5);
        }
        .card-v:hover .icon-box-v {
          transform: scale(1.12) rotate(7deg);
          box-shadow: 0 10px 30px rgba(124,58,237,0.5);
        }

        /* ── Arrow ── */
        .arrow {
          color: #1e293b;
          transition: color 0.3s, transform 0.3s;
        }
        .card-c:hover .arrow { color: #06b6d4; transform: translateX(4px); }
        .card-v:hover .arrow { color: #a78bfa; transform: translateX(4px); }

        /* ── Load bar ── */
        @keyframes loadBar {
          0%   { width: 0%; }
          100% { width: 92%; }
        }
        .load-bar {
          height: 2px; border-radius: 2px;
          background: linear-gradient(90deg, #06b6d4, #7c3aed);
          animation: loadBar 2.5s ease forwards;
        }

        /* ── Dot grid bg ── */
        .dot-grid {
          background-image: radial-gradient(rgba(6,182,212,0.10) 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar onCreateInterview={createInterview} loading={loading} />

      {/* Main */}
      <div className="flex-1" style={{ position: "relative", overflow: "hidden" }}>

        {/* Layered background */}
        <div className="bg-anim" style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <div className="dot-grid" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />
          <div className="orb" style={{ position: "absolute", top: -120, right: -100, width: 520, height: 520, background: "rgba(6,182,212,0.055)" }} />
          <div className="orb" style={{ position: "absolute", bottom: -120, left: -100, width: 520, height: 520, background: "rgba(124,58,237,0.055)", animationDelay: "-5s" }} />
          <div className="orb" style={{ position: "absolute", top: "35%", left: "35%", width: 320, height: 320, background: "rgba(6,182,212,0.025)", animationDelay: "-10s" }} />
          {/* Subtle horizontal lines */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.015,
            backgroundImage: "repeating-linear-gradient(0deg, #06b6d4 0px, #06b6d4 1px, transparent 1px, transparent 60px)"
          }} />
        </div>

        {/* Scroll area */}
        <div className="scroll" style={{ position: "relative", zIndex: 1, height: "100vh", overflowY: "auto", padding: "32px 36px" }}>
          <div style={{ maxWidth: 880, margin: "0 auto" }}>

            {/* ── Welcome Card ── */}
            <div className="welcome-card a1" style={{ marginBottom: 28 }}>
              <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 600, color: "#f1f5f9", margin: "0 0 6px", lineHeight: 1.2 }}>
                    Welcome Back,{" "}
                    <span style={{
                      background: "linear-gradient(90deg, #06b6d4 0%, #818cf8 100%)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                    }}>navinda</span>
                  </h1>
                  <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
                    AI-Driven Interviews, Hassle-Free Hiring
                  </p>
                </div>

                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div className="avatar-ring" />
                  <div style={{
                    width: 60, height: 60, borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #0d9488)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, fontWeight: 600, color: "white",
                    boxShadow: "0 0 28px rgba(16,185,129,0.28)"
                  }}>S</div>
                  <div className="online-dot" style={{ position: "absolute", bottom: 2, right: 2 }} />
                </div>
              </div>
            </div>

            {/* ── Dashboard ── */}
            <div className="a2">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <div className="section-bar" />
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>Dashboard</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

                {/* ── Create Interview Card ── */}
                <button
                  onClick={createInterview}
                  disabled={loading}
                  className="g-card card-c"
                  onMouseEnter={() => setHoveredCard("interview")}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    padding: "26px", border: "none", width: "100%",
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  <div className="sweep" />
                  <div className="glow-line glow-line-c" />

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div className="icon-box icon-box-c">
                      <svg width="22" height="22" fill="none" stroke="white" strokeWidth="1.6" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <svg className="arrow" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  <h3 style={{
                    fontSize: 16, fontWeight: 600, margin: "0 0 8px",
                    color: hoveredCard === "interview" ? "#06b6d4" : "#e2e8f0",
                    transition: "color 0.3s"
                  }}>
                    {loading ? "Creating Interview..." : "Create New Interview"}
                  </h3>

                  <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                    Create AI Interviews and schedule them with Candidates
                  </p>

                  {loading && (
                    <div style={{ marginTop: 18 }}>
                      <div style={{ background: "rgba(6,182,212,0.08)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                        <div className="load-bar" />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <svg className="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                        </svg>
                        <span className="mono" style={{ fontSize: 11, color: "#06b6d4" }}>Generating questions...</span>
                      </div>
                    </div>
                  )}
                </button>

                {/* ── Phone Screening Card ── */}
                <button
                  className="g-card card-v a3"
                  onMouseEnter={() => setHoveredCard("phone")}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ padding: "26px", border: "none", width: "100%" }}
                >
                  <div className="sweep" />
                  <div className="glow-line glow-line-v" />

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div className="icon-box icon-box-v">
                      <svg width="22" height="22" fill="none" stroke="white" strokeWidth="1.6" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <svg className="arrow" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  <h3 style={{
                    fontSize: 16, fontWeight: 600, margin: "0 0 8px",
                    color: hoveredCard === "phone" ? "#a78bfa" : "#e2e8f0",
                    transition: "color 0.3s"
                  }}>
                    Create Phone Screening Call
                  </h3>

                  <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                    Schedule and automate AI-powered phone screening for candidates
                  </p>
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Interviewquestion;