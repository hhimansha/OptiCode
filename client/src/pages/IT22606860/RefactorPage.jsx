// ============================================
// client/src/pages/IT22606860/RefactorPage.jsx (SIMPLIFIED)
// ============================================
import React, { useState } from 'react';
import { 
    FaMagic, FaCopy, FaDownload, FaTrash, FaPlay
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import CodeEditor from '../../components/IT22606860/CodeEditor';
import LoadingSpinner from '../../components/IT22606860/LoadingSpinner';

// Import API functions
import { 
    refactorCode, 
    executeCode
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

        try {
            console.log('[REFACTOR] Calling refactorCode API...');
            const response = await refactorCode(inputCode, null, language);
            
            console.log('[REFACTOR] Full API response:', response);
            console.log('[REFACTOR] Response success:', response.success);
            console.log('[REFACTOR] Response refactored_code:', response.refactored_code);

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
                
                toast.success('Code refactored successfully with DeepSeek AI!');

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
                        Python code refactoring and optimization with DeepSeek AI
                    </p>
                </div>

                {/* Language Selection */}
                <div className="card mb-8">
                    <div className="max-w-md mx-auto">
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
                                    title="Copy code"
                                >
                                    <FaCopy className="text-white" />
                                </button>
                                <button
                                    onClick={handleExecuteInput}
                                    className="btn-icon text-white bg-green-600 hover:bg-green-700"
                                    disabled={executingInput || !inputCode}
                                    title="Run code"
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
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleCopy(refactoredCode)}
                                    className="btn-icon text-white"
                                    disabled={!refactoredCode}
                                    title="Copy code"
                                >
                                    <FaCopy className="text-white" />
                                </button>
                                <button
                                    onClick={() => handleDownload(refactoredCode, `refactored.${language}`)}
                                    className="btn-icon text-white"
                                    disabled={!refactoredCode}
                                    title="Download code"
                                >
                                    <FaDownload className="text-white" />
                                </button>
                                <button
                                    onClick={handleExecuteRefactored}
                                    className="btn-icon text-white bg-green-600 hover:bg-green-700"
                                    disabled={executingRefactored || !refactoredCode}
                                    title="Run code"
                                >
                                    <FaPlay className="text-white" />
                                    <span className="text-white">
                                        {executingRefactored ? 'Running...' : 'Run'}
                                    </span>
                                </button>
                            </div>
                        </div>
                        {loading ? (
                            <LoadingSpinner message="Refactoring with DeepSeek AI... This may take 10-30 seconds" />
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
                        <span className="text-white">
                            {loading ? 'Refactoring with AI...' : 'Refactor with AI'}
                        </span>
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

                {/* Info Section */}
                <div className="card">
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-3">
                            How It Works
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
                            <div className="p-4 bg-gray-800 rounded-lg">
                                <div className="text-3xl mb-2">📝</div>
                                <h4 className="font-semibold mb-2">1. Enter Code</h4>
                                <p className="text-sm">Paste your Python code in the input editor</p>
                            </div>
                            <div className="p-4 bg-gray-800 rounded-lg">
                                <div className="text-3xl mb-2">🤖</div>
                                <h4 className="font-semibold mb-2">2. AI Refactor</h4>
                                <p className="text-sm">DeepSeek AI analyzes and improves your code</p>
                            </div>
                            <div className="p-4 bg-gray-800 rounded-lg">
                                <div className="text-3xl mb-2">✅</div>
                                <h4 className="font-semibold mb-2">3. Test & Use</h4>
                                <p className="text-sm">Run both versions to verify functionality</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefactorPage;