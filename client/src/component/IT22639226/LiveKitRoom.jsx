"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  LiveKitRoom,
  useVoiceAssistant,
  useChat,
  RoomAudioRenderer,
  ConnectionStateToast,
} from "@livekit/components-react";
import "@livekit/components-styles";

export default function VoiceAssistantPage() {
  const [roomDetails, setRoomDetails] = useState(null);
  const [shouldConnect, setShouldConnect] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const userId = useMemo(() => `user-${Math.random().toString(36).slice(2, 8)}`, []);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const response = await fetch(`http://localhost:5000/api/livekit?userId=${userId}`, {
        method: 'GET', credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to connect to voice agent");
      setRoomDetails(data);
      setShouldConnect(true);
    } catch (err) {
      setError(err.message);
      setShouldConnect(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => { setShouldConnect(false); setRoomDetails(null); };
  const onDeviceFailure = () => { setError("Microphone permission denied! Please allow mic access and reload."); handleDisconnect(); };

  return (
    <div className="root-container">
      <GlobalStyles />
      <div className="bg-canvas">
        <div className="bg-grid" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="relative z-10 w-full h-screen">
        {(!shouldConnect || !roomDetails) ? (
          <LandingScreen isLoading={isLoading} error={error} onConnect={handleConnect} />
        ) : (
          <LiveKitRoom
            token={roomDetails.token}
            connect={shouldConnect}
            audio={false}
            video={false}
            serverUrl={import.meta.env.VITE_LK_SERVER_URL}
            onMediaDeviceFailure={onDeviceFailure}
            onDisconnected={handleDisconnect}
            className="w-full h-full"
          >
            <InterviewInterface onEndCall={handleDisconnect} userId={userId} />
            <RoomAudioRenderer />
            <ConnectionStateToast />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Figtree:wght@300;400;500;600;700&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --ink: #eef2f8;
        --ink-muted: #6a7a96;
        --ink-dim: #2e3a4e;
        --surface: #070c15;
        --surface-1: #0c1220;
        --surface-2: #111928;
        --surface-3: #182030;
        --border: rgba(255,255,255,0.055);
        --border-bright: rgba(255,255,255,0.1);
        --accent-a: #00c8f0;
        --accent-b: #6d3ce8;
        --accent-c: #f0a500;
        --accent-g: #00e89a;
        --glow-a: rgba(0,200,240,0.18);
        --glow-b: rgba(109,60,232,0.15);
        --font-body: 'Figtree', sans-serif;
        --font-display: 'Syne', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
        --r-sm: 8px;
        --r-md: 14px;
        --r-lg: 20px;
        --r-xl: 28px;
        --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
        --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
      }

      html, body { height: 100%; overflow: hidden; }
      body { font-family: var(--font-body); background: var(--surface); color: var(--ink); -webkit-font-smoothing: antialiased; }

      .root-container { position: relative; width: 100%; height: 100vh; overflow: hidden; }

      .bg-canvas {
        position: fixed; inset: 0; z-index: 0;
        background: radial-gradient(ellipse 70% 55% at 15% 5%, rgba(0,60,110,0.22) 0%, transparent 65%),
                    radial-gradient(ellipse 55% 45% at 85% 95%, rgba(70,0,150,0.18) 0%, transparent 65%),
                    var(--surface);
      }
      .bg-grid {
        position: absolute; inset: 0;
        background-image: linear-gradient(rgba(0,200,240,0.022) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,200,240,0.022) 1px, transparent 1px);
        background-size: 52px 52px;
        mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 10%, transparent 85%);
      }
      .bg-orb { position: absolute; border-radius: 50%; filter: blur(110px); pointer-events: none; animation: orbDrift 22s ease-in-out infinite; }
      .bg-orb-1 { width: 550px; height: 550px; top: -12%; left: -8%; background: rgba(0,170,240,0.07); animation-delay: 0s; }
      .bg-orb-2 { width: 480px; height: 480px; bottom: -18%; right: -8%; background: rgba(90,0,210,0.08); animation-delay: -8s; }
      .bg-orb-3 { width: 380px; height: 380px; top: 38%; left: 38%; background: rgba(0,90,170,0.05); animation-delay: -16s; }

      @keyframes orbDrift {
        0%,100% { transform: translate(0,0) scale(1); }
        33% { transform: translate(35px,-25px) scale(1.04); }
        66% { transform: translate(-18px,18px) scale(0.97); }
      }
      @keyframes pulse-ring {
        0% { transform: scale(0.88); opacity: 0.85; }
        100% { transform: scale(2.4); opacity: 0; }
      }
      @keyframes float-y {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-9px); }
      }
      @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      @keyframes bar-wave {
        0%,100% { transform: scaleY(0.2); }
        50% { transform: scaleY(1); }
      }
      @keyframes shimmer-move {
        0% { background-position: -300% center; }
        100% { background-position: 300% center; }
      }
      @keyframes fade-up {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes glow-breathe {
        0%,100% { box-shadow: 0 0 18px var(--glow-a), 0 0 50px var(--glow-a); }
        50% { box-shadow: 0 0 36px rgba(0,200,240,0.28), 0 0 90px rgba(0,200,240,0.14); }
      }
      @keyframes dot-bounce {
        0%,80%,100% { transform: scale(0.55); opacity: 0.35; }
        40% { transform: scale(1); opacity: 1; }
      }
      @keyframes scan {
        0% { top: -2px; opacity: 0; }
        5% { opacity: 1; }
        95% { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
      @keyframes word-appear {
        from { opacity: 0; transform: translateY(4px) scale(0.95); filter: blur(2px); }
        to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      .glass {
        background: rgba(12,18,32,0.72);
        backdrop-filter: blur(28px) saturate(1.6);
        border: 1px solid var(--border-bright);
      }
      .glass-light {
        background: rgba(255,255,255,0.035);
        backdrop-filter: blur(16px);
        border: 1px solid var(--border);
      }
      .scrollbar::-webkit-scrollbar { width: 3px; }
      .scrollbar::-webkit-scrollbar-track { background: transparent; }
      .scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(var(--accent-a), var(--accent-b)); border-radius: 99px; }
      .mono { font-family: var(--font-mono); }
      .label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; }

      /* Animated word bubbles for speech */
      .word-token {
        display: inline-block;
        animation: word-appear 0.22s var(--ease-spring) both;
      }
    `}</style>
  );
}

/* ════════════════════════════════════════════════
   LANDING SCREEN
════════════════════════════════════════════════ */
function LandingScreen({ isLoading, error, onConnect }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', flexDirection: 'column', gap: '28px' }}>
      <style>{`
        .landing-card { position: relative; width: 100%; max-width: 430px; border-radius: var(--r-xl); animation: fade-up 0.55s var(--ease-out) both; }
        .landing-card-inner { position: relative; border-radius: var(--r-xl); padding: 50px 42px 42px; overflow: hidden; }
        .card-scan { position: absolute; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--accent-a), transparent); animation: scan 4.5s ease-in-out infinite; pointer-events: none; }
        .avatar-wrap { position: relative; width: 90px; height: 90px; margin: 0 auto 34px; }
        .avatar-ring { position: absolute; inset: -18px; border-radius: 50%; border: 1px solid rgba(0,200,240,0.18); animation: spin-slow 13s linear infinite; }
        .avatar-ring-dot { position: absolute; width: 7px; height: 7px; background: var(--accent-a); border-radius: 50%; top: 50%; left: -3.5px; transform: translateY(-50%); box-shadow: 0 0 12px var(--accent-a); }
        .avatar-ring-2 { position: absolute; inset: -30px; border-radius: 50%; border: 1px dashed rgba(109,60,232,0.14); animation: spin-rev 22s linear infinite; }
        .avatar-core { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, rgba(0,200,240,0.12), rgba(109,60,232,0.12)); border: 1.5px solid rgba(0,200,240,0.28); display: flex; align-items: center; justify-content: center; animation: glow-breathe 3.5s ease-in-out infinite; }
        .pulse-rings .ring { position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(0,200,240,0.35); animation: pulse-ring 3.2s ease-out infinite; }
        .pulse-rings .ring:nth-child(2) { animation-delay: 1.06s; }
        .pulse-rings .ring:nth-child(3) { animation-delay: 2.12s; }
        .connect-btn { position: relative; width: 100%; padding: 17px 24px; border-radius: var(--r-md); border: none; cursor: pointer; font-family: var(--font-display); font-size: 15px; font-weight: 700; letter-spacing: 0.02em; overflow: hidden; transition: transform 0.22s var(--ease-spring), box-shadow 0.22s; }
        .connect-btn:hover:not(:disabled) { transform: translateY(-3px) scale(1.015); box-shadow: 0 12px 40px rgba(0,200,240,0.25); }
        .connect-btn:active:not(:disabled) { transform: scale(0.98); }
        .connect-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-gradient { position: absolute; inset: 0; background: linear-gradient(135deg, var(--accent-a), #0070e0 50%, var(--accent-b)); }
        .btn-shimmer { position: absolute; inset: 0; background: linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.18) 50%, transparent 80%); background-size: 300% 100%; animation: shimmer-move 2.8s ease infinite; }
        .btn-text { position: relative; display: flex; align-items: center; justify-content: center; gap: 10px; color: #fff; }
        .stat-pill { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 8px; border-radius: var(--r-md); background: rgba(255,255,255,0.025); border: 1px solid var(--border); transition: all 0.22s; }
        .stat-pill:hover { background: rgba(0,200,240,0.06); border-color: rgba(0,200,240,0.22); transform: translateY(-2px); }
        .error-box { margin-top: 14px; padding: 12px 16px; border-radius: var(--r-md); background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); color: #f87171; font-size: 12px; display: flex; align-items: center; gap: 8px; }
      `}</style>

      <div className="landing-card">
        <div style={{ position: 'absolute', inset: '-1px', borderRadius: 'var(--r-xl)', background: 'linear-gradient(135deg, rgba(0,200,240,0.28), transparent 50%, rgba(109,60,232,0.2))', padding: '1px' }}>
          <div style={{ background: 'var(--surface-1)', borderRadius: 'calc(var(--r-xl) - 1px)', width: '100%', height: '100%' }} />
        </div>
        <div className="landing-card-inner glass">
          <div className="card-scan" />
          <div className="avatar-wrap">
            <div className="pulse-rings"><div className="ring" /><div className="ring" /><div className="ring" /></div>
            <div className="avatar-ring"><div className="avatar-ring-dot" /></div>
            <div className="avatar-ring-2" />
            <div className="avatar-core" style={{ animation: 'float-y 4.5s ease-in-out infinite' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-a)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div className="label" style={{ color: 'var(--accent-a)', marginBottom: '10px', opacity: 0.75 }}>◆ AI-POWERED ASSESSMENT</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1.12, marginBottom: '12px' }}>
              Interview<br />
              <span style={{ background: 'linear-gradient(135deg, var(--accent-a), #5b9fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intelligence</span>
            </h1>
            <p style={{ color: 'var(--ink-muted)', fontSize: '13.5px', lineHeight: 1.65, maxWidth: '275px', margin: '0 auto' }}>
              Real-time voice-driven mock interviews with adaptive AI and emotion-aware feedback.
            </p>
          </div>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-bright), transparent)', marginBottom: '28px' }} />
          <button className="connect-btn" onClick={onConnect} disabled={isLoading}>
            <div className="btn-gradient" />
            <div className="btn-shimmer" />
            <div className="btn-text">
              {isLoading ? (
                <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin-slow 0.75s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Connecting…</>
              ) : (
                <>Begin Session <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
              )}
            </div>
          </button>
          {error && <div className="error-box"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
          <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
            {[{ icon: '🎤', label: 'Voice AI', sub: 'Real-time STT' }, { icon: '⚡', label: 'Low Latency', sub: '<200ms' }, { icon: '🎯', label: 'Adaptive', sub: 'Smart Q&A' }].map((s, i) => (
              <div key={i} className="stat-pill">
                <div style={{ fontSize: '18px' }}>{s.icon}</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{s.label}</div>
                <div className="label" style={{ color: 'var(--ink-dim)', fontSize: '9px' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="label" style={{ color: 'var(--ink-dim)', opacity: 0.5 }}>Powered by LiveKit · Anthropic · DeepFace</p>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ANIMATED TRANSCRIPT TEXT
════════════════════════════════════════════════ */
function AnimatedText({ text, isPartial }) {
  const words = text.split(' ').filter(Boolean);
  return (
    <span>
      {words.map((word, i) => (
        <span
          key={i}
          className="word-token"
          style={{ animationDelay: isPartial ? `${i * 0.04}s` : '0s', marginRight: '0.28em' }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

/* ════════════════════════════════════════════════
   INTERVIEW INTERFACE
════════════════════════════════════════════════ */
function InterviewInterface({ onEndCall, userId }) {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { messages: chatMessages, send: sendChatMessage } = useChat();

  const [conversation, setConversation] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [agentPartialTranscript, setAgentPartialTranscript] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [interviewTime, setInterviewTime] = useState(0);
  const [emotionData, setEmotionData] = useState(null);
  const [taskData, setTaskData] = useState(null);
  const [showEndButton, setShowEndButton] = useState(false);
  const [isInterviewEnded, setIsInterviewEnded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeMessage, setAnalyzeMessage] = useState(null);
  const [taskCollapsed, setTaskCollapsed] = useState(false);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const conversationEndRef = useRef(null);
  const lastMessageIdRef = useRef(0);
  const lastAgentTranscriptionIdRef = useRef(null);
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const newH = Math.min(ta.scrollHeight, 160);
    ta.style.height = newH + 'px';
  }, [draftMessage]);

  const checkInterviewEnd = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("interview is now over") || lower.includes("waiting for your marks") ||
        lower.includes("have been recorded") || lower.includes("answers to all questions")) {
      setShowEndButton(true);
    }
  };

  useEffect(() => {
    const fetchLatestSession = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/student-progress/latest', { method: 'GET', credentials: 'include' });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) setTaskData(result.data);
        }
      } catch (error) { console.error("Error fetching task data:", error); }
    };
    fetchLatestSession();
  }, []);

  const handleEndCall = async () => {
    if (conversation.length > 0) {
      try {
        await fetch('http://localhost:5000/api/interview/save-history', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ conversation, duration: interviewTime })
        });
      } catch (error) { console.error("Failed to save chat history:", error); }
    }
    setIsInterviewEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalyzeMessage(null);
    try {
      const response = await fetch('http://localhost:5000/api/score/analyze', { method: 'GET', credentials: 'include' });
      const data = await response.json();
      setAnalyzeMessage(response.ok
        ? { type: 'success', text: 'Analysis complete — results are ready.' }
        : { type: 'error', text: data.message || 'Failed to analyze.' });
    } catch {
      setAnalyzeMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally { setIsAnalyzing(false); }
  };

  const handleSendMessage = async () => {
    if (!draftMessage.trim()) return;
    if (sendChatMessage) await sendChatMessage(draftMessage);
    setConversation(prev => [...prev, {
      speaker: "user", text: draftMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotion: emotionData ? emotionData.emotion : 'Neutral'
    }]);
    setDraftMessage("");
  };

  useEffect(() => {
    timerRef.current = setInterval(() => setInterviewTime(prev => prev + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  useEffect(() => { initializeCamera(); }, []);

  const initializeCamera = async () => {
    if (isCameraOn) return;
    setIsCameraLoading(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user", frameRate: { ideal: 30 } }, audio: false });
      mediaStreamRef.current = stream;
      setIsCameraOn(true);
    } catch {
      setCameraError("Camera access denied");
      setIsCameraOn(false);
    } finally { setIsCameraLoading(false); }
  };

  useEffect(() => {
    if (isCameraOn && mediaStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraOn]);

  useEffect(() => {
    if (!isCameraOn) return;
    let ws;
    const start = async () => {
      ws = new WebSocket('ws://localhost:8000/ws/emotion');
      wsRef.current = ws;
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status === 'success') setEmotionData(data);
          else setEmotionData(null);
        } catch (e) {}
      };
      const iv = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
          const video = videoRef.current, canvas = canvasRef.current;
          if (video.readyState === 4) {
            const ctx = canvas.getContext('2d');
            canvas.width = 320; canvas.height = 240;
            ctx.drawImage(video, 0, 0, 320, 240);
            if (ws.readyState === WebSocket.OPEN) ws.send(canvas.toDataURL('image/jpeg', 0.7));
          }
        }
      }, 100);
      return () => { clearInterval(iv); if (ws.readyState === WebSocket.OPEN) ws.close(); };
    };
    start();
    return () => { if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.close(); };
  }, [isCameraOn]);

  const emotionEmoji = { 'Angry':'😠','Disgust':'🤢','Fear':'😱','Happy':'😄','Sad':'😢','Surprise':'😲','Neutral':'😐' };
  const emotionColor = { 'Angry':'#f87171','Disgust':'#a3e635','Fear':'#c084fc','Happy':'#fbbf24','Sad':'#60a5fa','Surprise':'#fb923c','Neutral':'#94a3b8' };

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.close();
    };
  }, []);

  useEffect(() => { conversationEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation, agentPartialTranscript]);

  useEffect(() => {
    if (!agentTranscriptions?.length) return;
    const latest = agentTranscriptions[agentTranscriptions.length - 1];
    if (!latest.final) {
      setAgentPartialTranscript(latest.text);
    } else if (latest.id !== lastAgentTranscriptionIdRef.current) {
      lastAgentTranscriptionIdRef.current = latest.id;
      setConversation(prev => [...prev, { speaker: "ai", text: latest.text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      checkInterviewEnd(latest.text);
      setAgentPartialTranscript("");
    }
  }, [agentTranscriptions]);

  useEffect(() => {
    if (!chatMessages?.length) return;
    const last = chatMessages[chatMessages.length - 1];
    if (last.timestamp !== lastMessageIdRef.current && !last.from?.isLocal) {
      lastMessageIdRef.current = last.timestamp;
      setConversation(prev => [...prev, { speaker: "ai", text: last.message, timestamp: new Date(last.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      checkInterviewEnd(last.message);
    }
  }, [chatMessages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      if (interim) setPartialTranscript(interim);
      if (final) { setDraftMessage(prev => prev ? prev + ' ' + final : final); setPartialTranscript(""); setIsSpeaking(false); }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
      if (state === "listening") setTimeout(() => { try { recognition.start(); } catch(e){} }, 100);
    };
    return () => recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      if (state === "listening" && !isInterviewEnded) {
        if (!isListening) setTimeout(() => { try { recognition.start(); } catch(e){} }, 500);
      } else if (state === "speaking" || state === "thinking" || isInterviewEnded) {
        if (isListening) recognition.stop();
      }
    } catch(e) {}
  }, [state, isListening, isInterviewEnded]);

  useEffect(() => { setIsSpeaking(state === "speaking"); }, [state]);

  const stateLabel = isInterviewEnded ? 'Ended' : state === 'listening' ? 'Listening' : state === 'speaking' ? 'Speaking' : state === 'thinking' ? 'Processing' : 'Live';
  const stateColor = isInterviewEnded ? '#374151' : state === 'listening' ? '#22c55e' : state === 'speaking' ? 'var(--accent-a)' : state === 'thinking' ? 'var(--accent-c)' : '#4b5563';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' }}>
      <style>{`
        /* ── Top Bar ── */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 22px; flex-shrink: 0;
          border-bottom: 1px solid var(--border);
          background: rgba(7,12,21,0.88); backdrop-filter: blur(24px);
          z-index: 50;
        }
        .status-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 99px;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
        }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; }
        .timer-badge {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 16px; border-radius: 99px;
          background: rgba(0,0,0,0.5); border: 1px solid var(--border-bright);
          font-family: var(--font-mono); font-size: 13px; font-weight: 500; color: var(--ink);
          letter-spacing: 0.06em;
        }
        .logo-mark { font-family: var(--font-display); font-size: 14px; font-weight: 800; letter-spacing: -0.01em; color: var(--ink); display: flex; align-items: center; gap: 9px; }
        .logo-mark span { color: var(--accent-a); }

        /* ── Main body ── */
        .main-body { flex: 1; display: flex; overflow: hidden; }

        /* ── Left Column ── */
        .left-col { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .video-area { flex: 1; display: flex; align-items: center; justify-content: center; padding: 18px; overflow: auto; }

        /* ── Video Stage ── */
        .video-stage {
          width: 100%; max-width: 820px;
          border-radius: var(--r-xl); overflow: hidden;
          border: 1px solid var(--border-bright);
          box-shadow: 0 28px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.025);
          transition: opacity 0.5s, filter 0.5s;
        }
        .panels { display: grid; grid-template-columns: 1fr 1fr; }
        .panel { aspect-ratio: 4/3; position: relative; overflow: hidden; background: var(--surface-1); }
        .panel-ai { background: radial-gradient(ellipse at 50% 35%, rgba(0,90,150,0.22), var(--surface-1) 72%); }
        .panel-divider { position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(180deg, transparent, var(--border-bright) 25%, var(--border-bright) 75%, transparent); }

        /* AI visual */
        .ai-vis { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 18px; }
        .ai-core { position: relative; width: 78px; height: 78px; animation: float-y 5s ease-in-out infinite; }
        .ai-core-inner { width: 78px; height: 78px; border-radius: 50%; background: linear-gradient(135deg, rgba(0,180,240,0.1), rgba(80,0,200,0.1)); border: 1.5px solid rgba(0,200,240,0.3); display: flex; align-items: center; justify-content: center; }
        .ai-orbit { position: absolute; inset: -20px; border-radius: 50%; border: 1px solid rgba(0,200,240,0.14); animation: spin-slow 11s linear infinite; }
        .ai-orbit-dot { position: absolute; top: 50%; left: -4px; width: 7px; height: 7px; background: var(--accent-a); border-radius: 50%; box-shadow: 0 0 12px var(--accent-a); transform: translateY(-50%); }
        .ai-orbit-2 { position: absolute; inset: -35px; border-radius: 50%; border: 1px dashed rgba(109,60,232,0.1); animation: spin-rev 20s linear infinite; }
        .speaking-rings .sr { position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgba(0,200,240,0.45); animation: pulse-ring 2.2s ease-out infinite; }
        .speaking-rings .sr:nth-child(2) { animation-delay: 0.73s; }
        .speaking-rings .sr:nth-child(3) { animation-delay: 1.46s; }
        .waveform { display: flex; align-items: flex-end; gap: 2.5px; height: 22px; }
        .waveform .bar { width: 3px; background: var(--accent-a); border-radius: 2px; animation: bar-wave 0.65s ease-in-out infinite; box-shadow: 0 0 5px var(--accent-a); }

        /* Name tag */
        .nametag { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); padding: 5px 14px; border-radius: 99px; background: rgba(0,0,0,0.58); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.07); font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em; white-space: nowrap; display: flex; align-items: center; gap: 6px; }

        /* Emotion chip */
        .emotion-chip { position: absolute; top: 12px; right: 12px; padding: 9px 12px; border-radius: var(--r-md); background: rgba(0,0,0,0.65); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: flex-end; gap: 3px; transition: all 0.3s; }
        .emotion-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-muted); }
        .emotion-main { display: flex; align-items: center; gap: 8px; }
        .emotion-name { font-size: 13px; font-weight: 700; letter-spacing: 0.03em; font-family: var(--font-display); }
        .emotion-conf { font-family: var(--font-mono); font-size: 9px; opacity: 0.55; }

        /* ── Controls Bar ── */
        .controls-bar { padding: 14px 18px; display: flex; align-items: center; justify-content: center; gap: 10px; border-top: 1px solid var(--border); background: rgba(7,12,21,0.85); backdrop-filter: blur(20px); flex-shrink: 0; flex-wrap: wrap; }
        .ctrl-btn { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: var(--r-md); border: 1px solid var(--border-bright); background: rgba(255,255,255,0.035); color: var(--ink-muted); font-family: var(--font-body); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em; }
        .ctrl-btn:hover { background: rgba(255,255,255,0.07); color: var(--ink); border-color: rgba(255,255,255,0.16); }
        .ctrl-btn.active-listen { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3); color: #4ade80; }
        .ctrl-btn.active-cam { background: rgba(0,200,240,0.08); border-color: rgba(0,200,240,0.25); color: var(--accent-a); }
        .end-btn { display: flex; align-items: center; gap: 8px; padding: 9px 22px; border-radius: var(--r-md); border: none; background: linear-gradient(135deg, #dc2626, #b91c1c); color: #fff; font-family: var(--font-body); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.22s; box-shadow: 0 4px 18px rgba(220,38,38,0.28); }
        .end-btn:hover { transform: translateY(-1px); box-shadow: 0 7px 24px rgba(220,38,38,0.42); }
        .analyze-btn { display: flex; align-items: center; gap: 8px; padding: 9px 26px; border-radius: var(--r-md); border: none; background: linear-gradient(135deg, var(--accent-b), #4f46e5); color: #fff; font-family: var(--font-body); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.22s; box-shadow: 0 4px 18px rgba(109,60,232,0.32); }
        .analyze-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .analyze-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 7px 24px rgba(109,60,232,0.5); }
        .result-banner { padding: 12px 16px; border-radius: var(--r-md); font-size: 12px; display: flex; flex-direction: column; gap: 10px; }
        .result-success { background: rgba(34,197,94,0.07); border: 1px solid rgba(34,197,94,0.2); color: #4ade80; }
        .result-error { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); color: #f87171; }
        .finish-btn { align-self: flex-start; padding: 6px 14px; border-radius: var(--r-sm); background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; font-family: var(--font-body); font-size: 11px; cursor: pointer; transition: all 0.2s; }
        .finish-btn:hover { background: rgba(34,197,94,0.25); }

        /* ── Right Sidebar ── */
        .right-sidebar { width: 400px; display: flex; flex-direction: column; border-left: 1px solid var(--border); flex-shrink: 0; background: rgba(7,12,21,0.92); overflow: hidden; }

        /* ── Task Section (always visible at top of sidebar) ── */
        .task-section { flex-shrink: 0; border-bottom: 1px solid var(--border); overflow: hidden; transition: max-height 0.35s var(--ease-out); }
        .task-section-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; cursor: pointer; user-select: none; transition: background 0.15s; }
        .task-section-header:hover { background: rgba(255,255,255,0.02); }
        .task-body-inner { padding: 0 16px 14px; }
        .task-collapse-btn { width: 24px; height: 24px; border-radius: 6px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--ink-muted); font-size: 11px; transition: all 0.2s; }
        .task-collapse-btn:hover { background: rgba(0,200,240,0.08); color: var(--accent-a); border-color: rgba(0,200,240,0.2); }
        .tag { padding: 2px 10px; border-radius: 99px; font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
        .tag-cyan { background: rgba(0,200,240,0.09); border: 1px solid rgba(0,200,240,0.2); color: var(--accent-a); }
        .tag-violet { background: rgba(109,60,232,0.09); border: 1px solid rgba(109,60,232,0.2); color: #a78bfa; }
        .task-desc { padding: 12px 14px; border-radius: var(--r-md); background: rgba(0,0,0,0.35); border: 1px solid var(--border); font-size: 12px; color: var(--ink-muted); line-height: 1.65; margin-bottom: 12px; }
        .code-wrap { border-radius: var(--r-md); overflow: hidden; border: 1px solid var(--border-bright); }
        .code-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: rgba(0,0,0,0.45); border-bottom: 1px solid var(--border); }
        .code-dots { display: flex; gap: 5px; }
        .code-dot { width: 9px; height: 9px; border-radius: 50%; }
        .code-body { padding: 14px; background: rgba(4,7,14,0.96); overflow-x: auto; max-height: 130px; font-family: var(--font-mono); font-size: 11px; color: #c9d1d9; line-height: 1.55; }
        .code-body::-webkit-scrollbar { height: 3px; }
        .code-body::-webkit-scrollbar-thumb { background: rgba(0,200,240,0.28); border-radius: 99px; }

        /* ── Chat section ── */
        .chat-section { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .chat-section-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px 8px; flex-shrink: 0; border-bottom: 1px solid var(--border); }
        .chat-feed { flex: 1; overflow-y: auto; padding: 14px 16px; display: flex; flex-direction: column; gap: 14px; }
        .msg-row-ai { display: flex; justify-content: flex-start; }
        .msg-row-user { display: flex; justify-content: flex-end; }
        .msg-bubble { max-width: 90%; border-radius: var(--r-md); padding: 11px 14px; font-size: 13px; line-height: 1.62; color: var(--ink-muted); }
        .msg-bubble-ai { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-top-left-radius: 4px; }
        .msg-bubble-user { background: rgba(0,200,240,0.07); border: 1px solid rgba(0,200,240,0.14); border-top-right-radius: 4px; }
        .msg-bubble-partial { opacity: 0.55; font-style: italic; }
        .msg-meta { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; font-size: 9px; }
        .msg-avatar { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .thinking-dots { display: flex; gap: 5px; padding: 4px 2px; }
        .thinking-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent-a); animation: dot-bounce 1.2s ease-in-out infinite; }
        .empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 10px; padding: 28px; }
        .empty-icon { width: 48px; height: 48px; border-radius: var(--r-md); background: rgba(255,255,255,0.025); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }

        /* ── Input area ── */
        .input-area { padding: 12px 14px 14px; border-top: 1px solid var(--border); flex-shrink: 0; background: rgba(7,12,21,0.9); }
        .dictation-hint { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
        .input-wrap { display: flex; gap: 8px; align-items: flex-end; }
        .chat-textarea {
          flex: 1;
          padding: 10px 14px;
          border-radius: var(--r-md);
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.55;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          outline: none;
          resize: none;
          min-height: 42px;
          max-height: 160px;
          overflow-y: auto;
          display: block;
        }
        .chat-textarea::placeholder { color: var(--ink-dim); }
        .chat-textarea:focus { border-color: rgba(0,200,240,0.38); background: rgba(0,200,240,0.03); box-shadow: 0 0 0 3px rgba(0,200,240,0.07); }
        .chat-textarea:disabled { opacity: 0.38; cursor: not-allowed; }
        .send-btn { padding: 10px 16px; border-radius: var(--r-md); border: none; background: linear-gradient(135deg, var(--accent-a), #0070e0); color: #fff; font-family: var(--font-body); font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.22s; white-space: nowrap; flex-shrink: 0; align-self: flex-end; height: 42px; }
        .send-btn:disabled { background: rgba(255,255,255,0.06); color: var(--ink-dim); cursor: not-allowed; box-shadow: none; }
        .send-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(0,180,240,0.35); }

        /* Partial transcript live preview in input */
        .live-preview { padding: 6px 14px 4px; font-size: 11px; font-style: italic; color: rgba(0,200,240,0.5); font-family: var(--font-mono); display: flex; align-items: center; gap: 6px; min-height: 22px; }
        .live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent-a); animation: dot-bounce 0.8s ease-in-out infinite; flex-shrink: 0; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="topbar">
        <div className="logo-mark">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--accent-a)" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          Interview<span>AI</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="status-badge">
            <div className="status-dot" style={{ background: stateColor, boxShadow: `0 0 8px ${stateColor}` }} />
            <span style={{ color: 'var(--ink-muted)' }}>{stateLabel}</span>
          </div>
        </div>
        <div className="timer-badge">
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: isInterviewEnded ? 'var(--ink-dim)' : '#ef4444', boxShadow: !isInterviewEnded ? '0 0 7px #ef4444' : 'none' }} />
          {formatTime(interviewTime)}
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="main-body">

        {/* ── LEFT COLUMN ── */}
        <div className="left-col">
          <div className="video-area scrollbar">
            <div style={{ width: '100%', maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Video stage */}
              <div className="video-stage" style={{ opacity: isInterviewEnded ? 0.58 : 1, filter: isInterviewEnded ? 'grayscale(0.35)' : 'none' }}>
                <div className="panels">
                  {/* AI Panel */}
                  <div className="panel panel-ai" style={{ position: 'relative' }}>
                    <div className="ai-vis">
                      <div className="ai-core">
                        {isSpeaking && !isInterviewEnded && (
                          <div className="speaking-rings"><div className="sr"/><div className="sr"/><div className="sr"/></div>
                        )}
                        <div className="ai-orbit"><div className="ai-orbit-dot"/></div>
                        <div className="ai-orbit-2"/>
                        <div className="ai-core-inner">
                          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="var(--accent-a)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                          </svg>
                        </div>
                      </div>
                      {isSpeaking && !isInterviewEnded && (
                        <div className="waveform">
                          {[0,1,2,3,4,3,2,1,0].map((h,i) => (
                            <div key={i} className="bar" style={{ height: `${22 + h * 9}%`, animationDelay: `${i * 0.08}s` }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="panel-divider" />
                    <div className="nametag">
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: isInterviewEnded ? 'var(--ink-dim)' : isSpeaking ? 'var(--accent-a)' : '#22c55e', boxShadow: !isInterviewEnded && isSpeaking ? '0 0 8px var(--accent-a)' : 'none' }} />
                      <span style={{ color: 'var(--accent-a)', fontWeight: 600 }}>AI INTERVIEWER</span>
                    </div>
                  </div>

                  {/* User Video Panel */}
                  <div className="panel" style={{ position: 'relative' }}>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {isCameraOn ? (
                      <>
                        <video ref={videoRef} autoPlay playsInline muted
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.48) 0%, transparent 40%)' }} />
                        {!isInterviewEnded && emotionData && (
                          <div className="emotion-chip">
                            <div className="emotion-label">Emotion</div>
                            <div className="emotion-main">
                              <span style={{ fontSize: '22px' }}>{emotionEmoji[emotionData.emotion] || '😐'}</span>
                              <div>
                                <div className="emotion-name" style={{ color: emotionColor[emotionData.emotion] || '#94a3b8' }}>{emotionData.emotion}</div>
                                <div className="emotion-conf" style={{ color: emotionColor[emotionData.emotion] || '#94a3b8' }}>{Math.round(emotionData.confidence * 100)}%</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px' }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--ink-dim)" strokeWidth="1.3">
                          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        <span style={{ fontSize: '11px', color: 'var(--ink-dim)', fontFamily: 'var(--font-mono)' }}>
                          {isCameraLoading ? 'Starting camera…' : cameraError || 'Camera unavailable'}
                        </span>
                      </div>
                    )}
                    <div className="nametag">
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 7px #f59e0b' }} />
                      <span style={{ color: '#fbbf24', fontWeight: 600 }}>YOU</span>
                      {isListening && !isInterviewEnded && <span style={{ color: '#22c55e', fontSize: '8px', letterSpacing: '0.08em' }}>● REC</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="controls-bar" style={{ borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', background: 'rgba(7,12,21,0.88)', backdropFilter: 'blur(20px)' }}>
                {isInterviewEnded ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {(!analyzeMessage || analyzeMessage.type === 'error') && (
                      <button className="analyze-btn" onClick={handleAnalyze} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                          <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin-slow 0.75s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Analyzing…</>
                        ) : (
                          <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>Analyze Results</>
                        )}
                      </button>
                    )}
                    {analyzeMessage && (
                      <div className={`result-banner ${analyzeMessage.type === 'success' ? 'result-success' : 'result-error'}`}>
                        {analyzeMessage.text}
                        {analyzeMessage.type === 'success' && <button className="finish-btn" onClick={onEndCall}>Finish & Close</button>}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className={`ctrl-btn ${isListening ? 'active-listen' : ''}`}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                      {isListening ? 'Listening…' : 'Microphone'}
                    </div>
                    {showEndButton && (
                      <button className="end-btn" onClick={handleEndCall}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"/>
                        </svg>
                        End Interview
                      </button>
                    )}
                    <div className={`ctrl-btn ${isCameraOn ? 'active-cam' : ''}`}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      {isCameraOn ? 'Camera On' : 'Camera Off'}
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="right-sidebar">

          {/* ════ TASK SECTION — ALWAYS VISIBLE ════ */}
          {taskData && (
            <div className="task-section" style={{ maxHeight: taskCollapsed ? '48px' : '340px' }}>
              {/* Header (always shown — click to collapse/expand) */}
              <div className="task-section-header" onClick={() => setTaskCollapsed(p => !p)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,200,240,0.1)', border: '1px solid rgba(0,200,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-a)" strokeWidth="2">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Challenge</div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '3px' }}>
                      <span className="tag tag-cyan">Lvl {taskData?.taskLevel}</span>
                      <span className="tag tag-violet">{taskData?.skillLevel}</span>
                    </div>
                  </div>
                </div>
                <div className="task-collapse-btn">
                  <span style={{ transform: taskCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.25s', display: 'inline-block', lineHeight: 1 }}>▾</span>
                </div>
              </div>

              {/* Body (collapses) */}
              {!taskCollapsed && (
                <div className="task-body-inner" style={{ animation: 'fade-up 0.25s var(--ease-out)' }}>
                  <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-bright), transparent)', marginBottom: '12px' }} />
                  <div className="label" style={{ color: 'var(--ink-muted)', marginBottom: '6px' }}>Task</div>
                  <div className="task-desc">{taskData?.task}</div>
                  {taskData?.codeSubmission && (
                    <>
                      <div className="label" style={{ color: 'var(--ink-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent-b)" strokeWidth="2.5"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                        Code
                      </div>
                      <div className="code-wrap">
                        <div className="code-header">
                          <div className="code-dots">
                            <div className="code-dot" style={{ background: '#ef4444' }} />
                            <div className="code-dot" style={{ background: '#f59e0b' }} />
                            <div className="code-dot" style={{ background: '#22c55e' }} />
                          </div>
                          <span className="label" style={{ color: 'var(--ink-dim)', fontSize: '8px' }}>submission.py</span>
                        </div>
                        <pre className="code-body scrollbar"><code>{taskData?.codeSubmission}</code></pre>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════ CHAT / TRANSCRIPT SECTION ════ */}
          <div className="chat-section">
            <div className="chat-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-a)" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.01em' }}>Transcript</span>
                {conversation.length > 0 && (
                  <span style={{ background: 'rgba(0,200,240,0.12)', border: '1px solid rgba(0,200,240,0.22)', color: 'var(--accent-a)', fontSize: '9px', fontWeight: 700, borderRadius: '99px', padding: '1px 7px', fontFamily: 'var(--font-mono)' }}>
                    {conversation.length}
                  </span>
                )}
              </div>
              {isListening && !isInterviewEnded && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#22c55e', letterSpacing: '0.1em' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                  LIVE
                </div>
              )}
            </div>

            <div className="chat-feed scrollbar">
              {conversation.length === 0 && !agentPartialTranscript && !partialTranscript ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-dim)" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  </div>
                  <div style={{ color: 'var(--ink-muted)', fontSize: '12px', fontWeight: 600 }}>Awaiting conversation</div>
                  <div style={{ color: 'var(--ink-dim)', fontSize: '11px', lineHeight: 1.6 }}>The AI interviewer will begin shortly. Your live transcript appears here.</div>
                </div>
              ) : (
                <>
                  {conversation.map((msg, i) => (
                    <div key={i} className={msg.speaker === 'user' ? 'msg-row-user' : 'msg-row-ai'}>
                      <div style={{ maxWidth: '90%' }}>
                        <div className="msg-meta" style={{ justifyContent: msg.speaker === 'user' ? 'flex-end' : 'flex-start' }}>
                          <div className="msg-avatar" style={{
                            background: msg.speaker === 'ai' ? 'linear-gradient(135deg, var(--accent-a), var(--accent-b))' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            order: msg.speaker === 'user' ? 2 : 0
                          }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                              {msg.speaker === 'ai'
                                ? <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>
                                : <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
                            </svg>
                          </div>
                          <span style={{ color: msg.speaker === 'ai' ? 'rgba(0,200,240,0.55)' : 'rgba(245,158,11,0.55)', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em', order: 1 }}>
                            {msg.speaker === 'ai' ? 'AI' : `YOU · ${msg.emotion || 'Neutral'}`}
                          </span>
                          <span style={{ color: 'var(--ink-dim)', fontSize: '9px', fontFamily: 'var(--font-mono)', order: msg.speaker === 'user' ? 0 : 2 }}>{msg.timestamp}</span>
                        </div>
                        <div className={`msg-bubble ${msg.speaker === 'ai' ? 'msg-bubble-ai' : 'msg-bubble-user'}`}>
                          <AnimatedText text={msg.text} isPartial={false} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {agentPartialTranscript && !isInterviewEnded && (
                    <div className="msg-row-ai">
                      <div className="msg-bubble msg-bubble-ai msg-bubble-partial">
                        <AnimatedText text={agentPartialTranscript} isPartial={true} />
                      </div>
                    </div>
                  )}
                  {partialTranscript && !isInterviewEnded && (
                    <div className="msg-row-user">
                      <div className="msg-bubble msg-bubble-user msg-bubble-partial">
                        <AnimatedText text={partialTranscript} isPartial={true} />
                      </div>
                    </div>
                  )}
                  {state === 'thinking' && !agentPartialTranscript && !isInterviewEnded && (
                    <div className="msg-row-ai">
                      <div className="msg-bubble msg-bubble-ai">
                        <div className="thinking-dots">
                          {[0,1,2].map(i => <div key={i} className="thinking-dot" style={{ animationDelay: `${i*0.2}s` }} />)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={conversationEndRef} />
                </>
              )}
            </div>

            {/* ── Input Area ── */}
            <div className="input-area">
              {/* Live dictation preview above input */}
              {isListening && partialTranscript && !isInterviewEnded && (
                <div className="live-preview">
                  <div className="live-dot" />
                  <span>{partialTranscript}</span>
                </div>
              )}
              <div className="dictation-hint" style={{ color: isInterviewEnded ? 'var(--ink-dim)' : isListening ? '#22c55e' : 'var(--ink-dim)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: isInterviewEnded ? 'var(--ink-dim)' : isListening ? '#22c55e' : 'var(--ink-dim)', boxShadow: !isInterviewEnded && isListening ? '0 0 5px #22c55e' : 'none' }} />
                {isInterviewEnded ? 'Session ended' : isListening ? 'Dictating — words appear as you speak' : 'Ready'}
              </div>
              <div className="input-wrap">
                <textarea
                  ref={textareaRef}
                  className="chat-textarea scrollbar"
                  value={draftMessage}
                  onChange={e => setDraftMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                  }}
                  placeholder={isInterviewEnded ? 'Session concluded' : 'Speak or type… (Enter to send, Shift+Enter for newline)'}
                  disabled={isInterviewEnded}
                  rows={1}
                />
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!draftMessage.trim() || isInterviewEnded}
                >
                  Send
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}