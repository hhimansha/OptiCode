// ============================================
// client/src/component/IT22606860/AIAssistantWidget.jsx
// Quick Access Widget for AI Assistant (can be added to Home page)
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaComments, FaCode, FaLightbulb, FaArrowRight } from 'react-icons/fa';

const AIAssistantWidget = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-indigo-700 shadow-xl">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-4 rounded-xl">
          <FaRobot className="text-3xl text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-2">AI Refactor Assistant</h3>
          <p className="text-gray-300">
            Get instant help with code refactoring, performance optimization, and best practices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <FaComments />
            <span className="font-semibold text-sm">Chat Assistant</span>
          </div>
          <p className="text-xs text-gray-400">Ask questions about refactoring</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <FaCode />
            <span className="font-semibold text-sm">Code Comparison</span>
          </div>
          <p className="text-xs text-gray-400">Compare before/after metrics</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2 text-pink-400 mb-1">
            <FaLightbulb />
            <span className="font-semibold text-sm">Smart Insights</span>
          </div>
          <p className="text-xs text-gray-400">Learn best practices</p>
        </div>
      </div>

      <Link
        to="/assistant"
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 font-semibold"
      >
        <span>Open AI Assistant</span>
        <FaArrowRight />
      </Link>
    </div>
  );
};

export default AIAssistantWidget;
