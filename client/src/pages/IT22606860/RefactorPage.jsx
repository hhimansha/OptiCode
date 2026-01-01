// ============================================
// client/src/pages/IT22606860/RefactorPage.jsx (FIXED)
// ============================================
import React, { useState } from 'react';
import { FaMagic, FaCopy, FaDownload, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import CodeEditor from '../../components/IT22606860/CodeEditor';
import LoadingSpinner from '../../components/IT22606860/LoadingSpinner';
import { refactorCode } from '../../services/api';

const RefactorPage = () => {
    const [instruction, setInstruction] = useState('Refactor this code to improve readability and efficiency');
    const [inputCode, setInputCode] = useState('');
    const [refactoredCode, setRefactoredCode] = useState('');
    const [language, setLanguage] = useState('python'); // ✅ CHANGED: Default to 'python'
    const [loading, setLoading] = useState(false);
    const [processingTime, setProcessingTime] = useState(null);

    const handleRefactor = async () => {
        if (!inputCode.trim()) {
            toast.error('Please enter code to refactor');
            return;
        }

        setLoading(true);
        setRefactoredCode('');
        setProcessingTime(null);

        try {
            const response = await refactorCode(inputCode, instruction, language);

            if (response.success) {
                setRefactoredCode(response.refactored_code);
                setProcessingTime(response.processing_time); // ✅ CHANGED: Use processing_time
                toast.success('Code refactored successfully!');
            } else {
                toast.error(response.message || 'Failed to refactor code');
            }
        } catch (error) {
            console.error('Refactor error:', error);
            toast.error(error.message || 'An error occurred during refactoring');
        } finally {
            setLoading(false);
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
        setInstruction('Refactor this code to improve readability and efficiency');
        toast.success('Cleared!');
    };

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Code Refactoring
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Transform your Python code with AI-powered refactoring
                    </p>
                </div>

                {/* Controls */}
                <div className="card mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Instruction Input */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
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

                        {/* Language Select - ✅ UPDATED: Only Python shown */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Programming Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="select-primary w-full"
                            >
                                <option value="python">Python</option>
                                {/* ✅ Other languages commented out - only Python supported */}
                                {/* <option value="javascript">JavaScript</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="typescript">TypeScript</option>
                                <option value="go">Go</option>
                                <option value="rust">Rust</option> */}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Currently supports Python only
                            </p>
                        </div>
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
                            <button
                                onClick={() => handleCopy(inputCode)}
                                className="btn-icon"
                                disabled={!inputCode}
                            >
                                <FaCopy /> Copy
                            </button>
                        </div>
                        <CodeEditor
                            value={inputCode}
                            onChange={(value) => setInputCode(value || '')}
                            language={language}
                            height="500px"
                        />
                        <div className="mt-3 text-sm text-gray-400">
                            Lines: {inputCode.split('\n').length} |
                            Characters: {inputCode.length}
                        </div>
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
                                    <span className="badge-success">
                                        {(processingTime / 1000).toFixed(2)}s
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleCopy(refactoredCode)}
                                    className="btn-icon"
                                    disabled={!refactoredCode}
                                >
                                    <FaCopy /> Copy
                                </button>
                                <button
                                    onClick={() => handleDownload(refactoredCode, `refactored.${language}`)}
                                    className="btn-icon"
                                    disabled={!refactoredCode}
                                >
                                    <FaDownload /> Download
                                </button>
                            </div>
                        </div>
                        {loading ? (
                            <LoadingSpinner message="Refactoring your code..." />
                        ) : (
                            <>
                                <CodeEditor
                                    value={refactoredCode}
                                    onChange={() => { }}
                                    language={language}
                                    readOnly={true}
                                    height="500px"
                                />
                                {refactoredCode && (
                                    <div className="mt-3 text-sm text-gray-400">
                                        Lines: {refactoredCode.split('\n').length} |
                                        Characters: {refactoredCode.length}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={handleRefactor}
                        className="btn-primary text-lg px-8 py-4 shadow-glow-blue"
                        disabled={loading || !inputCode}
                    >
                        <FaMagic className="text-xl" />
                        {loading ? 'Refactoring...' : 'Refactor Code'}
                    </button>
                    <button
                        onClick={handleClear}
                        className="btn-secondary text-lg px-8 py-4"
                        disabled={loading}
                    >
                        <FaTrash />
                        Clear All
                    </button>
                </div>

                {/* Tips Section */}
                {!refactoredCode && !loading && (
                    <div className="mt-12 card bg-blue-500/10 border-blue-500/30">
                        <h3 className="text-xl font-bold text-blue-400 mb-4">💡 Tips for Best Results</h3>
                        <ul className="space-y-2 text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>Be specific with your refactoring instructions for better results</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>Currently supports Python code only</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>Review the refactored code before using it in production</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>Complex code may take longer to process</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RefactorPage;