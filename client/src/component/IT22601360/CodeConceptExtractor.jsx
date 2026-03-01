/**
 * Code Concept Extractor - Main Component
 * Student: IT22601360
 *
 * Auto-saves to MongoDB immediately after a successful extraction.
 */

import React, { useState, useCallback, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import ConceptList from './ConceptList';
import ConceptGraph from './ConceptGraph';
import DistributionChart from './DistributionChart';
import ConceptDetails from './ConceptDetails';
import RecommendedCourses from './RecommendedCourses';
import FileTreeView from './FileTreeView';
import { conceptExtractorApi, conceptHistoryApi } from '../../modules/IT22601360/conceptExtractorApi';

const SAMPLE_CODE = `def binary_search(arr, target):
    """Binary search algorithm - O(log n)"""
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1


class Stack:
    """Stack data structure using array"""
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        raise IndexError("Stack is empty")
    
    def is_empty(self):
        return len(self.items) == 0
`;

const CodeConceptExtractor = () => {
    const [code, setCode]                         = useState(SAMPLE_CODE);
    const [language, setLanguage]                 = useState('python');
    const [isLoading, setIsLoading]               = useState(false);
    const [error, setError]                       = useState(null);
    const [extractionResult, setExtractionResult] = useState(null);
    const [selectedConcept, setSelectedConcept]   = useState(null);
    const [activeTab, setActiveTab]               = useState('list');
    const [showFileTree, setShowFileTree]         = useState(true);
    const [supportedLanguages, setSupportedLanguages] = useState([
        'python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust'
    ]);
    const [serviceStatus, setServiceStatus] = useState('checking');

    // Auto-save status: 'idle' | 'saving' | 'saved' | 'error'
    const [saveStatus, setSaveStatus] = useState('idle');
    const [savedId, setSavedId]       = useState(null);

    useEffect(() => {
        checkServiceHealth();
        loadSupportedLanguages();
    }, []);

    const checkServiceHealth = async () => {
        try {
            const health = await conceptExtractorApi.healthCheck();
            setServiceStatus(health.status === 'healthy' ? 'online' : 'offline');
        } catch {
            setServiceStatus('offline');
        }
    };

    const loadSupportedLanguages = async () => {
        try {
            const result = await conceptExtractorApi.getSupportedLanguages();
            if (result.languages) setSupportedLanguages(result.languages);
        } catch {}
    };

    // ── Auto-save helper ──────────────────────────────────────────────────────
    const autoSave = async (result, sourceCode, lang) => {
        setSaveStatus('saving');
        setSavedId(null);
        try {
            const saved = await conceptHistoryApi.saveExtraction(result, sourceCode, lang);
            setSavedId(saved.data?.id || null);
            setSaveStatus('saved');
            console.log('✅ Auto-saved extraction:', saved.data?.id);
        } catch (err) {
            console.error('❌ Auto-save failed:', err.message);
            setSaveStatus('error');
        }
    };

    // ── Analyze + auto-save ───────────────────────────────────────────────────
    const handleAnalyze = useCallback(async () => {
        if (!code.trim()) {
            setError('Please enter some code to analyze');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSelectedConcept(null);
        setSaveStatus('idle');
        setSavedId(null);

        try {
            const result = await conceptExtractorApi.extractConcepts(code, language);
            setExtractionResult(result);

            if (!result.concepts || result.concepts.length === 0) {
                setError('No concepts detected. Try adding more code.');
                return;
            }

            // ✅ Auto-save immediately after successful extraction
            await autoSave(result, code, language);

        } catch (err) {
            setError(err.message || 'Analysis failed. Please try again.');
            setExtractionResult(null);
        } finally {
            setIsLoading(false);
        }
    }, [code, language]);

    const handleConceptClick = useCallback((concept) => setSelectedConcept(concept), []);
    const handleCloseDetails = useCallback(() => setSelectedConcept(null), []);

    const handleClear = useCallback(() => {
        setCode('');
        setExtractionResult(null);
        setSelectedConcept(null);
        setError(null);
        setSaveStatus('idle');
        setSavedId(null);
    }, []);

    const handleLoadSample = useCallback(() => {
        setCode(SAMPLE_CODE);
        setLanguage('python');
    }, []);

    // ── Save status badge ─────────────────────────────────────────────────────
    const SaveBadge = () => {
        if (saveStatus === 'idle') return null;
        const config = {
            saving: { bg: 'bg-yellow-500/20 border-yellow-500/30', text: 'text-yellow-400', label: '💾 Saving...' },
            saved:  { bg: 'bg-green-500/20 border-green-500/30',   text: 'text-green-400',  label: '✅ Saved'     },
            error:  { bg: 'bg-red-500/20 border-red-500/30',       text: 'text-red-400',    label: '❌ Save failed'}
        }[saveStatus];

        return (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${config.bg} ${config.text}`}>
                {config.label}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-black/20 sticky top-0 z-50">
                <div className="mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <span className="text-2xl">🔍</span>
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    AI Code Concept Extractor
                                </h1>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                                serviceStatus === 'online'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                                <span className={`w-2 h-2 rounded-full animate-pulse ${serviceStatus === 'online' ? 'bg-green-400' : 'bg-red-400'}`} />
                                {serviceStatus === 'online' ? 'AI Online' : 'AI Offline'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="mx-auto p-6">
                <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">

                    {/* Left Panel */}
                    <div className="col-span-6 flex gap-4">
                        {showFileTree && (
                            <div className="w-64 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col">
                                <FileTreeView onFileSelect={() => {}} />
                            </div>
                        )}

                        <div className="flex-1 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col">
                            <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowFileTree(!showFileTree)}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                        </button>
                                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <span className="text-xl">📝</span> Code Input
                                        </h2>
                                    </div>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    >
                                        {supportedLanguages.map(lang => (
                                            <option key={lang} value={lang}>
                                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <CodeEditor code={code} setCode={setCode} language={language} />
                            </div>

                            <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex gap-3">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isLoading || !code.trim()}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <><span className="text-lg">🚀</span> Analyze Code</>
                                    )}
                                </button>
                                <button onClick={handleLoadSample} className="px-5 py-3 bg-slate-800 text-gray-300 rounded-xl font-medium hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-2">
                                    <span>📋</span> Sample
                                </button>
                                <button onClick={handleClear} className="px-5 py-3 bg-slate-800 text-gray-300 rounded-xl font-medium hover:bg-red-900/50 hover:text-red-400 border border-slate-700 hover:border-red-800 transition-all flex items-center gap-2">
                                    <span>🗑️</span> Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="col-span-6 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col">
                        <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="text-xl">📊</span> Analysis Results
                                </h2>
                                {extractionResult && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/30">
                                            🎯 {extractionResult.concepts?.length || 0} concepts
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium border border-green-500/30">
                                            ⚡ {extractionResult.processingTime}s
                                        </div>
                                        {/* Auto-save status badge */}
                                        <SaveBadge />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        {extractionResult && (
                            <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex gap-2 overflow-x-auto">
                                {[
                                    { id: 'list',    icon: '📋', label: 'Concepts' },
                                    { id: 'chart',   icon: '📊', label: 'Chart'    },
                                    { id: 'graph',   icon: '🕸️', label: 'Graph'    },
                                    { id: 'courses', icon: '🎓', label: 'Courses'  }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                                            activeTab === tab.id
                                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-slate-800 text-gray-400 hover:bg-slate-700 border border-slate-700'
                                        }`}
                                    >
                                        <span>{tab.icon}</span>{tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {error && (
                                <div className="m-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <h3 className="font-semibold text-red-400 mb-1">Error</h3>
                                        <p className="text-red-300 text-sm">{error}</p>
                                    </div>
                                </div>
                            )}

                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-4" />
                                    <h3 className="text-lg font-semibold text-white mb-2">Analyzing Your Code</h3>
                                    <p className="text-sm text-gray-400">AI is extracting concepts...</p>
                                </div>
                            )}

                            {!isLoading && !extractionResult && !error && (
                                <div className="flex flex-col items-center justify-center h-full px-6">
                                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                        <span className="text-5xl">🔬</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No Analysis Yet</h3>
                                    <p className="text-gray-400 text-center max-w-md">
                                        Paste your code and click <strong className="text-blue-400">"Analyze Code"</strong> — results are saved automatically.
                                    </p>
                                </div>
                            )}

                            {!isLoading && extractionResult && (
                                <>
                                    {activeTab === 'list'    && <ConceptList concepts={extractionResult.concepts} onConceptClick={handleConceptClick} />}
                                    {activeTab === 'chart'   && <DistributionChart data={extractionResult.concepts} />}
                                    {activeTab === 'graph'   && <ConceptGraph data={extractionResult.concepts} />}
                                    {activeTab === 'courses' && <RecommendedCourses concepts={extractionResult.concepts} language={language} />}
                                </>
                            )}
                        </div>

                        {/* Metrics Footer */}
                        {extractionResult?.metrics && (
                            <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700">
                                <div className="flex items-center justify-around">
                                    <span className="text-sm text-gray-300">📄 {extractionResult.metrics.linesOfCode} lines</span>
                                    <span className="text-sm text-gray-300">⚡ {extractionResult.metrics.functionsFound} functions</span>
                                    <span className="text-sm text-gray-300">🏛️ {extractionResult.metrics.classesFound} classes</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedConcept && (
                <ConceptDetails concept={selectedConcept} codeContext={code} onClose={handleCloseDetails} />
            )}
        </div>
    );
};

export default CodeConceptExtractor;