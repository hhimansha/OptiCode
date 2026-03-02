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
      const response = await fetch(`http://localhost:5000/api/livekit?userId=${userId}`);
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

  const handleDisconnect = () => {
    setShouldConnect(false);
    setRoomDetails(null);
  };

  const onDeviceFailure = () => {
    setError("Microphone permission denied! Please allow mic access and reload.");
    handleDisconnect();
  };
  
  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * {
          font-family: 'Sora', sans-serif;
        }
        
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #8b5cf6);
          border-radius: 10px;
        }
        
        /* Animated Background Gradient */
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animated-bg {
          background: linear-gradient(-45deg, #05080f, #0a1628, #0f172a, #05080f);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
        
        /* Glow Pulse Animation */
        @keyframes glowPulse {
          0%, 100% { 
            filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.4)) drop-shadow(0 0 40px rgba(6, 182, 212, 0.2));
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 35px rgba(6, 182, 212, 0.6)) drop-shadow(0 0 60px rgba(6, 182, 212, 0.3));
            transform: scale(1.02);
          }
        }
        
        /* Floating Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(1deg); }
          66% { transform: translateY(-6px) rotate(-1deg); }
        }
        
        /* Audio Wave Animation */
        @keyframes audioWave {
          0%, 100% { transform: scaleY(0.3); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        
        /* Ripple Animation */
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        
        /* Shimmer Effect */
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        /* Orbit Animation */
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }
        
        /* Particle Float */
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          50% { transform: translateY(-40px) translateX(-5px); opacity: 0.5; }
          75% { transform: translateY(-20px) translateX(-10px); opacity: 0.7; }
        }
        
        /* Scanning Line */
        @keyframes scanLine {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
        
        /* Type Cursor */
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .glow-pulse { animation: glowPulse 3s ease-in-out infinite; }
        .float-anim { animation: float 6s ease-in-out infinite; }
        .audio-wave { animation: audioWave 0.8s ease-in-out infinite; }
        .ripple { animation: ripple 2s ease-out infinite; }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .orbit { animation: orbit 8s linear infinite; }
        .particle { animation: particleFloat 4s ease-in-out infinite; }
        
        /* Glass Effect */
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .glass-dark {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        /* Neon Border */
        .neon-border {
          position: relative;
        }
        .neon-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, #06b6d4, #8b5cf6, #06b6d4);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.7;
        }
      `}</style>
      
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 animated-bg">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative w-full h-screen z-10">
        {(!shouldConnect || !roomDetails) ? (
          <LandingScreen 
            isLoading={isLoading} 
            error={error} 
            onConnect={handleConnect} 
          />
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

// Landing Screen Component
function LandingScreen({ isLoading, error, onConnect }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full particle"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0.4
          }}
        />
      ))}
      
      {/* Main Card */}
      <div className="relative">
        {/* Glow Behind Card */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20 blur-[80px] scale-150" />
        
        <div className="relative glass rounded-[32px] p-12 max-w-md w-full">
          {/* Decorative Corner Elements */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/30 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/30 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/30 rounded-br-lg" />
          
          {/* AI Avatar */}
          <div className="flex justify-center mb-10">
            <div className="relative float-anim">
              {/* Outer Rings */}
              <div className="absolute inset-0 scale-[2] opacity-20">
                <div className="absolute inset-0 border border-cyan-500/50 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              </div>
              <div className="absolute inset-0 scale-[1.6] opacity-30">
                <div className="absolute inset-0 border border-violet-500/50 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              </div>
              
              {/* Main Avatar */}
              <div className="relative w-28 h-28 glow-pulse">
                {/* Gradient Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 p-[3px]">
                  <div className="w-full h-full rounded-full bg-[#0a1628] flex items-center justify-center">
                    {/* AI Icon */}
                    <div className="relative">
                      <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {/* Glow Effect on Icon */}
                      <div className="absolute inset-0 blur-md opacity-50">
                        <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Orbiting Dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="orbit">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-3">
            <h1 className="text-4xl font-semibold text-white tracking-tight mb-2">
              AI Interview
            </h1>
            <div className="flex items-center justify-center gap-2 text-cyan-400/60 text-xs mono">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span>SYSTEM READY</span>
            </div>
          </div>
          
          <p className="text-center text-slate-400 mb-10 text-sm leading-relaxed">
            Experience next-generation AI-powered mock interviews with real-time voice interaction
          </p>

          {/* Connect Button */}
          <button 
            onClick={onConnect} 
            disabled={isLoading}
            className="group relative w-full py-4 px-8 rounded-2xl font-medium text-sm tracking-wide transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {/* Button Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 transition-all duration-500 group-hover:scale-105" />
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Button Content */}
            <span className="relative flex items-center justify-center gap-3 text-slate-900 font-semibold">
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Initializing...</span>
                </>
              ) : (
                <>
                  <span>Begin Interview</span>
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-xs text-center flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          {/* Features */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: "🎤", label: "Voice AI" },
              { icon: "⚡", label: "Real-time" },
              { icon: "🎯", label: "Adaptive" }
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-lg mb-1">{feature.icon}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{feature.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Text */}
      <p className="absolute bottom-8 text-slate-600 text-xs tracking-wider">
        Powered by Advanced AI Technology
      </p>
    </div>
  );
}

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
  const [emotionError, setEmotionError] = useState('');
  
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const conversationEndRef = useRef(null);
  const lastMessageIdRef = useRef(0);
  const lastAgentTranscriptionIdRef = useRef(null);
  const timerRef = useRef(null);

  // Send message handler
  const handleSendMessage = async () => {
    if (!draftMessage.trim()) return;

    if (sendChatMessage) {
      await sendChatMessage(draftMessage);
    }

    setConversation(prev => [...prev, {
      speaker: "user",
      text: draftMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    setDraftMessage("");
  };

  // Interview timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setInterviewTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize camera automatically
  useEffect(() => {
    initializeCamera();
  }, []);

  const initializeCamera = async () => {
    if (isCameraOn) return;
    
    setIsCameraLoading(true);
    setCameraError(null);
    
    try {
      const constraints = {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: "user",
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      setIsCameraOn(true);
      
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError("Camera access denied");
      setIsCameraOn(false);
    } finally {
      setIsCameraLoading(false);
    }
  };

  useEffect(() => {
    if (isCameraOn && mediaStreamRef.current && videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.srcObject = mediaStreamRef.current;
      videoElement.play().catch(e => console.warn("Auto-play blocked:", e));
    }
  }, [isCameraOn]);

  // WebSocket for emotion detection
  useEffect(() => {
    if (!isCameraOn) return;

    const startEmotionDetection = async () => {
      try {
        const ws = new WebSocket('ws://localhost:8000/ws/emotion');
        wsRef.current = ws;

        ws.onopen = () => console.log('Connected to Emotion Model');
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.status === 'success') {
              setEmotionData(data);
            } else {
              setEmotionData(null);
            }
          } catch (e) {
            console.error('Error parsing emotion data:', e);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setEmotionError('Emotion detection connection failed');
        };

        // Frame capture interval
        const intervalId = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
            captureAndSendFrame();
          }
        }, 100);

        return () => {
          clearInterval(intervalId);
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
      } catch (error) {
        console.error('Emotion detection setup error:', error);
        setEmotionError('Failed to start emotion detection');
      }
    };

    startEmotionDetection();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [isCameraOn]);

  const captureAndSendFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === 4) {
      const ctx = canvas.getContext('2d');
      canvas.width = 320;
      canvas.height = 240;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64Data = canvas.toDataURL('image/jpeg', 0.7);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(base64Data);
      }
    }
  };

  const getEmoji = (emotion) => {
    const map = {
      'Angry': '😠',
      'Disgust': '🤢',
      'Fear': '😱',
      'Happy': '😄',
      'Sad': '😢',
      'Surprise': '😲',
      'Neutral': '😐'
    };
    return map[emotion] || '😐';
  };

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, agentPartialTranscript, draftMessage]);

  // Handle AI Transcriptions
  useEffect(() => {
    if (agentTranscriptions && agentTranscriptions.length > 0) {
      const latest = agentTranscriptions[agentTranscriptions.length - 1];
      
      if (!latest.final) {
        setAgentPartialTranscript(latest.text);
      } else {
        if (latest.id !== lastAgentTranscriptionIdRef.current) {
          lastAgentTranscriptionIdRef.current = latest.id;
          setConversation(prev => [...prev, {
            speaker: "ai",
            text: latest.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          setAgentPartialTranscript("");
        }
      }
    }
  }, [agentTranscriptions]);

  // Fallback chat messages
  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      
      if (lastMessage.timestamp !== lastMessageIdRef.current && !lastMessage.from?.isLocal) {
        lastMessageIdRef.current = lastMessage.timestamp;
        setConversation(prev => [...prev, {
          speaker: "ai",
          text: lastMessage.message,
          timestamp: new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    }
  }, [chatMessages]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window))) {
      console.error("Speech recognition not supported");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) setPartialTranscript(interimTranscript);

      if (finalTranscript) {
        setDraftMessage(prev => prev ? prev + " " + finalTranscript : finalTranscript);
        setPartialTranscript("");
        setIsSpeaking(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (state === "listening") {
        setTimeout(() => {
          try { recognition.start(); } catch (e) { /* ignore */ }
        }, 100);
      }
    };

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      if (state === "listening") {
        if (!isListening) {
          setTimeout(() => {
            try { recognition.start(); } catch (e) { console.log(e); }
          }, 500);
        }
      } else if (state === "speaking" || state === "thinking") {
        if (isListening) recognition.stop();
      }
    } catch (e) {
      console.log("Recognition control error:", e);
    }
  }, [state, isListening]);

  useEffect(() => {
    if (state === "speaking") {
      setIsSpeaking(true);
    } else if (state === "listening") {
      setIsSpeaking(false);
    }
  }, [state]);

  return (
    <div className="h-screen flex">
      {/* Left Section - Main Video Area */}
      <div className="flex-1 flex flex-col relative p-6">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          {/* Session Info */}
          <div className="flex items-center gap-4">
            <div className="glass rounded-full px-4 py-2 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${state === 'listening' ? 'bg-green-400 animate-pulse' : state === 'speaking' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-slate-400 text-xs mono uppercase tracking-wider">
                {state === 'listening' ? 'Listening' : state === 'speaking' ? 'Speaking' : state === 'thinking' ? 'Processing' : 'Connected'}
              </span>
            </div>
          </div>
          
          {/* Timer */}
          <div className="glass rounded-full px-5 py-2.5 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-sm mono font-medium tracking-wider">{formatTime(interviewTime)}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            {/* Video Container with Neon Border */}
            <div className="relative rounded-3xl overflow-hidden neon-border">
              <div className="flex bg-[#080c14]">
                {/* AI Avatar Panel */}
                <div className="w-1/2 aspect-[4/3] relative flex items-center justify-center bg-gradient-to-br from-[#0a1628] to-[#05080f] border-r border-cyan-500/10">
                  {/* Ambient Effects */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-violet-500/5 rounded-full blur-[60px]" />
                  </div>
                  
                  {/* AI Avatar */}
                  <div className="relative float-anim">
                    {/* Audio Visualization Rings */}
                    {isSpeaking && (
                      <>
                        <div className="absolute inset-0 scale-[2.5] flex items-center justify-center">
                          <div className="w-full h-full border border-cyan-500/20 rounded-full ripple" />
                        </div>
                        <div className="absolute inset-0 scale-[2] flex items-center justify-center">
                          <div className="w-full h-full border border-cyan-500/30 rounded-full ripple" style={{ animationDelay: '0.5s' }} />
                        </div>
                        <div className="absolute inset-0 scale-[1.5] flex items-center justify-center">
                          <div className="w-full h-full border border-cyan-500/40 rounded-full ripple" style={{ animationDelay: '1s' }} />
                        </div>
                      </>
                    )}
                    
                    {/* Main Avatar Circle */}
                    <div className="relative w-24 h-24">
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 p-[2px] ${isSpeaking ? 'glow-pulse' : ''}`}>
                        <div className="w-full h-full rounded-full bg-[#0a1628] flex items-center justify-center">
                          <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Status Dot */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0a1628] ${isSpeaking ? 'bg-cyan-400' : 'bg-green-400'}`}>
                        {isSpeaking && <div className="w-full h-full rounded-full bg-cyan-400 animate-ping" />}
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Label */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    <div className="glass-dark rounded-full px-4 py-1.5 flex items-center gap-2">
                      <span className="text-cyan-400 text-xs mono font-medium tracking-wider">AI INTERVIEWER</span>
                      {isSpeaking && (
                        <div className="flex items-end gap-0.5 h-3">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div 
                              key={i}
                              className="w-0.5 bg-cyan-400 rounded-full audio-wave"
                              style={{ 
                                animationDelay: `${i * 0.1}s`,
                                height: '100%'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Scanning Line Effect when Speaking */}
                  {isSpeaking && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div 
                        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                        style={{ animation: 'scanLine 3s ease-in-out infinite' }}
                      />
                    </div>
                  )}
                </div>

                {/* User Video Panel */}
                <div className="w-1/2 aspect-[4/3] bg-[#0a1018] relative overflow-hidden">
                  {/* Hidden Canvas for processing */}
                  <canvas ref={canvasRef} className="hidden" />

                  {isCameraOn ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* EMOTION RESULT DISPLAY */}
                      <div className="absolute top-6 right-6">
                        <div className={`glass-dark backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all duration-300 ${emotionData ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                          {emotionData && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-slate-400 font-medium tracking-wider mb-1">DETECTED EMOTION</span>
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{getEmoji(emotionData.emotion)}</span>
                                <div className="text-right">
                                  <p className="text-white font-bold text-xl uppercase tracking-wide">
                                    {emotionData.emotion}
                                  </p>
                                  <p className="text-emerald-400 text-xs font-mono">
                                    {Math.round(emotionData.confidence * 100)}% CONFIDENCE
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* User Label */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                        <div className="glass-dark bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2">
                          <span className="text-amber-400 text-xs mono font-medium tracking-wider">YOU</span>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      {cameraError || (isCameraLoading ? "Initializing camera..." : "Camera unavailable")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="mt-8 flex items-center justify-center gap-4">
              {/* Mic Status */}
              <div className={`glass rounded-full p-4 transition-all duration-300 ${isListening ? 'bg-green-500/10 border-green-500/30' : ''}`}>
                <svg className={`w-5 h-5 transition-colors ${isListening ? 'text-green-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              
              {/* End Call Button */}
              <button
                onClick={onEndCall}
                className="group relative px-10 py-3.5 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
                <span className="relative flex items-center gap-2 text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                  </svg>
                  End Interview
                </span>
              </button>
              
              {/* Camera Status */}
              <div className={`glass rounded-full p-4 transition-all duration-300 ${isCameraOn ? 'bg-cyan-500/10 border-cyan-500/30' : ''}`}>
                <svg className={`w-5 h-5 transition-colors ${isCameraOn ? 'text-cyan-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Chat Panel */}
      <div className="w-[400px] glass-dark flex flex-col border-l border-white/5">
        {/* Chat Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white text-sm font-medium">Live Transcript</h2>
                <p className="text-slate-500 text-xs">{conversation.length} messages</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {conversation.length === 0 && !partialTranscript && !agentPartialTranscript ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-5 border border-slate-700/50">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-2">Waiting for conversation</h3>
              <p className="text-slate-600 text-xs leading-relaxed">The AI interviewer will begin speaking shortly. Your conversation will appear here in real-time.</p>
            </div>
          ) : (
            <>
              {conversation.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.speaker === 'user' ? 'order-1' : ''}`}>
                    {/* Avatar & Label */}
                    <div className={`flex items-center gap-2 mb-2 ${msg.speaker === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        msg.speaker === "ai" 
                          ? "bg-gradient-to-br from-cyan-500 to-violet-600" 
                          : "bg-gradient-to-br from-amber-500 to-orange-600"
                      }`}>
                        {msg.speaker === "ai" ? (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-[10px] font-medium uppercase tracking-wider ${
                        msg.speaker === "ai" ? "text-cyan-400/70" : "text-amber-400/70"
                      }`}>
                        {msg.speaker === "ai" ? "AI" : "You"}
                      </span>
                      <span className="text-slate-600 text-[10px]">{msg.timestamp}</span>
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.speaker === "ai" 
                        ? "bg-slate-800/50 border border-slate-700/50 rounded-tl-sm" 
                        : "bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/20 rounded-tr-sm"
                    }`}>
                      <p className="text-slate-300 text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Partial */}
              {agentPartialTranscript && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/50">AI</span>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-slate-500 text-sm italic leading-relaxed">{agentPartialTranscript}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* User Partial */}
              {partialTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[85%]">
                    <div className="flex items-center gap-2 mb-2 flex-row-reverse">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-amber-400/50">You</span>
                    </div>
                    <div className="bg-amber-600/10 border border-amber-500/10 rounded-2xl rounded-tr-sm px-4 py-3">
                      <p className="text-slate-500 text-sm italic leading-relaxed">{partialTranscript}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Thinking Indicator */}
              {state === "thinking" && !agentPartialTranscript && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-cyan-400/50">AI is thinking</span>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl rounded-tl-sm px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <div 
                            key={i}
                            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={conversationEndRef} />
            </>
          )}
        </div>
        
        {/* Chat Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0a1018]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>{isListening ? 'Dictating...' : 'Ready for dictation...'}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Speak to type, then edit..."
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
              />
              <button
                onClick={handleSendMessage}
                disabled={!draftMessage.trim()}
                className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:shadow-none"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}