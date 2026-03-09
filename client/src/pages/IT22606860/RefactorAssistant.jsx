// ============================================
// client/src/pages/IT22606860/RefactorAssistant.jsx
// Main Page for AI Refactor Assistant with Chat & Code Comparison
// ============================================
import React, { useState } from 'react';
import { FaRobot, FaCode, FaComments, FaLightbulb, FaHistory } from 'react-icons/fa';
import { BiCodeBlock } from 'react-icons/bi';
import Header from '../../component/IT22606860/Header';
import Footer from '../../component/IT22606860/Footer';
import RefactorAssistantChat from '../../component/IT22606860/RefactorAssistantChat';
import CodeComparison from '../../component/IT22606860/CodeComparison';
import { analyzeCodeComparison } from '../../services/api';
import toast from 'react-hot-toast';

const RefactorAssistant = () => {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'comparison', 'insights'
  const [beforeCode, setBeforeCode] = useState('');
  const [afterCode, setAfterCode] = useState('');
  const [comparisonAnalysis, setComparisonAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const tabs = [
    { id: 'chat', label: 'AI Chat Assistant', icon: <FaComments /> },
    { id: 'comparison', label: 'Code Comparison', icon: <BiCodeBlock /> },
    { id: 'insights', label: 'Refactoring Insights', icon: <FaLightbulb /> }
  ];

  const handleAnalyzeComparison = async () => {
    if (!beforeCode.trim() || !afterCode.trim()) {
      toast.error('Please provide both before and after code');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await analyzeCodeComparison(beforeCode, afterCode);
      if (response.success) {
        setComparisonAnalysis(response.analysis);
        toast.success('Analysis completed successfully');
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze code comparison');
      // Set default analysis structure for display
      setComparisonAnalysis({
        memoryOptimization: {
          before: { estimatedMemory: 'N/A', issues: [] },
          after: { estimatedMemory: 'N/A', improvements: [] },
          improvement: 'N/A'
        },
        performance: {
          before: { timeComplexity: 'N/A', bottlenecks: [] },
          after: { timeComplexity: 'N/A', optimizations: [] },
          improvement: 'N/A'
        },
        codeQuality: {
          before: { linesOfCode: beforeCode.split('\n').length },
          after: { linesOfCode: afterCode.split('\n').length }
        },
        refactoringPatterns: [],
        risks: { resolved: [], remaining: [] }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exampleComparisons = [
    {
      name: 'Array Filter Optimization',
      before: `// Inefficient multiple iterations
const users = getAllUsers();
const adults = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].age >= 18) {
    adults.push(users[i]);
  }
}
const activeAdults = [];
for (let i = 0; i < adults.length; i++) {
  if (adults[i].active) {
    activeAdults.push(adults[i]);
  }
}`,
      after: `// Optimized single pass with method chaining
const activeAdults = getAllUsers()
  .filter(user => user.age >= 18 && user.active);`
    },
    {
      name: 'Memory-Efficient Data Processing',
      before: `// Creates multiple intermediate arrays
const processData = (data) => {
  const doubled = data.map(x => x * 2);
  const filtered = doubled.filter(x => x > 10);
  const summed = filtered.reduce((a, b) => a + b, 0);
  return summed;
}`,
      after: `// Single pass processing
const processData = (data) => {
  return data.reduce((sum, x) => {
    const doubled = x * 2;
    return doubled > 10 ? sum + doubled : sum;
  }, 0);
}`
    }
  ];

  const loadExample = (example) => {
    setBeforeCode(example.before);
    setAfterCode(example.after);
    toast.success(`Loaded example: ${example.name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <FaRobot className="text-5xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">AI Refactor Assistant</h1>
              <p className="text-xl text-indigo-100">
                Your intelligent companion for code refactoring, optimization, and best practices
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <FaCode className="text-3xl text-white mb-2" />
              <h3 className="font-semibold text-white">Code Analysis</h3>
              <p className="text-sm text-indigo-100">Deep code inspection</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <FaLightbulb className="text-3xl text-white mb-2" />
              <h3 className="font-semibold text-white">Smart Suggestions</h3>
              <p className="text-sm text-indigo-100">AI-powered improvements</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <BiCodeBlock className="text-3xl text-white mb-2" />
              <h3 className="font-semibold text-white">Before/After</h3>
              <p className="text-sm text-indigo-100">Visual comparisons</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <FaHistory className="text-3xl text-white mb-2" />
              <h3 className="font-semibold text-white">Best Practices</h3>
              <p className="text-sm text-indigo-100">Learn from experts</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 rounded-xl p-2 mb-6 flex gap-2 border border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {activeTab === 'chat' && (
            <div className="h-[700px]">
              <RefactorAssistantChat />
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-indigo-700">
                <h3 className="text-xl font-bold text-white mb-2">Code Comparison Tool</h3>
                <p className="text-gray-300 mb-4">
                  Compare your code before and after refactoring to see memory usage, performance improvements, 
                  and code quality metrics.
                </p>
                
                {/* Example Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm text-gray-400">Load Example:</span>
                  {exampleComparisons.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => loadExample(example)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      {example.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Before Refactoring</label>
                  <textarea
                    value={beforeCode}
                    onChange={(e) => setBeforeCode(e.target.value)}
                    placeholder="Paste your original code here..."
                    className="w-full h-64 bg-gray-900 text-white border border-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">After Refactoring</label>
                  <textarea
                    value={afterCode}
                    onChange={(e) => setAfterCode(e.target.value)}
                    placeholder="Paste your refactored code here..."
                    className="w-full h-64 bg-gray-900 text-white border border-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleAnalyzeComparison}
                  disabled={isAnalyzing || !beforeCode.trim() || !afterCode.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <BiCodeBlock className="text-xl" />
                      <span className="font-semibold">Analyze Comparison</span>
                    </>
                  )}
                </button>
              </div>

              {comparisonAnalysis && (
                <div className="mt-8">
                  <CodeComparison
                    beforeCode={beforeCode}
                    afterCode={afterCode}
                    analysis={comparisonAnalysis}
                    language="javascript"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-700">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <FaLightbulb className="text-yellow-400" />
                  Refactoring Insights & Best Practices
                </h3>
                <p className="text-gray-300">
                  Learn from AI-powered insights to improve your coding skills and refactoring techniques.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Memory Optimization Tips */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                    <span className="bg-blue-500 p-2 rounded-lg">💾</span>
                    Memory Optimization
                  </h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Use array methods (filter, map, reduce) instead of loops when possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Avoid creating unnecessary intermediate arrays</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Use WeakMap/WeakSet for cache that should be garbage collected</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Clean up event listeners and timers properly</span>
                    </li>
                  </ul>
                </div>

                {/* Performance Tips */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                    <span className="bg-yellow-500 p-2 rounded-lg">⚡</span>
                    Performance Optimization
                  </h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>Reduce time complexity by choosing appropriate data structures</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>Debounce/throttle expensive operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>Use memoization for expensive computations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>Lazy load components and data when appropriate</span>
                    </li>
                  </ul>
                </div>

                {/* Code Quality Tips */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                    <span className="bg-green-500 p-2 rounded-lg">✨</span>
                    Code Quality
                  </h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Follow Single Responsibility Principle</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Use descriptive variable and function names</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Keep functions small and focused</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Write self-documenting code with clear intent</span>
                    </li>
                  </ul>
                </div>

                {/* Refactoring Patterns */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                    <span className="bg-purple-500 p-2 rounded-lg">🔧</span>
                    Refactoring Patterns
                  </h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Extract Method: Break down large functions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Replace Conditional with Polymorphism</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Introduce Parameter Object for related parameters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Use Strategy Pattern for algorithm variations</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Additional Resources */}
              <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-indigo-700">
                <h4 className="font-bold text-white mb-3 text-lg">📚 Learning Resources</h4>
                <p className="text-gray-300 mb-4">
                  Ask the AI Assistant questions like:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-indigo-300 text-sm">"How can I reduce memory usage in loops?"</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-indigo-300 text-sm">"What are common performance bottlenecks?"</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-indigo-300 text-sm">"How do I apply SOLID principles?"</p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-indigo-300 text-sm">"What refactoring pattern should I use here?"</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RefactorAssistant;
