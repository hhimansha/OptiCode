import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const Interviewquestion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Mock data for previously created interviews (empty for now)
  const [interviews, setInterviews] = useState([]);

  const createInterview = async () => {
    try {
      setLoading(true);

   const response = await fetch(
  "http://localhost:5000/api/question/generate-questions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include" // this replaces 'withCredentials: true'
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
    <div className="min-h-screen bg-[#05080f] flex">
      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        
        * {
          font-family: 'Sora', sans-serif;
        }
        
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.2); }
          50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.4); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .animated-bg {
          background: linear-gradient(-45deg, #05080f, #0a1628, #0f172a, #05080f);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(6, 182, 212, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(6, 182, 212, 0.1);
        }

        .card-cyan:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(6, 182, 212, 0.15);
        }

        .card-violet:hover {
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(139, 92, 246, 0.15);
        }

        .icon-glow-cyan {
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
        }

        .icon-glow-violet {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #8b5cf6);
          border-radius: 10px;
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar onCreateInterview={createInterview} loading={loading} />

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 animated-bg">
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />

          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[150px]" />
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 h-screen overflow-y-auto custom-scrollbar p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Welcome Header Card */}
            <div className="glass rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                    Welcome Back, <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">navinda</span>
                  </h1>
                  <p className="text-slate-400 text-sm md:text-base">
                    AI-Driven Interviews, Hassle-Free Hiring
                  </p>
                </div>
                
                {/* User Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl md:text-2xl font-semibold shadow-lg shadow-emerald-500/20">
                    S
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-[#0a1628] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-violet-500 rounded-full" />
                <h2 className="text-xl font-semibold text-white">Dashboard</h2>
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Create New Interview Card */}
                <button
                  onClick={createInterview}
                  disabled={loading}
                  onMouseEnter={() => setHoveredCard('interview')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="glass-card card-cyan rounded-2xl p-6 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center transition-all duration-300 ${hoveredCard === 'interview' ? 'icon-glow-cyan scale-110' : ''}`}>
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <svg className={`w-5 h-5 text-slate-500 transition-all duration-300 ${hoveredCard === 'interview' ? 'text-cyan-400 translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${hoveredCard === 'interview' ? 'text-cyan-400' : 'text-white'}`}>
                    {loading ? 'Creating Interview...' : 'Create New Interview'}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Create AI Interviews and schedule them with Candidates
                  </p>

                  {/* Loading indicator */}
                  {loading && (
                    <div className="mt-4 flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-cyan-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-cyan-400 text-xs mono">Generating questions...</span>
                    </div>
                  )}
                </button>

                {/* Create Phone Screening Call Card */}
                <button
                  onMouseEnter={() => setHoveredCard('phone')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="glass-card card-violet rounded-2xl p-6 text-left group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center transition-all duration-300 ${hoveredCard === 'phone' ? 'icon-glow-violet scale-110' : ''}`}>
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <svg className={`w-5 h-5 text-slate-500 transition-all duration-300 ${hoveredCard === 'phone' ? 'text-violet-400 translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${hoveredCard === 'phone' ? 'text-violet-400' : 'text-white'}`}>
                    Create Phone Screening Call
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Schedule phone screening call with candidates
                  </p>
                </button>
              </div>
            </div>

            {/* Previously Created Interviews Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-violet-400 to-pink-500 rounded-full" />
                <h2 className="text-xl font-semibold text-white">Previously Created Interviews</h2>
              </div>

              {/* Empty State or Interview List */}
              {interviews.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  {/* Empty State Icon */}
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center float-animation">
                      <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {/* Decorative rings */}
                    <div className="absolute inset-0 rounded-2xl border border-slate-700/30 scale-125 opacity-50" />
                    <div className="absolute inset-0 rounded-2xl border border-slate-700/20 scale-150 opacity-30" />
                  </div>

                  <h3 className="text-white text-lg font-medium mb-2">
                    You don't have any interview created!
                  </h3>
                  <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
                    Get started by creating your first AI-powered interview session
                  </p>

                  {/* Create New Interview Button */}
                  <button
                    onClick={createInterview}
                    disabled={loading}
                    className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 overflow-hidden disabled:opacity-50"
                  >
                    {/* Button Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300 group-hover:scale-105" />
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
                    
                    {/* Button Content */}
                    <span className="relative flex items-center gap-2 text-slate-900 font-semibold">
                      {loading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Create New Interview</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              ) : (
                /* Interview List - when interviews exist */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {interviews.map((interview, index) => (
                    <div key={index} className="glass-card rounded-xl p-5">
                      {/* Interview card content would go here */}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Interviews", value: "0", icon: "📊", color: "cyan" },
                { label: "Candidates", value: "0", icon: "👥", color: "violet" },
                { label: "This Week", value: "0", icon: "📅", color: "emerald" },
                { label: "Success Rate", value: "0%", icon: "🎯", color: "amber" },
              ].map((stat, index) => (
                <div key={index} className="glass rounded-xl p-4 text-center">
                  <span className="text-2xl mb-2 block">{stat.icon}</span>
                  <div className={`text-2xl font-bold mb-1 ${
                    stat.color === 'cyan' ? 'text-cyan-400' :
                    stat.color === 'violet' ? 'text-violet-400' :
                    stat.color === 'emerald' ? 'text-emerald-400' :
                    'text-amber-400'
                  }`}>
                    {stat.value}
                  </div>
                  <div className="text-slate-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Interviewquestion;