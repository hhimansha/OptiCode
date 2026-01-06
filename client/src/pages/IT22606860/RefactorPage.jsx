// ============================================
// client/src/pages/IT22606860/RefactorPage.jsx (FIXED)
// ============================================
import React, { useState } from 'react';
import { 
    FaMagic, FaCopy, FaDownload, FaTrash, FaPlay, FaBook, 
    FaChartLine, FaShieldAlt, FaLightbulb, FaFlask 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import CodeEditor from '../../components/IT22606860/CodeEditor';
import LoadingSpinner from '../../components/IT22606860/LoadingSpinner';

// Import all new components
import RiskDashboard from '../../components/IT22606860/RiskDetection/RiskDashboard';
import RiskComparison from '../../components/IT22606860/RiskDetection/RiskComparison';
import BestPracticesPanel from '../../components/IT22606860/BestPractices/BestPracticesPanel';
import MetricsDashboard from '../../components/IT22606860/Metrics/MetricsDashboard';
import ComparisonChart from '../../components/IT22606860/Metrics/ComparisonChart';
import ExplanationPanel from '../../components/IT22606860/ExplainableAI/ExplanationPanel';
import ChangeHighlighter from '../../components/IT22606860/ExplainableAI/ChangeHighlighter';
import TestGenerationPanel from '../../components/IT22606860/Testing/TestGenerationPanel';
import TestResults from '../../components/IT22606860/Testing/TestResults';
import AnalyticsDashboard from '../../components/IT22606860/Analytics/AnalyticsDashboard';

// Import API functions
import { 
    refactorCode, 
    executeCode, 
    analyzeRisks,
    compareRisks,
    analyzeBestPractices,
    analyzeMetrics,
    compareMetrics,
    generateTests,
    getExplanation,
    saveFeedback
} from '../../services/api';

const RefactorPage = () => {
    // Basic states
    const [instruction, setInstruction] = useState('Refactor this code to improve readability and efficiency');
    const [inputCode, setInputCode] = useState('');
    const [refactoredCode, setRefactoredCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [loading, setLoading] = useState(false);
    const [processingTime, setProcessingTime] = useState(null);
    const [historyId, setHistoryId] = useState(null);
    const [refactorMethod, setRefactorMethod] = useState('');

    // Execution states
    const [executingInput, setExecutingInput] = useState(false);
    const [executingRefactored, setExecutingRefactored] = useState(false);
    const [inputOutput, setInputOutput] = useState('');
    const [inputError, setInputError] = useState('');
    const [refactoredOutput, setRefactoredOutput] = useState('');
    const [refactoredError, setRefactoredError] = useState('');

    // Risk analysis states
    const [showRisks, setShowRisks] = useState(false);
    const [risksLoading, setRisksLoading] = useState(false);
    const [inputRisks, setInputRisks] = useState(null);
    const [riskComparison, setRiskComparison] = useState(null);

    // Best practices states
    const [showBestPractices, setShowBestPractices] = useState(false);
    const [practicesLoading, setPracticesLoading] = useState(false);
    const [violations, setViolations] = useState(null);
    const [recommendations, setRecommendations] = useState(null);

    // Metrics states
    const [showMetrics, setShowMetrics] = useState(false);
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [inputMetrics, setInputMetrics] = useState(null);
    const [metricsComparison, setMetricsComparison] = useState(null);

    // Explanation states
    const [showExplanation, setShowExplanation] = useState(false);
    const [explanationLoading, setExplanationLoading] = useState(false);
    const [explanation, setExplanation] = useState(null);

    // Testing states
    const [showTests, setShowTests] = useState(false);
    const [testsLoading, setTestsLoading] = useState(false);
    const [generatedTests, setGeneratedTests] = useState('');

    // Analytics state
    const [showAnalytics, setShowAnalytics] = useState(false);

    // Active tab
    const [activeTab, setActiveTab] = useState('code');

    // ============================================
    // HANDLERS
    // ============================================

    const handleRefactor = async () => {
        if (!inputCode.trim()) {
            toast.error('Please enter code to refactor');
            return;
        }

        console.log('[REFACTOR] Starting refactoring process...');
        console.log('[REFACTOR] Input code length:', inputCode.length);
        
        setLoading(true);
        setRefactoredCode('');
        setProcessingTime(null);
        setRefactoredOutput('');
        setRefactoredError('');
        setRefactorMethod('');

        try {
            console.log('[REFACTOR] Calling refactorCode API...');
            const response = await refactorCode(inputCode, instruction, language);
            
            console.log('[REFACTOR] Full API response:', response);
            console.log('[REFACTOR] Response success:', response.success);
            console.log('[REFACTOR] Response refactored_code:', response.refactored_code);
            console.log('[REFACTOR] Response method:', response.method);

            if (response.success) {
                const refactored = response.refactored_code || '';
                
                console.log('[REFACTOR] Setting refactored code, length:', refactored.length);
                
                if (!refactored || refactored.trim() === '') {
                    console.error('[REFACTOR] ERROR: Refactored code is empty!');
                    toast.error('Refactoring returned empty code');
                    return;
                }

                setRefactoredCode(refactored);
                setProcessingTime(response.processing_time);
                setHistoryId(response.historyId);
                setRefactorMethod(response.method || 'unknown');
                
                // Show success message with method
                const methodText = response.method === 'trained_model + deepseek' 
                    ? ' (Enhanced with AI)' 
                    : response.method === 'trained_model_only'
                    ? ' (Pattern-based)'
                    : '';
                
                toast.success(`Code refactored successfully${methodText}!`);

                console.log('[REFACTOR] Refactoring complete!');

                // Auto-analyze after refactoring
                if (showRisks) {
                    analyzeCodeRisks();
                }
                if (showMetrics) {
                    analyzeCodeMetrics();
                }
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

    const analyzeCodeRisks = async () => {
        if (!inputCode.trim()) {
            toast.error('Please enter code first');
            return;
        }

        setRisksLoading(true);

        try {
            const response = await analyzeRisks(inputCode);

            if (response.success) {
                setInputRisks(response);

                // If we have refactored code, compare risks
                if (refactoredCode.trim()) {
                    const comparison = await compareRisks(inputCode, refactoredCode, historyId);
                    if (comparison.success) {
                        setRiskComparison(comparison.comparison);
                    }
                }
            }
        } catch (error) {
            console.error('Risk analysis error:', error);
            toast.error('Failed to analyze risks');
        } finally {
            setRisksLoading(false);
        }
    };

    const analyzePractices = async () => {
        if (!inputCode.trim()) {
            toast.error('Please enter code first');
            return;
        }

        setPracticesLoading(true);

        try {
            const response = await analyzeBestPractices(inputCode);

            if (response.success) {
                setViolations(response.violations);
                setRecommendations(response.recommendations);
            }
        } catch (error) {
            console.error('Best practices error:', error);
            toast.error('Failed to analyze best practices');
        } finally {
            setPracticesLoading(false);
        }
    };

    const analyzeCodeMetrics = async () => {
        if (!inputCode.trim()) {
            toast.error('Please enter code first');
            return;
        }

        setMetricsLoading(true);

        try {
            const inputResponse = await analyzeMetrics(inputCode);

            if (inputResponse.success) {
                setInputMetrics(inputResponse.metrics);

                // If we have refactored code, compare metrics
                if (refactoredCode.trim()) {
                    const comparison = await compareMetrics(inputCode, refactoredCode, historyId);
                    if (comparison.success) {
                        setMetricsComparison(comparison.metrics);
                    }
                }
            }
        } catch (error) {
            console.error('Metrics error:', error);
            toast.error('Failed to analyze metrics');
        } finally {
            setMetricsLoading(false);
        }
    };

    const generateExplanation = async () => {
        if (!inputCode.trim() || !refactoredCode.trim()) {
            toast.error('Please refactor code first');
            return;
        }

        setExplanationLoading(true);

        try {
            const response = await getExplanation(inputCode, refactoredCode);

            if (response.success) {
                setExplanation(response.explanation);
            }
        } catch (error) {
            console.error('Explanation error:', error);
            toast.error('Failed to generate explanation');
        } finally {
            setExplanationLoading(false);
        }
    };

    const handleGenerateTests = async () => {
        if (!refactoredCode.trim()) {
            toast.error('Please refactor code first');
            return;
        }

        setTestsLoading(true);

        try {
            const response = await generateTests(refactoredCode);

            if (response.success) {
                setGeneratedTests(response.tests);
                toast.success('Tests generated successfully!');
            }
        } catch (error) {
            console.error('Test generation error:', error);
            toast.error('Failed to generate tests');
        } finally {
            setTestsLoading(false);
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
        setInputRisks(null);
        setRiskComparison(null);
        setViolations(null);
        setRecommendations(null);
        setInputMetrics(null);
        setMetricsComparison(null);
        setExplanation(null);
        setGeneratedTests('');
        setRefactorMethod('');
        setInstruction('Refactor this code to improve readability and efficiency');
        toast.success('Cleared!');
    };

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        AI-Powered Code Refactoring
                    </h1>
                    <p className="text-white text-lg">
                        Advanced Python code analysis, refactoring, and optimization with DeepSeek AI
                    </p>
                </div>

                {/* Controls */}
                <div className="card mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-semibold text-white mb-2">
                                Refactoring Instructions
                            </label>
                            <input
                                type="text"
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                placeholder="Enter refactoring instructions..."
                                className="input-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Programming Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="select-primary w-full"
                            >
                                <option value="python">Python</option>
                            </select>
                            <p className="text-xs text-white mt-1">
                                Enhanced with DeepSeek AI
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="card mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                                activeTab === 'code'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            Code Editor
                        </button>
                        <button
                            onClick={() => { setActiveTab('risks'); setShowRisks(true); if (!inputRisks && inputCode) analyzeCodeRisks(); }}
                            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                                activeTab === 'risks'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <FaShieldAlt /> Risk Analysis
                        </button>
                        <button
                            onClick={() => { setActiveTab('practices'); setShowBestPractices(true); if (!violations && inputCode) analyzePractices(); }}
                            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                                activeTab === 'practices'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <FaBook /> Best Practices
                        </button>
                        <button
                            onClick={() => { setActiveTab('metrics'); setShowMetrics(true); if (!inputMetrics && inputCode) analyzeCodeMetrics(); }}
                            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                                activeTab === 'metrics'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <FaChartLine /> Metrics
                        </button>
                        <button
                            onClick={() => { setActiveTab('explanation'); setShowExplanation(true); if (!explanation && refactoredCode) generateExplanation(); }}
                            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                                activeTab === 'explanation'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <FaLightbulb /> Explanation
                        </button>
                        <button
                            onClick={() => { setActiveTab('tests'); setShowTests(true); }}
                            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                                activeTab === 'tests'
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <FaFlask /> Testing
                        </button>
                        <button
                            onClick={() => { setActiveTab('analytics'); setShowAnalytics(true); }}
                            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                                activeTab === 'analytics'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            <FaChartLine /> Analytics
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'code' && (
                    <>
                        {/* Code Editors */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Input Editor */}
                            <div className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                        Input Code
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleCopy(inputCode)}
                                            className="btn-icon text-white"
                                            disabled={!inputCode}
                                        >
                                            <FaCopy className="text-white" />
                                            <span className="text-white">Copy</span>
                                        </button>
                                        <button
                                            onClick={handleExecuteInput}
                                            className="btn-icon text-white bg-green-600 hover:bg-green-700"
                                            disabled={executingInput || !inputCode}
                                        >
                                            <FaPlay className="text-white" />
                                            <span className="text-white">
                                                {executingInput ? 'Running...' : 'Run'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <CodeEditor
                                    value={inputCode}
                                    onChange={(value) => setInputCode(value || '')}
                                    language={language}
                                    height="400px"
                                />
                                <div className="mt-3 text-sm text-white">
                                    Lines: {inputCode.split('\n').length} |
                                    Characters: {inputCode.length}
                                </div>

                                {/* Input Code Execution Output */}
                                {(inputOutput || inputError) && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-white mb-2">
                                            Execution Output:
                                        </h4>
                                        {inputOutput && (
                                            <pre className="bg-gray-800 text-green-400 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-xs mb-2">
                                                {inputOutput}
                                            </pre>
                                        )}
                                        {inputError && (
                                            <pre className="bg-gray-800 text-red-400 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-xs">
                                                {inputError}
                                            </pre>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Output Editor */}
                            <div className="card">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                            Refactored Code
                                        </h3>
                                        {processingTime && (
                                            <span className="badge-success text-white">
                                                {(processingTime / 1000).toFixed(2)}s
                                            </span>
                                        )}
                                        {refactorMethod && (
                                            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                                                {refactorMethod === 'trained_model + deepseek' ? '🤖 AI Enhanced' : '📝 Pattern-based'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleCopy(refactoredCode)}
                                            className="btn-icon text-white"
                                            disabled={!refactoredCode}
                                        >
                                            <FaCopy className="text-white" />
                                            <span className="text-white">Copy</span>
                                        </button>
                                        <button
                                            onClick={() => handleDownload(refactoredCode, `refactored.${language}`)}
                                            className="btn-icon text-white"
                                            disabled={!refactoredCode}
                                        >
                                            <FaDownload className="text-white" />
                                            <span className="text-white">Download</span>
                                        </button>
                                        <button
                                            onClick={handleExecuteRefactored}
                                            className="btn-icon text-white bg-green-600 hover:bg-green-700"
                                            disabled={executingRefactored || !refactoredCode}
                                        >
                                            <FaPlay className="text-white" />
                                            <span className="text-white">
                                                {executingRefactored ? 'Running...' : 'Run'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                {loading ? (
                                    <LoadingSpinner message="Refactoring with AI... This may take 10-30 seconds" />
                                ) : (
                                    <>
                                        <CodeEditor
                                            value={refactoredCode}
                                            onChange={() => { }}
                                            language={language}
                                            readOnly={true}
                                            height="400px"
                                        />
                                        {refactoredCode && (
                                            <div className="mt-3 text-sm text-white">
                                                Lines: {refactoredCode.split('\n').length} |
                                                Characters: {refactoredCode.length}
                                            </div>
                                        )}

                                        {/* Refactored Code Execution Output */}
                                        {(refactoredOutput || refactoredError) && (
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold text-white mb-2">
                                                    Execution Output:
                                                </h4>
                                                {refactoredOutput && (
                                                    <pre className="bg-gray-800 text-green-400 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-xs mb-2">
                                                        {refactoredOutput}
                                                    </pre>
                                                )}
                                                {refactoredError && (
                                                    <pre className="bg-gray-800 text-red-400 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-xs">
                                                        {refactoredError}
                                                    </pre>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                            <button
                                onClick={handleRefactor}
                                className="btn-primary text-lg px-8 py-4 shadow-glow-blue text-white"
                                disabled={loading || !inputCode}
                            >
                                <FaMagic className="text-xl text-white" />
                                <span className="text-white">{loading ? 'Refactoring with AI...' : 'Refactor with AI'}</span>
                            </button>

                            <button
                                onClick={handleClear}
                                className="btn-secondary text-lg px-8 py-4 text-white"
                                disabled={loading || executingInput || executingRefactored}
                            >
                                <FaTrash className="text-white" />
                                <span className="text-white">Clear All</span>
                            </button>
                        </div>
                    </>
                )}

                {activeTab === 'risks' && (
                    <div className="space-y-6">
                        <RiskDashboard 
                            risks={inputRisks?.risks} 
                            summary={inputRisks?.by_severity}
                            loading={risksLoading}
                        />
                        {riskComparison && (
                            <RiskComparison 
                                comparison={riskComparison}
                                loading={false}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'practices' && (
                    <BestPracticesPanel
                        violations={violations}
                        recommendations={recommendations}
                        summary={violations ? {
                            error: violations.filter(v => v.severity === 'error').length,
                            warning: violations.filter(v => v.severity === 'warning').length,
                            info: violations.filter(v => v.severity === 'info').length
                        } : null}
                        loading={practicesLoading}
                    />
                )}

                {activeTab === 'metrics' && (
                    <div className="space-y-6">
                        <MetricsDashboard 
                            metrics={inputMetrics}
                            loading={metricsLoading}
                        />
                        {metricsComparison && (
                            <ComparisonChart 
                                before={metricsComparison.before}
                                after={metricsComparison.after}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'explanation' && (
                    <div className="space-y-6">
                        <ExplanationPanel
                            explanation={explanation}
                            loading={explanationLoading}
                        />
                        {inputCode && refactoredCode && (
                            <ChangeHighlighter
                                originalCode={inputCode}
                                refactoredCode={refactoredCode}
                            />
                        )}
                    </div>
                )}

                {activeTab === 'tests' && (
                    <TestGenerationPanel
                        tests={generatedTests}
                        onGenerate={handleGenerateTests}
                        loading={testsLoading}
                    />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsDashboard />
                )}
            </div>
        </div>
    );
};

export default RefactorPage;

