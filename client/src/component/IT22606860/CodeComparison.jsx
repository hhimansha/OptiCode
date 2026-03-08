// ============================================
// client/src/component/IT22606860/CodeComparison.jsx
// Before/After Code Comparison with Memory & Performance Analysis
// ============================================
import React, { useState } from 'react';
import { FaCode, FaMemory, FaBolt, FaCheckCircle, FaExclamationCircle, FaChartLine, FaClock } from 'react-icons/fa';
import { BiGitCompare } from 'react-icons/bi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeComparison = ({ beforeCode, afterCode, analysis, language = 'javascript' }) => {
  const [viewMode, setViewMode] = useState('split'); // 'split', 'before', 'after'

  const defaultAnalysis = {
    memoryOptimization: {
      before: {
        estimatedMemory: 'N/A',
        complexityScore: 'N/A',
        issues: []
      },
      after: {
        estimatedMemory: 'N/A',
        complexityScore: 'N/A',
        improvements: []
      },
      improvement: 'N/A'
    },
    performance: {
      before: {
        timeComplexity: 'N/A',
        spaceComplexity: 'N/A',
        bottlenecks: []
      },
      after: {
        timeComplexity: 'N/A',
        spaceComplexity: 'N/A',
        optimizations: []
      },
      improvement: 'N/A'
    },
    codeQuality: {
      before: {
        linesOfCode: beforeCode?.split('\n').length || 0,
        maintainabilityIndex: 'N/A',
        cyclomaticComplexity: 'N/A'
      },
      after: {
        linesOfCode: afterCode?.split('\n').length || 0,
        maintainabilityIndex: 'N/A',
        cyclomaticComplexity: 'N/A'
      }
    },
    refactoringPatterns: [],
    risks: {
      resolved: [],
      remaining: []
    }
  };

  const analysisData = analysis || defaultAnalysis;

  const MetricCard = ({ icon, title, before, after, improvement, color }) => (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <div className={`text-${color}-500`}>{icon}</div>
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400 mb-1">Before</p>
          <p className="text-lg font-bold text-red-400">{before}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">After</p>
          <p className="text-lg font-bold text-green-400">{after}</p>
        </div>
      </div>
      {improvement && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-sm text-indigo-400 font-medium">
            ↓ {improvement} improvement
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg">
            <BiGitCompare className="text-2xl text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Code Comparison & Analysis</h3>
            <p className="text-sm text-gray-400">Before vs After Refactoring</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('split')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'split'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode('before')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'before'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Before
          </button>
          <button
            onClick={() => setViewMode('after')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'after'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            After
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<FaMemory className="text-xl" />}
          title="Memory Usage"
          before={analysisData.memoryOptimization.before.estimatedMemory}
          after={analysisData.memoryOptimization.after.estimatedMemory}
          improvement={analysisData.memoryOptimization.improvement}
          color="blue"
        />
        <MetricCard
          icon={<FaBolt className="text-xl" />}
          title="Time Complexity"
          before={analysisData.performance.before.timeComplexity}
          after={analysisData.performance.after.timeComplexity}
          improvement={analysisData.performance.improvement}
          color="yellow"
        />
        <MetricCard
          icon={<FaChartLine className="text-xl" />}
          title="Lines of Code"
          before={analysisData.codeQuality.before.linesOfCode}
          after={analysisData.codeQuality.after.linesOfCode}
          improvement={
            analysisData.codeQuality.before.linesOfCode > analysisData.codeQuality.after.linesOfCode
              ? `${Math.round(((analysisData.codeQuality.before.linesOfCode - analysisData.codeQuality.after.linesOfCode) / analysisData.codeQuality.before.linesOfCode) * 100)}%`
              : null
          }
          color="green"
        />
      </div>

      {/* Code Comparison */}
      <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr' }}>
        {(viewMode === 'split' || viewMode === 'before') && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="bg-red-900/30 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
              <FaExclamationCircle className="text-red-400" />
              <span className="font-semibold text-white">Before Refactoring</span>
              <span className="ml-auto text-xs text-gray-400">
                {analysisData.codeQuality.before.linesOfCode} lines
              </span>
            </div>
            <div className="overflow-x-auto">
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                  background: 'transparent'
                }}
                showLineNumbers
              >
                {beforeCode || '// No code provided'}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {(viewMode === 'split' || viewMode === 'after') && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="bg-green-900/30 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <span className="font-semibold text-white">After Refactoring</span>
              <span className="ml-auto text-xs text-gray-400">
                {analysisData.codeQuality.after.linesOfCode} lines
              </span>
            </div>
            <div className="overflow-x-auto">
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                  background: 'transparent'
                }}
                showLineNumbers
              >
                {afterCode || '// No code provided'}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Memory Optimization Details */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <FaMemory className="text-blue-500" />
            Memory Optimization
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-2">Issues Found (Before)</p>
              <ul className="space-y-1">
                {analysisData.memoryOptimization.before.issues?.length > 0 ? (
                  analysisData.memoryOptimization.before.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-red-400 flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      {issue}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">No specific issues identified</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Improvements Applied (After)</p>
              <ul className="space-y-1">
                {analysisData.memoryOptimization.after.improvements?.length > 0 ? (
                  analysisData.memoryOptimization.after.improvements.map((improvement, i) => (
                    <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {improvement}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">No specific improvements tracked</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Optimization Details */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <FaBolt className="text-yellow-500" />
            Performance Optimization
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-2">Bottlenecks (Before)</p>
              <ul className="space-y-1">
                {analysisData.performance.before.bottlenecks?.length > 0 ? (
                  analysisData.performance.before.bottlenecks.map((bottleneck, i) => (
                    <li key={i} className="text-sm text-red-400 flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      {bottleneck}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">No bottlenecks identified</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Optimizations (After)</p>
              <ul className="space-y-1">
                {analysisData.performance.after.optimizations?.length > 0 ? (
                  analysisData.performance.after.optimizations.map((optimization, i) => (
                    <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      {optimization}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">No specific optimizations tracked</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Refactoring Patterns Applied */}
      {analysisData.refactoringPatterns?.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <FaCode className="text-indigo-500" />
            Refactoring Patterns Applied
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysisData.refactoringPatterns.map((pattern, i) => (
              <span
                key={i}
                className="bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full text-sm border border-indigo-700"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risk Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <FaCheckCircle className="text-green-500" />
            Risks Resolved
          </h4>
          <ul className="space-y-2">
            {analysisData.risks?.resolved?.length > 0 ? (
              analysisData.risks.resolved.map((risk, i) => (
                <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  {risk}
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500">No risks resolved</li>
            )}
          </ul>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <FaExclamationCircle className="text-yellow-500" />
            Remaining Risks
          </h4>
          <ul className="space-y-2">
            {analysisData.risks?.remaining?.length > 0 ? (
              analysisData.risks.remaining.map((risk, i) => (
                <li key={i} className="text-sm text-yellow-400 flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">!</span>
                  {risk}
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500">No remaining risks</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeComparison;
