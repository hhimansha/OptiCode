import React, { useState } from 'react';
import {
    FaMagic, FaCopy, FaDownload, FaTrash, FaPlay, FaCheckCircle, FaRobot, FaShieldAlt
} from 'react-icons/fa';
import { Toaster, toast } from 'sonner';
import CodeEditor from '../../component/IT22606860/CodeEditor';
import LoadingSpinner from '../../component/IT22606860/LoadingSpinner';
import RiskAnalysisPanel from '../../component/IT22606860/RiskAnalysisPanel';

// Import API functions
import {
    refactorCode,
    applyCompleteRefactoring, // NEW: Unified comprehensive refactoring
    executeCode,
    analyzeRefactoringRisk
} from '../../services/api';

const RefactorPage = () => {
    // Basic states
    const [inputCode, setInputCode] = useState('');
    const [refactoredCode, setRefactoredCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [loading, setLoading] = useState(false);
    const [processingTime, setProcessingTime] = useState(null);

    // Execution states
    const [executingInput, setExecutingInput] = useState(false);
    const [executingRefactored, setExecutingRefactored] = useState(false);
    const [inputOutput, setInputOutput] = useState('');
    const [inputError, setInputError] = useState('');
    const [refactoredOutput, setRefactoredOutput] = useState('');
    const [refactoredError, setRefactoredError] = useState('');

    // Risk analysis states
    const [analyzingRisk, setAnalyzingRisk] = useState(false);
    const [riskData, setRiskData] = useState(null);
    const [riskError, setRiskError] = useState('');

    // ============================================
    // HANDLERS
    // ============================================

    const handleRefactor = async () => {
        if (!inputCode.trim()) {
            toast.error('Please enter code to refactor');
            return;
        }

        console.log('[REFACTOR] Starting UNIFIED refactoring process...');
        console.log('[REFACTOR] Input code length:', inputCode.length);

        setLoading(true);
        setRefactoredCode('');
        setProcessingTime(null);
        setRefactoredOutput('');
        setRefactoredError('');
        setRiskData(null);
        setRiskError('');

        try {
            console.log('[REFACTOR] 🚀 Calling unified comprehensive refactoring API...');

            // Use the new unified endpoint that applies ALL refactoring patterns
            const response = await applyCompleteRefactoring(inputCode, {
                apply_basic: true,
                apply_priority: true,
                apply_advanced: true,
                apply_performance: true
            });

            console.log('[REFACTOR] Full API response:', response);
            console.log('[REFACTOR] Response success:', response.success);
            console.log('[REFACTOR] Response refactored_code:', response.refactored_code);

            if (response.success) {
                const refactored = response.refactored_code || '';

                console.log('[REFACTOR] Setting refactored code, length:', refactored.length);
                console.log('[REFACTOR] Total changes applied:', response.summary?.total_changes || 0);
                console.log('[REFACTOR] Stages applied:', Object.keys(response.stages || {}));

                if (!refactored || refactored.trim() === '') {
                    console.error('[REFACTOR] ERROR: Refactored code is empty!');
                    toast.error('Refactoring returned empty code');
                    return;
                }

                setRefactoredCode(refactored);
                setProcessingTime(response.summary?.processing_time_ms || response.processing_time);

                // Show success message with details
                const changesCount = response.summary?.total_changes || 0;
                toast.success(
                    `✅ Code refactored successfully! ${changesCount} improvements applied across ${Object.keys(response.stages || {}).length} stages.`
                );

                console.log('[REFACTOR] Refactoring complete!');
            } else {
                console.error('[REFACTOR] Response success is false');
                toast.error(response.message || 'Failed to refactor code');
            }
        } catch (error) {
            console.error('[REFACTOR] Error caught:', error);
            console.error('[REFACTOR] Error message:', error.message);
            console.error('[REFACTOR] Error stack:', error.stack);
            toast.error(error.message || 'An error occurred during refactoring');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeRisk = async () => {
        if (!inputCode.trim() || !refactoredCode.trim()) {
            toast.error('Please refactor code first to analyze risk');
            return;
        }

        setAnalyzingRisk(true);
        setRiskData(null);
        setRiskError('');

        try {
            console.log('[RISK] Starting risk analysis...');
            const response = await analyzeRefactoringRisk(inputCode, refactoredCode, language);

            if (response.success) {
                setRiskData(response);
                toast.success('Risk analysis completed!');
            } else {
                setRiskError(response.message || 'Failed to analyze risk');
                toast.error('Risk analysis failed');
            }
        } catch (error) {
            console.error('[RISK] Error:', error);
            setRiskError(error.message);
            toast.error(error.message || 'Failed to analyze risk');
        } finally {
            setAnalyzingRisk(false);
        }
    };

    const handleExecuteInput = async () => {
        if (!inputCode.trim()) {
            toast.error('Please enter code to execute');
            return;
        }

        setExecutingInput(true);
        setInputOutput('');
        setInputError('');

        try {
            const response = await executeCode(inputCode);

            if (response.success) {
                setInputOutput(response.output || 'Code executed successfully (no output)');
                if (response.error) {
                    setInputError(response.error);
                }
                toast.success('Input code executed successfully!');
            } else {
                setInputError(response.error || 'Execution failed');
                toast.error('Execution failed');
            }
        } catch (error) {
            console.error('Execution error:', error);
            setInputError(error.message);
            toast.error(error.message || 'An error occurred during execution');
        } finally {
            setExecutingInput(false);
        }
    };

    const handleExecuteRefactored = async () => {
        if (!refactoredCode.trim()) {
            toast.error('Please refactor code first');
            return;
        }

        setExecutingRefactored(true);
        setRefactoredOutput('');
        setRefactoredError('');

        try {
            const response = await executeCode(refactoredCode);

            if (response.success) {
                setRefactoredOutput(response.output || 'Code executed successfully (no output)');
                if (response.error) {
                    setRefactoredError(response.error);
                }
                toast.success('Refactored code executed successfully!');
            } else {
                setRefactoredError(response.error || 'Execution failed');
                toast.error('Execution failed');
            }
        } catch (error) {
            console.error('Execution error:', error);
            setRefactoredError(error.message);
            toast.error(error.message || 'An error occurred during execution');
        } finally {
            setExecutingRefactored(false);
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied to clipboard!');
    };

    const handleDownload = (code, filename) => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Code downloaded!');
    };

    const handleClear = () => {
        setInputCode('');
        setRefactoredCode('');
        setProcessingTime(null);
        setInputOutput('');
        setInputError('');
        setRefactoredOutput('');
        setRefactoredError('');
        setRiskData(null);
        setRiskError('');
        toast.success('Cleared!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Toaster />

            {/* Enhanced Header */}
            <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                            <FaRobot className="text-white text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                                AI Code Refactor
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">Powered by Advanced AI</p>
                        </div>
                    </div>
                    <p className="text-slate-400 text-lg ml-16">Transform your code with 100+ AST refactoring patterns</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Language Selection Card */}
                <div className="mb-8 bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm hover:border-slate-600 transition-all duration-300 shadow-lg shadow-slate-900/50">
                    <label className="block text-sm font-semibold text-slate-200 mb-3">Programming Language</label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full md:w-48 px-4 py-3 bg-slate-800/80 text-slate-100 border border-slate-700 rounded-lg focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all hover:border-slate-600"
                    >
                        <option value="python">Python</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-2">\ud83d\ude80 100+ AST Patterns + Performance Optimization</p>
                </div>

                {/* Code Editors Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Input Editor Card */}
                    <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm hover:border-slate-600 transition-all duration-300 shadow-lg shadow-slate-900/50 hover:shadow-xl hover:shadow-blue-500/10">
                        <div className="border-b border-slate-700/50 p-5 flex items-center justify-between bg-gradient-to-r from-slate-800/50 to-slate-700/30">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <h3 className="text-lg font-semibold text-slate-100">Input Code</h3>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleCopy(inputCode)}
                                    disabled={!inputCode}
                                    className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Copy code"
                                >
                                    <FaCopy />
                                </button>
                                <button
                                    onClick={handleExecuteInput}
                                    disabled={executingInput || !inputCode}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-lg shadow-green-600/30 hover:shadow-green-600/50"
                                    title="Run code"
                                >
                                    <FaPlay className="text-xs" />
                                    <span>{executingInput ? "Running..." : "Run"}</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-5">
                            <CodeEditor
                                value={inputCode}
                                onChange={(value) => setInputCode(value || '')}
                                language={language}
                                height="350px"
                            />
                            <div className="mt-4 text-xs text-slate-400 flex gap-6">
                                <span>
                                    Lines: <span className="text-slate-300 font-mono font-semibold">{inputCode.split("\n").length}</span>
                                </span>
                                <span>
                                    Characters: <span className="text-slate-300 font-mono font-semibold">{inputCode.length}</span>
                                </span>
                            </div>
                        </div>

                        {/* Input Execution Output */}
                        {(inputOutput || inputError) && (
                            <div className="border-t border-slate-700/50 p-5 bg-gradient-to-b from-slate-800/30 to-slate-900/50">
                                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <FaCheckCircle className="text-green-500" /> Execution Output
                                </h4>
                                {inputOutput && (
                                    <pre className="bg-slate-950/80 text-green-400 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-xs mb-2 border border-green-500/20 shadow-inner">
                                        {inputOutput}
                                    </pre>
                                )}
                                {inputError && (
                                    <pre className="bg-slate-950/80 text-red-400 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-xs border border-red-500/20 shadow-inner">
                                        {inputError}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Output Editor Card */}
                    <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm hover:border-slate-600 transition-all duration-300 shadow-lg shadow-slate-900/50 hover:shadow-xl hover:shadow-cyan-500/10">
                        <div className="border-b border-slate-700/50 p-5 flex items-center justify-between bg-gradient-to-r from-slate-800/50 to-slate-700/30">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                                <h3 className="text-lg font-semibold text-slate-100">Refactored Code</h3>
                                {processingTime && (
                                    <span className="text-xs font-mono bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-lg border border-cyan-500/40 font-semibold">
                                        {(processingTime / 1000).toFixed(2)}s
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleCopy(refactoredCode)}
                                    disabled={!refactoredCode}
                                    className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Copy code"
                                >
                                    <FaCopy />
                                </button>
                                <button
                                    onClick={() => handleDownload(refactoredCode, `refactored.${language}`)}
                                    disabled={!refactoredCode}
                                    className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download code"
                                >
                                    <FaDownload />
                                </button>
                                <button
                                    onClick={handleExecuteRefactored}
                                    disabled={executingRefactored || !refactoredCode}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-lg shadow-green-600/30 hover:shadow-green-600/50"
                                    title="Run code"
                                >
                                    <FaPlay className="text-xs" />
                                    <span>{executingRefactored ? "Running..." : "Run"}</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-5">
                            {loading ? (
                                <LoadingSpinner message="\ud83d\ude80 Applying comprehensive refactoring... (Basic + Priority + Advanced + Performance)" />
                            ) : (
                                <>
                                    <CodeEditor
                                        value={refactoredCode}
                                        onChange={() => { }}
                                        language={language}
                                        readOnly={true}
                                        height="350px"
                                    />
                                    {refactoredCode && (
                                        <div className="mt-4 text-xs text-slate-400 flex gap-6">
                                            <span>
                                                Lines:{" "}
                                                <span className="text-slate-300 font-mono font-semibold">
                                                    {refactoredCode.split("\n").length}
                                                </span>
                                            </span>
                                            <span>
                                                Characters:{" "}
                                                <span className="text-slate-300 font-mono font-semibold">{refactoredCode.length}</span>
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Refactored Execution Output */}
                        {(refactoredOutput || refactoredError) && (
                            <div className="border-t border-slate-700/50 p-5 bg-gradient-to-b from-slate-800/30 to-slate-900/50">
                                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <FaCheckCircle className="text-green-500" /> Execution Output
                                </h4>
                                {refactoredOutput && (
                                    <pre className="bg-slate-950/80 text-green-400 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-xs mb-2 border border-green-500/20 shadow-inner">
                                        {refactoredOutput}
                                    </pre>
                                )}
                                {refactoredError && (
                                    <pre className="bg-slate-950/80 text-red-400 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-xs border border-red-500/20 shadow-inner">
                                        {refactoredError}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                    <button
                        onClick={handleRefactor}
                        disabled={loading || !inputCode}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:via-blue-600 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-xl shadow-blue-600/40 hover:shadow-blue-600/60 disabled:shadow-none"
                    >
                        <FaMagic className="text-xl" />
                        <span>{loading ? "Applying All Refactorings..." : "\ud83d\ude80 Refactor (All Patterns)"}</span>
                    </button>
                    <button
                        onClick={handleAnalyzeRisk}
                        disabled={analyzingRisk || !inputCode || !refactoredCode}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-xl shadow-purple-600/40 hover:shadow-purple-600/60 disabled:shadow-none"
                    >
                        <FaShieldAlt className="text-xl" />
                        <span>{analyzingRisk ? "Analyzing Risk..." : "Analyze Risk"}</span>
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={loading || executingInput || executingRefactored}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-700/80 text-slate-100 rounded-lg hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg shadow-slate-900/50 hover:shadow-slate-800/70"
                    >
                        <FaTrash className="text-xl" />
                        <span>Clear All</span>
                    </button>
                </div>

                {/* Risk Analysis Dashboard */}
                <div className="mt-12 mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30">
                            <FaShieldAlt className="text-white text-2xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-100">Risk Analysis Dashboard</h3>
                            <p className="text-slate-400">AI-powered safety assessment for refactoring</p>
                        </div>
                    </div>

                    <RiskAnalysisPanel
                        riskData={riskData}
                        loading={analyzingRisk}
                        error={riskError}
                    />
                </div>

                {/* Info Section */}
                <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-lg shadow-slate-900/50">
                    <div className="text-center mb-10">
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-200 bg-clip-text text-transparent mb-2">
                            How It Works
                        </h3>
                        <p className="text-slate-400">Simple 3-step process to refactor your code with AI</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-gradient-to-br from-blue-600/15 to-cyan-600/10 border border-blue-500/30 rounded-lg hover:border-blue-500/60 transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-600/20 hover:to-cyan-600/15 shadow-lg shadow-blue-600/10">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                                <span className="text-white font-bold text-xl">1</span>
                            </div>
                            <h4 className="font-semibold text-slate-100 mb-2 text-lg">Enter Code</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Paste your code in the input editor to get started
                            </p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-cyan-600/15 to-blue-600/10 border border-cyan-500/30 rounded-lg hover:border-cyan-500/60 transition-all duration-300 hover:bg-gradient-to-br hover:from-cyan-600/20 hover:to-blue-600/15 shadow-lg shadow-cyan-600/10">
                            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
                                <span className="text-white font-bold text-xl">2</span>
                            </div>
                            <h4 className="font-semibold text-slate-100 mb-2 text-lg">AI Refactor</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Advanced AI analyzes and optimizes your code quality
                            </p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-green-600/15 to-emerald-600/10 border border-green-500/30 rounded-lg hover:border-green-500/60 transition-all duration-300 hover:bg-gradient-to-br hover:from-green-600/20 hover:to-emerald-600/15 shadow-lg shadow-green-600/10">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                                <span className="text-white font-bold text-xl">3</span>
                            </div>
                            <h4 className="font-semibold text-slate-100 mb-2 text-lg">Test & Use</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Execute and verify both versions to ensure functionality
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefactorPage;