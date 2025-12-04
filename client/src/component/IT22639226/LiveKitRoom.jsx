"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  LiveKitRoom,
  useVoiceAssistant,
  useChat,
  BarVisualizer,
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
      // Ensure this URL matches your backend
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {(!shouldConnect || !roomDetails) ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-slate-700/50">
              <h1 className="text-3xl font-bold text-white mb-4 text-center">AI Interview Assistant</h1>
              <p className="text-center text-slate-400 mb-8 max-w-md">
                Connect to start your AI-powered interview session
              </p>

              <button 
                onClick={handleConnect} 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Connecting..." : "Start Interview"}
              </button>

              {error && (
                <p className="text-red-400 text-sm text-center mt-4 bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">
                  {error}
                </p>
              )}
            </div>
          </div>
        ) : (
          <LiveKitRoom
            token={roomDetails.token}
            connect={shouldConnect}
            audio
            video={false}
            serverUrl={import.meta.env.VITE_LK_SERVER_URL}
            onMediaDeviceFailure={onDeviceFailure}
            onDisconnected={handleDisconnect}
            className="w-full space-y-8"
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

function InterviewInterface({ onEndCall, userId }) {
  // 1. ADD agentTranscriptions here to get AI text
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { messages: chatMessages } = useChat();
   
  const [conversation, setConversation] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState(""); // User partial
  const [agentPartialTranscript, setAgentPartialTranscript] = useState(""); // AI partial
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
   
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const conversationEndRef = useRef(null);
  const lastMessageIdRef = useRef(0);
  const lastAgentTranscriptionIdRef = useRef(null);

  // Initialize camera
  const initializeCamera = async () => {
    if (isCameraOn) return;
    
    setIsCameraLoading(true);
    setCameraError(null);
    
    try {
      const constraints = {
        video: {
          width: { ideal: 320, max: 640 },
          height: { ideal: 240, max: 480 },
          facingMode: "user",
          frameRate: { ideal: 24, max: 30 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      setIsCameraOn(true); 
      
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError("Failed to access camera.");
      setIsCameraOn(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Attach stream to video element when camera is turned on
  useEffect(() => {
    if (isCameraOn && mediaStreamRef.current && videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.srcObject = mediaStreamRef.current;
      
      videoElement.play().catch(e => {
        console.warn("Auto-play blocked:", e);
      });
    }
  }, [isCameraOn]);

  const turnOffCamera = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOn(false);
    setCameraError(null);
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      turnOffCamera();
    } else {
      await initializeCamera();
    }
  };

  const handleVideoInteraction = async () => {
    if (videoRef.current && videoRef.current.paused) {
      try {
        await videoRef.current.play();
      } catch (e) {
        console.error("Manual video play failed:", e);
      }
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        const tracks = mediaStreamRef.current.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, agentPartialTranscript]);

  // -----------------------------------------------------------
  // NEW LOGIC: Handle AI Transcriptions (Voice -> Text)
  // -----------------------------------------------------------
  useEffect(() => {
    if (agentTranscriptions && agentTranscriptions.length > 0) {
      const latest = agentTranscriptions[agentTranscriptions.length - 1];
      
      // If the AI is still speaking (not final), show it as partial text
      if (!latest.final) {
        setAgentPartialTranscript(latest.text);
      } else {
        // If it is final and we haven't added it yet
        if (latest.id !== lastAgentTranscriptionIdRef.current) {
          lastAgentTranscriptionIdRef.current = latest.id;
          setConversation(prev => [...prev, {
            speaker: "ai",
            text: latest.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          setAgentPartialTranscript(""); // Clear partial
        }
      }
    }
  }, [agentTranscriptions]);

  // Fallback: Listen to explicit chat messages (if your backend sends them)
  useEffect(() => {
    if (chatMessages && chatMessages.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      
      if (lastMessage.timestamp !== lastMessageIdRef.current && !lastMessage.from?.isLocal) {
        lastMessageIdRef.current = lastMessage.timestamp;
        
        // Only add if we didn't just add it via transcription (deduplication check usually needed here)
        // For now, simply adding it.
        setConversation(prev => [...prev, {
          speaker: "ai",
          text: lastMessage.message,
          timestamp: new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    }
  }, [chatMessages]);

  // Speech recognition setup (User's Voice)
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
        setConversation(prev => [...prev, {
          speaker: "user",
          text: finalTranscript,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
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

  // Control speech recognition logic
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

  const clearTranscript = () => {
    setConversation([]);
    setPartialTranscript("");
    setAgentPartialTranscript("");
    lastMessageIdRef.current = 0;
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Profile Cards Container */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
        {/* AI Interviewer Card */}
        <div className="group">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-purple-500/30">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {isSpeaking && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900 animate-pulse"></div>
                )}
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-white">AI Interviewer</h3>
                <p className="text-sm text-slate-400 mt-1">Technical Recruiter</p>
                <div className="mt-2">
                  <span className={`text-xs px-3 py-1 rounded-full ${state === "speaking" ? 'bg-purple-500/20 text-purple-300' : state === "listening" ? 'bg-green-500/20 text-green-300' : 'bg-slate-700/50 text-slate-400'}`}>
                    {state === "speaking" ? "Speaking..." : state === "listening" ? "Listening..." : state || "Idle"}
                  </span>
                </div>
              </div>

              <div className="w-full pt-4">
                <BarVisualizer
                  state={isSpeaking ? "speaking" : "idle"}
                  options={{ maxHeight: 32, minHeight: 8, barCount: 5 }}
                  trackRef={audioTrack}
                  style={{
                    width: "100%",
                    height: "60px",
                    "--lk-bg": "transparent",
                    "--lk-fg": "#a78bfa",
                  }}
                  className="bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* User Card with Camera */}
        <div className="group">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-blue-500/30">
            <div className="flex flex-col items-center space-y-4">
              
              {/* Camera/Video Container */}
              <div className="relative">
                <div className="w-40 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-1 shadow-lg transition-all duration-300">
                  {isCameraOn ? (
                    <div 
                      className="w-full h-full rounded-xl bg-slate-900 overflow-hidden relative cursor-pointer"
                      onClick={handleVideoInteraction}
                    >
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                        style={{ 
                          transform: 'scaleX(-1)',
                          minWidth: '100%',
                          minHeight: '100%'
                        }}
                      />
                      <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse z-10"></div>
                      
                      {videoRef.current?.paused && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <div className="text-center p-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center">
                      <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Status indicators */}
                {isListening && !isCameraOn && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900 animate-pulse"></div>
                )}
                {isCameraOn && isListening && (
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900 animate-pulse"></div>
                )}
                {isCameraOn && !isListening && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-slate-900 animate-pulse"></div>
                )}
              </div>

              {/* User Info and Camera Controls */}
              <div className="text-center w-full">
                <h3 className="text-xl font-bold text-white">You</h3>
                <p className="text-sm text-slate-400 mt-1">Candidate</p>
                <div className="mt-2 space-y-2 w-full">
                  <span className={`inline-block text-xs px-3 py-1 rounded-full ${isListening ? 'bg-green-500/20 text-green-300' : 'bg-slate-700/50 text-slate-400'}`}>
                    {isListening ? "Speaking..." : "Ready"}
                  </span>
                  
                  <button
                    onClick={toggleCamera}
                    disabled={isCameraLoading}
                    className={`w-full flex items-center justify-center gap-2 text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${isCameraOn 
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30' 
                      : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30'
                    } ${isCameraLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isCameraLoading ? (
                      <>
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                        <span>Loading...</span>
                      </>
                    ) : isCameraOn ? (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Turn Camera Off</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Turn Camera On</span>
                      </>
                    )}
                  </button>
                </div>
                
                {cameraError && (
                  <p className="text-xs text-red-400 mt-2 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                    {cameraError}
                  </p>
                )}
                
                {!isCameraOn && !cameraError && (
                  <p className="text-xs text-slate-500 mt-2">
                    Click "Turn Camera On" to show your video
                  </p>
                )}
              </div>

              {/* Visualizer */}
              <div className="w-full pt-4">
                <BarVisualizer
                  state={isListening ? "speaking" : "idle"}
                  options={{ maxHeight: 32, minHeight: 8, barCount: 5 }}
                  style={{
                    width: "100%",
                    height: "60px",
                    "--lk-bg": "transparent",
                    "--lk-fg": "#60a5fa",
                  }}
                  className="bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Transcript Container */}
      <div className="w-full max-w-4xl">
        <div className="bg-gradient-to-r from-slate-800/80 via-slate-800/90 to-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Live Transcript</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className="text-xs text-slate-500">Mic {isListening ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                <span className="text-xs text-slate-500">Camera {isCameraOn ? 'ON' : 'OFF'}</span>
              </div>
            </div>
            <button 
              onClick={clearTranscript}
              className="text-xs text-slate-400 hover:text-slate-300 px-3 py-1 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto p-6">
            {conversation.length === 0 && !partialTranscript && !agentPartialTranscript ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Speak to start the conversation...</p>
                <p className="text-sm text-slate-600 mt-2">Your speech and AI responses will appear here in real-time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversation.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.speaker === "ai" ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.speaker === "ai" 
                      ? "bg-purple-500/10 border border-purple-500/20 rounded-bl-none" 
                      : "bg-blue-500/10 border border-blue-500/20 rounded-br-none"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${msg.speaker === "ai" ? "text-purple-400" : "text-blue-400"}`}>
                          {msg.speaker === "ai" ? "AI Interviewer" : "You"}
                        </span>
                        <span className="text-xs text-slate-500">{msg.timestamp}</span>
                      </div>
                      <p className="text-slate-200 text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                
                {/* AI Partial Transcript (Live Typing) */}
                {agentPartialTranscript && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-purple-500/5 border border-purple-500/10 rounded-bl-none">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-purple-400/70">AI (speaking...)</span>
                        <span className="text-xs text-slate-500">Now</span>
                      </div>
                      <p className="text-slate-300/70 text-sm italic leading-relaxed">{agentPartialTranscript}</p>
                    </div>
                  </div>
                )}

                {/* User Partial Transcript (Live Typing) */}
                {partialTranscript && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-br-none">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-400/70">You (speaking...)</span>
                        <span className="text-xs text-slate-500">Now</span>
                      </div>
                      <p className="text-slate-300/70 text-sm italic leading-relaxed">{partialTranscript}</p>
                    </div>
                  </div>
                )}
                
                {state === "thinking" && !agentPartialTranscript && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-purple-500/5 border border-purple-500/10 rounded-bl-none">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-purple-400/70">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={conversationEndRef} />
              </div>
            )}
          </div>

          <div className="px-6 py-3 border-t border-slate-700/50 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${state === "speaking" ? 'bg-purple-500 animate-pulse' : state === "thinking" ? 'bg-yellow-500 animate-pulse' : 'bg-slate-600'}`}></div>
                  <span className="text-xs text-slate-500">AI: {state === "speaking" ? 'Speaking' : state === "thinking" ? 'Thinking' : 'Idle'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                  <span className="text-xs text-slate-500">You: {isListening ? 'Speaking' : 'Idle'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isCameraOn ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                  <span className="text-xs text-slate-500">Camera: {isCameraOn ? 'ON' : 'OFF'}</span>
                </div>
              </div>
              <span className="text-xs text-slate-600">
                {conversation.length} message{conversation.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-slate-800/50 rounded-lg p-4 max-w-4xl w-full">
        <p className="text-xs text-slate-400 mb-2">Debug Info:</p>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500">Voice Assistant State: </span>
            <span className={`font-medium ${state === "speaking" ? "text-purple-400" : state === "listening" ? "text-green-400" : "text-slate-400"}`}>
              {state}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Chat Messages Count: </span>
            <span className="text-blue-400">{chatMessages?.length || 0}</span>
          </div>
          <div>
            <span className="text-slate-500">Camera Status: </span>
            <span className={`font-medium ${isCameraOn ? "text-green-400" : "text-slate-400"}`}>
              {isCameraOn ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-4">
        <button 
          onClick={onEndCall}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold py-3 px-10 rounded-xl shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
          <span>End Interview</span>
        </button>
      </div>
    </div>
  );
}