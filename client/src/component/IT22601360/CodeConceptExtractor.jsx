/**
 * Code Concept Extractor - Main Component
 * Student: IT22601360
 */

import React, { useState, useCallback, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import ConceptList from './ConceptList';
import ConceptGraph from './ConceptGraph';
import DistributionChart from './DistributionChart';
import ConceptDetails from './ConceptDetails';
import { conceptExtractorApi } from '../../modules/IT22601360/conceptExtractorApi';
import './CodeConceptExtractor.css';

// Sample code for demo
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
    // State
    const [code, setCode] = useState(SAMPLE_CODE);
    const [language, setLanguage] = useState('python');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [extractionResult, setExtractionResult] = useState(null);
    const [selectedConcept, setSelectedConcept] = useState(null);
    const [activeTab, setActiveTab] = useState('list');
    const [supportedLanguages, setSupportedLanguages] = useState([
        'python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust'
    ]);
    const [serviceStatus, setServiceStatus] = useState('checking');

    // Check service health on mount
    useEffect(() => {
        checkServiceHealth();
        loadSupportedLanguages();
    }, []);

    const checkServiceHealth = async () => {
        try {
            const health = await conceptExtractorApi.healthCheck();
            setServiceStatus(health.status === 'healthy' ? 'online' : 'offline');
        } catch (err) {
            setServiceStatus('offline');
        }
    };

    const loadSupportedLanguages = async () => {
        try {
            const result = await conceptExtractorApi.getSupportedLanguages();
            if (result.languages) {
                setSupportedLanguages(result.languages);
            }
        } catch (err) {
            console.warn('Failed to load languages:', err);
        }
    };

    // Handle code analysis
    const handleAnalyze = useCallback(async () => {
        if (!code.trim()) {
            setError('Please enter some code to analyze');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSelectedConcept(null);

        try {
            const result = await conceptExtractorApi.extractConcepts(code, language);
            setExtractionResult(result);
            
            if (result.concepts?.length === 0) {
                setError('No concepts detected. Try adding more code.');
            }
        } catch (err) {
            setError(err.message || 'Analysis failed. Please try again.');
            setExtractionResult(null);
        } finally {
            setIsLoading(false);
        }
    }, [code, language]);

    // Handle concept click for details
    const handleConceptClick = useCallback(async (concept) => {
        setSelectedConcept(concept);
    }, []);

    // Close concept details modal
    const handleCloseDetails = useCallback(() => {
        setSelectedConcept(null);
    }, []);

    // Clear everything
    const handleClear = useCallback(() => {
        setCode('');
        setExtractionResult(null);
        setSelectedConcept(null);
        setError(null);
    }, []);

    // Load sample code
    const handleLoadSample = useCallback(() => {
        setCode(SAMPLE_CODE);
        setLanguage('python');
    }, []);

    return (
        <div className="concept-extractor">
            {/* Header */}
            <header className="extractor-header">
                <div className="header-left">
                    <h1>🔍 Code Concept Extractor</h1>
                    <span className={`status-badge ${serviceStatus}`}>
                        {serviceStatus === 'online' ? '● AI Online' : '○ AI Offline'}
                    </span>
                </div>
                <div className="header-right">
                    <span className="student-id">IT22601360</span>
                </div>
            </header>

            {/* Main Content */}
            <div className="extractor-content">
                {/* Left Panel - Code Editor */}
                <div className="panel left-panel">
                    <div className="panel-header">
                        <h2>📝 Code Input</h2>
                        <div className="panel-actions">
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value)}
                                className="language-select"
                            >
                                {supportedLanguages.map(lang => (
                                    <option key={lang} value={lang}>
                                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <CodeEditor
                        code={code}
                        setCode={setCode}
                        language={language}
                    />
                    
                    <div className="editor-actions">
                        <button 
                            className="btn btn-primary"
                            onClick={handleAnalyze}
                            disabled={isLoading || !code.trim()}
                        >
                            {isLoading ? '⏳ Analyzing...' : '🚀 Analyze Code'}
                        </button>
                        <button 
                            className="btn btn-secondary"
                            onClick={handleLoadSample}
                        >
                            📋 Load Sample
                        </button>
                        <button 
                            className="btn btn-outline"
                            onClick={handleClear}
                        >
                            🗑️ Clear
                        </button>
                    </div>
                </div>

                {/* Right Panel - Results */}
                <div className="panel right-panel">
                    <div className="panel-header">
                        <h2>📊 Extracted Concepts</h2>
                        {extractionResult && (
                            <div className="result-stats">
                                <span className="stat">
                                    {extractionResult.concepts?.length || 0} concepts
                                </span>
                                <span className="stat">
                                    {extractionResult.processingTime}s
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tab Navigation */}
                    {extractionResult && (
                        <div className="tab-navigation">
                            {['list', 'graph', 'chart'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'list' && '📋 List'}
                                    {tab === 'graph' && '🕸️ Graph'}
                                    {tab === 'chart' && '📊 Chart'}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Results Content */}
                    <div className="results-content">
                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Analyzing code with AI...</p>
                                <small>This may take a few seconds</small>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !extractionResult && !error && (
                            <div className="empty-state">
                                <div className="empty-icon">🔬</div>
                                <h3>No Analysis Yet</h3>
                                <p>Paste your code on the left and click "Analyze"<br />to extract computer science concepts</p>
                            </div>
                        )}

                        {/* Results */}
                        {!isLoading && extractionResult && (
                            <>
                                {activeTab === 'list' && (
                                    <ConceptList 
                                        concepts={extractionResult.concepts}
                                        onConceptClick={handleConceptClick}
                                    />
                                )}
                                {activeTab === 'graph' && (
                                    <ConceptGraph 
                                        data={extractionResult.visualizations?.graph}
                                    />
                                )}
                                {activeTab === 'chart' && (
                                    <DistributionChart 
                                        data={extractionResult.visualizations?.distribution}
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Metrics Footer */}
                    {extractionResult?.metrics && (
                        <div className="metrics-footer">
                            <span>📄 {extractionResult.metrics.linesOfCode} lines</span>
                            <span>⚡ {extractionResult.metrics.functionsFound} functions</span>
                            <span>🏛️ {extractionResult.metrics.classesFound} classes</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Concept Details Modal */}
            {selectedConcept && (
                <ConceptDetails
                    concept={selectedConcept}
                    codeContext={code}
                    onClose={handleCloseDetails}
                />
            )}
        </div>
    );
};

export default CodeConceptExtractor;
