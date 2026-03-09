import React, { useState, useEffect, useRef } from 'react';

const AIInterview = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const recognitionRef = useRef(null);
  const conversationEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setTranscript(speechToText);
        handleSendMessage(speechToText);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startInterview = async () => {
    setInterviewStarted(true);
    setIsLoading(true);
    
    // Simulate AI response for demo
    setTimeout(() => {
      handleAIResponse({
        text: "Hello! I'm your AI interviewer today. I'll be asking you questions about React.js. Let's start with an easy one: Can you explain what React hooks are and why they were introduced?",
        sessionId: 'demo-' + Date.now()
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    setConversation(prev => [...prev, { speaker: 'user', text: message }]);
    setTranscript('');
    setIsLoading(true);

    // Simulate AI response for demo
    setTimeout(() => {
      const responses = [
        "That's a great explanation! Let me follow up: How does the useEffect hook work, and what are its dependencies?",
        "Excellent answer! Now, can you explain the difference between controlled and uncontrolled components in React?",
        "Very good! Here's a more challenging question: What is the Virtual DOM and how does React's reconciliation algorithm work?",
        "Impressive knowledge! Let's talk about performance: What techniques would you use to optimize a React application?"
      ];
      
      handleAIResponse({
        text: responses[Math.floor(Math.random() * responses.length)]
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleAIResponse = (data) => {
    if (data.text) {
      setConversation(prev => [...prev, { speaker: 'ai', text: data.text }]);
      speakText(data.text);
      
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
      }
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
   
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-2">
            <h1 className="text-4xl md:text-5xl font-bold">React AI Interview</h1>
          </div>
          <p className="text-gray-600 text-lg">Practice your React.js skills with an intelligent AI interviewer</p>
        </div>

        {!interviewStarted ? (
          /* Start Screen */
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center transform transition-all hover:scale-105">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-5xl mb-6 shadow-lg">
                🤖
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Begin?</h2>
              <p className="text-gray-600 mb-2">Get ready for an interactive interview experience</p>
              <p className="text-sm text-gray-500">You can use voice or text to answer questions</p>
            </div>
            
            <button 
              onClick={startInterview}
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Starting Interview...
                </span>
              ) : (
                'Start Interview'
              )}
            </button>
          </div>
        ) : (
          /* Interview Screen */
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Conversation Area */}
            <div className="h-96 md:h-[500px] overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
              <div className="space-y-4">
                {conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div className={`flex items-start max-w-xs md:max-w-md ${msg.speaker === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`flex-shrink-0 ${msg.speaker === 'user' ? 'ml-3' : 'mr-3'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                          msg.speaker === 'user' 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md' 
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md'
                        }`}>
                          {msg.speaker === 'user' ? '👤' : '🤖'}
                        </div>
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`px-4 py-3 rounded-2xl shadow-md ${
                        msg.speaker === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex items-start max-w-xs md:max-w-md">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                          🤖
                        </div>
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-white shadow-md border border-gray-200">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={conversationEndRef} />
              </div>
            </div>

            {/* Controls Area */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-t border-gray-200">
              {/* Voice Button */}
              <div className="flex justify-center mb-4">
                <button
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-full font-semibold shadow-lg transform transition-all ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white scale-110 animate-pulse'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:scale-105'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <span className="flex items-center text-lg">
                    <span className="mr-2">{isListening ? '🛑' : '🎤'}</span>
                    {isListening ? 'Stop Recording' : 'Speak Answer'}
                  </span>
                </button>
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-center animate-fade-in">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">You said:</span> "{transcript}"
                  </p>
                </div>
              )}

              {/* Text Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Or type your answer here..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(transcript)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={() => handleSendMessage(transcript)}
                  disabled={!transcript.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AIInterview;