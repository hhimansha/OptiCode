import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ onCreateInterview, loading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: "scheduled",
      label: "Scheduled Interview",
      path: "/scheduled",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "all",
      label: "All Interview",
      path: "/interviews",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      id: "billing",
      label: "Billing",
      path: "/billing",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      path: "/settings",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-[#0a0e17] border-r border-white/5 flex flex-col">
      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        
        .sidebar-font {
          font-family: 'Sora', sans-serif;
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .shimmer-btn {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .menu-item {
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 0;
          background: linear-gradient(180deg, #06b6d4, #8b5cf6);
          border-radius: 0 4px 4px 0;
          transition: height 0.3s ease;
        }

        .menu-item.active::before,
        .menu-item:hover::before {
          height: 60%;
        }

        .menu-item.active {
          background: rgba(6, 182, 212, 0.1);
        }
      `}</style>

      {/* Logo Section */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-xl border border-cyan-400/30 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
          </div>
          
          {/* Logo Text */}
          <div className="sidebar-font">
            <span className="text-xl font-bold">
              <span className="text-cyan-400">AI</span>
              <span className="text-white">cruiter</span>
            </span>
          </div>
        </div>
      </div>

      {/* Create Interview Button */}
      <div className="px-4 mb-6">
        <button
          onClick={onCreateInterview}
          disabled={loading}
          className="group relative w-full py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Button Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300 group-hover:scale-105" />
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 shimmer-btn opacity-0 group-hover:opacity-100" />
          
          {/* Button Content */}
          <span className="relative flex items-center justify-center gap-2 text-slate-900 font-semibold sidebar-font">
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

      {/* Navigation Menu */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`menu-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 sidebar-font ${
                  isActive(item.path)
                    ? 'active text-cyan-400'
                    : hoveredItem === item.id
                    ? 'text-white bg-white/5'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {/* Icon */}
                <span className={`transition-colors duration-300 ${
                  isActive(item.path) ? 'text-cyan-400' : hoveredItem === item.id ? 'text-cyan-400' : ''
                }`}>
                  {item.icon}
                </span>
                
                {/* Label */}
                <span className="text-sm font-medium">{item.label}</span>

                {/* Active indicator dot */}
                {isActive(item.path) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section - User/Upgrade */}
      <div className="p-4 border-t border-white/5">
        {/* Upgrade Card */}
        <div className="bg-gradient-to-br from-violet-600/20 to-cyan-600/20 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-xs font-semibold sidebar-font">Upgrade to Pro</p>
              <p className="text-slate-400 text-[10px]">Get unlimited interviews</p>
            </div>
          </div>
          <button className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all duration-300 sidebar-font">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;