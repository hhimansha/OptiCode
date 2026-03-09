import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaMagic, FaCopy, FaDownload, FaTrash, FaPlay, FaCheckCircle, FaRobot, FaShieldAlt,
    FaChartLine, FaHistory, FaCode, FaBolt, FaEye
} from 'react-icons/fa';
import { Toaster, toast } from 'sonner';
import CodeEditor from '../../component/IT22606860/CodeEditor';
import LoadingSpinner from '../../component/IT22606860/LoadingSpinner';
import RiskAnalysisPanel from '../../component/IT22606860/RiskAnalysisPanel';
import FloatingChatAssistant from '../../component/IT22606860/FloatingChatAssistant';
import ChangesComparison from '../../component/IT22606860/ChangesComparison';

// Import API functions
import {
    applyCompleteRefactoring, // NEW: Unified comprehensive refactoring
    executeCode,
    analyzeRefactoringRisk,
    saveRefactorHistory,
    updateHistory
} from '../../services/api';

const RefactorPage = () => {
    const navigate = useNavigate();
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

    // Refactoring result data for comparison
    const [refactorSummary, setRefactorSummary] = useState(null);
    const [changesApplied, setChangesApplied] = useState([]);
    const [showComparison, setShowComparison] = useState(false);
    const [currentHistoryId, setCurrentHistoryId] = useState(null);

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
                setRefactorSummary(response.summary || {});
                setChangesApplied(response.changes || response.all_changes || []);
                setShowComparison(true);

                // Save to history (non-blocking)
                saveRefactorHistory({
                    originalCode: inputCode,
                    refactoredCode: refactored,
                    language: language,
                    instruction: 'Unified comprehensive refactoring',
                    modelUsed: 'ast',
                    processingTime: response.summary?.processing_time_ms || response.processing_time || 0,
                    changesApplied: response.changes_applied || [],
                    summary: response.summary || {}
                }).then(result => {
                    if (result.success) {
                        console.log('[REFACTOR] History saved:', result.historyId);
                        setCurrentHistoryId(result.historyId);
                    }
                }).catch(err => console.warn('[REFACTOR] Failed to save history:', err));

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
                console.log('[RISK] Full response:', response);
                setRiskData(response);
                toast.success('Risk analysis completed!');
                
                // Save detailed risk analysis to history if we have a history ID
                if (currentHistoryId && response.risk_analysis) {
                    try {
                        const riskAnalysisData = {
                            detailed: {
                                riskScore: response.risk_analysis?.risk_score || 0,
                                riskLevel: response.risk_analysis?.risk_level || 'medium',
                                riskColor: response.risk_analysis?.risk_color || '#F59E0B',
                                explanation: response.risk_analysis?.explanation || '',
                                recommendation: response.risk_analysis?.recommendation || '',
                                processingTime: response.risk_analysis?.processing_time || 0,
                                riskFactors: response.risk_analysis?.risk_factors || [],
                                suggestions: response.risk_analysis?.suggestions || [],
                                potentialIssues: response.risk_analysis?.potential_issues || [],
                                sideEffects: response.risk_analysis?.side_effects || [],
                                comparisonMetrics: response.comparison_metrics || {},
                                chartData: response.chart_data || {}
                            }
                        };
                        
                        console.log('[RISK] Saving risk analysis to history:', riskAnalysisData);
                        await updateHistory(currentHistoryId, { riskAnalysis: riskAnalysisData });
                        console.log('[RISK] Risk analysis saved to history successfully');
                    } catch (err) {
                        console.error('[RISK] Failed to save risk analysis to history:', err);
                    }
                }
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
        setRefactorSummary(null);
        setChangesApplied([]);
        setShowComparison(false);
        setCurrentHistoryId(null);
        toast.success('Cleared!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
            </div>

            <Toaster position="top-right" richColors />

            {/* Enhanced Header with Glass Effect */}
            <div className="border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30 animate-pulse">
                            <FaRobot className="text-white text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                                AI Code Refactor
                            </h1>
                            <p className="text-slate-400 text-sm mt-0.5">Powered by Advanced AST Analysis</p>
                        </div>
                        
                        {/* Live Stats Badge */}
                        {refactoredCode && (
                            <div className="ml-auto hidden md:flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                                    <FaCheckCircle className="text-emerald-400 text-sm" />
                                    <span className="text-emerald-300 text-sm font-medium">Refactored</span>
                                </div>
                                {processingTime && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                                        <FaBolt className="text-cyan-400 text-sm" />
                                        <span className="text-cyan-300 text-sm font-medium">{(processingTime / 1000).toFixed(2)}s</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="text-slate-400 text-base ml-16">Transform your code with 100+ AST refactoring patterns</p>
                    
                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3 mt-4 ml-16">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105"
                        >
                            <FaChartLine />
                            <span>Analytics Dashboard</span>
                        </button>
                        <button
                            onClick={() => navigate('/history')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/80 text-slate-200 rounded-xl hover:bg-slate-600 transition-all duration-200 font-medium text-sm border border-slate-600/50 shadow-lg shadow-slate-900/50 hover:scale-105"
                        >
                            <FaHistory />
                            <span>View History</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
                {/* Language Selection Card */}
                <div className="mb-8 bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-slate-600 transition-all duration-300 shadow-xl shadow-slate-900/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-200 mb-2">Programming Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full md:w-48 px-4 py-3 bg-slate-800/80 text-slate-100 border border-slate-700 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all hover:border-slate-600"
                            >
                                <option value="python">Python</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <FaBolt className="text-amber-400" />
                                <span className="text-slate-400">100+ Patterns</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaShieldAlt className="text-emerald-400" />
                                <span className="text-slate-400">Security Analysis</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaChartLine className="text-blue-400" />
                                <span className="text-slate-400">Performance Optimization</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Code Editors Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Input Editor Card */}
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 shadow-xl shadow-slate-900/50 group">
                        <div className="border-b border-slate-700/50 p-4 flex items-center justify-between bg-gradient-to-r from-blue-900/30 to-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="w-px h-5 bg-slate-600 mx-2"></div>
                                <FaCode className="text-blue-400" />
                                <h3 className="text-base font-semibold text-slate-100">Input Code</h3>
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
                        <div className="p-4">
                            <CodeEditor
                                value={inputCode}
                                onChange={(value) => setInputCode(value || '')}
                                language={language}
                                height="380px"
                                showLineNumbers={true}
                            />
                            <div className="mt-3 text-xs text-slate-400 flex gap-6 px-1">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Lines: <span className="text-slate-200 font-mono font-semibold">{inputCode.split("\n").length}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                                    Characters: <span className="text-slate-200 font-mono font-semibold">{inputCode.length}</span>
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
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300 shadow-xl shadow-slate-900/50 group">
                        <div className="border-b border-slate-700/50 p-4 flex items-center justify-between bg-gradient-to-r from-cyan-900/30 to-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="w-px h-5 bg-slate-600 mx-2"></div>
                                <FaMagic className="text-cyan-400" />
                                <h3 className="text-base font-semibold text-slate-100">Refactored Code</h3>
                                {processingTime && (
                                    <span className="text-xs font-mono bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/40 font-semibold">
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
                        <div className="p-4">
                            {loading ? (
                                <div className="h-[380px] flex items-center justify-center">
                                    <LoadingSpinner message="Applying comprehensive refactoring patterns..." />
                                </div>
                            ) : (
                                <>
                                    <CodeEditor
                                        value={refactoredCode}
                                        onChange={() => { }}
                                        language={language}
                                        readOnly={true}
                                        height="380px"
                                        showLineNumbers={true}
                                    />
                                    {refactoredCode && (
                                        <div className="mt-3 text-xs text-slate-400 flex gap-6 px-1">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                                                Lines: <span className="text-slate-200 font-mono font-semibold">{refactoredCode.split("\n").length}</span>
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                                Characters: <span className="text-slate-200 font-mono font-semibold">{refactoredCode.length}</span>
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
                        className="flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white rounded-2xl hover:from-blue-700 hover:via-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-xl shadow-blue-600/40 hover:shadow-blue-600/60 disabled:shadow-none transform hover:scale-105 hover:-translate-y-1"
                    >
                        <FaMagic className="text-xl animate-pulse" />
                        <span>{loading ? "Refactoring..." : "Refactor Code"}</span>
                        {!loading && <span className="text-blue-200 text-sm ml-1">(100+ patterns)</span>}
                    </button>
                    <button
                        onClick={handleAnalyzeRisk}
                        disabled={analyzingRisk || !inputCode || !refactoredCode}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-xl shadow-purple-600/40 hover:shadow-purple-600/60 disabled:shadow-none transform hover:scale-105 hover:-translate-y-1"
                    >
                        <FaShieldAlt className="text-xl" />
                        <span>{analyzingRisk ? "Analyzing..." : "Analyze Risk"}</span>
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={loading || executingInput || executingRefactored}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-700/80 text-slate-100 rounded-2xl hover:bg-slate-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg shadow-slate-900/50 hover:shadow-slate-800/70 border border-slate-600/50 transform hover:scale-105 hover:-translate-y-1"
                    >
                        <FaTrash className="text-lg" />
                        <span>Clear All</span>
                    </button>
                </div>

                {/* Changes Comparison Section - Shows after refactoring */}
                {showComparison && refactoredCode && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-lg shadow-emerald-500/30">
                                    <FaEye className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-100">Changes Comparison</h3>
                                    <p className="text-slate-400">See what was improved in your code</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowComparison(!showComparison)}
                                className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600 transition-all text-sm"
                            >
                                {showComparison ? 'Hide' : 'Show'} Comparison
                            </button>
                        </div>
                        
                        <ChangesComparison 
                            originalCode={inputCode}
                            refactoredCode={refactoredCode}
                            changes={changesApplied}
                            summary={refactorSummary}
                        />
                    </div>
                )}

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
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-10 backdrop-blur-xl shadow-2xl shadow-slate-900/70 relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent"></div>
                    
                    <div className="text-center mb-12 relative">
                        <span className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3 block">Simple Process</span>
                        <h3 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
                            How It Works
                        </h3>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Transform your code in three easy steps using our advanced AI-powered refactoring engine</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group p-8 bg-gradient-to-br from-blue-600/15 to-cyan-600/10 border border-blue-500/30 rounded-2xl hover:border-blue-400/70 transition-all duration-500 hover:bg-gradient-to-br hover:from-blue-600/25 hover:to-cyan-600/20 shadow-xl shadow-blue-600/10 hover:shadow-blue-500/30 transform hover:scale-105 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/40 group-hover:shadow-blue-500/60 transition-all duration-300 group-hover:scale-110">
                                <FaCode className="text-white text-2xl" />
                            </div>
                            <span className="text-blue-400 text-xs font-bold tracking-wider uppercase mb-2 block">Step 1</span>
                            <h4 className="font-bold text-white mb-3 text-xl">Enter Code</h4>
                            <p className="text-slate-400 leading-relaxed">
                                Paste your code in the input editor. Supports Python with 100+ refactoring patterns.
                            </p>
                        </div>
                        <div className="group p-8 bg-gradient-to-br from-cyan-600/15 to-purple-600/10 border border-cyan-500/30 rounded-2xl hover:border-cyan-400/70 transition-all duration-500 hover:bg-gradient-to-br hover:from-cyan-600/25 hover:to-purple-600/20 shadow-xl shadow-cyan-600/10 hover:shadow-cyan-500/30 transform hover:scale-105 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/40 group-hover:shadow-cyan-500/60 transition-all duration-300 group-hover:scale-110">
                                <FaBolt className="text-white text-2xl" />
                            </div>
                            <span className="text-cyan-400 text-xs font-bold tracking-wider uppercase mb-2 block">Step 2</span>
                            <h4 className="font-bold text-white mb-3 text-xl">AI Refactor</h4>
                            <p className="text-slate-400 leading-relaxed">
                                Advanced AST-based analysis transforms your code for security, performance & quality.
                            </p>
                        </div>
                        <div className="group p-8 bg-gradient-to-br from-green-600/15 to-emerald-600/10 border border-green-500/30 rounded-2xl hover:border-green-400/70 transition-all duration-500 hover:bg-gradient-to-br hover:from-green-600/25 hover:to-emerald-600/20 shadow-xl shadow-green-600/10 hover:shadow-green-500/30 transform hover:scale-105 hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/40 group-hover:shadow-green-500/60 transition-all duration-300 group-hover:scale-110">
                                <FaEye className="text-white text-2xl" />
                            </div>
                            <span className="text-green-400 text-xs font-bold tracking-wider uppercase mb-2 block">Step 3</span>
                            <h4 className="font-bold text-white mb-3 text-xl">Review & Run</h4>
                            <p className="text-slate-400 leading-relaxed">
                                Compare changes visually, execute both versions, and apply the optimized code.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Chat Assistant */}
            <FloatingChatAssistant 
                originalCode={inputCode} 
                refactoredCode={refactoredCode} 
            />
        </div>
    );
};

export default RefactorPage;