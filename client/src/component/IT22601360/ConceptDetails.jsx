/**
 * Concept Details Modal Component (Dark Mode)
 * Student: IT22601360
 * 
 * Shows detailed information about a selected concept
 * Uses Gemini API to generate educational content
 */

import React, { useState, useEffect } from 'react';
import { conceptExtractorApi } from '../../modules/IT22601360/conceptExtractorApi';

const ConceptDetails = ({ concept, codeContext, onClose }) => {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detailLevel, setDetailLevel] = useState('intermediate');

    // Fetch detailed explanation
    useEffect(() => {
        fetchDetails();
    }, [concept, detailLevel]);

    const fetchDetails = async () => {
        if (!concept) return;
        
        setIsLoading(true);
        setError(null);

        try {
            const result = await conceptExtractorApi.getConceptDetails(
                concept.name,
                codeContext,
                detailLevel
            );
            setDetails(result.details);
        } catch (err) {
            setError('Failed to load concept details');
            // Use basic info from concept
            setDetails({
                concept_name: concept.name,
                definition: concept.description,
                how_used_in_code: concept.evidence
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!concept) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">{concept.name}</h2>
                            <span 
                                className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border"
                                style={{ 
                                    backgroundColor: `${getCategoryColor(concept.category)}20`,
                                    color: getCategoryColor(concept.category),
                                    borderColor: `${getCategoryColor(concept.category)}40`
                                }}
                            >
                                {concept.category?.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <button 
                            onClick={onClose}
                            className="ml-4 w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Detail Level Selector */}
                {/* <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-700 flex items-center gap-3">
                    <span className="text-sm text-gray-400 font-medium">Detail Level:</span>
                    <div className="flex gap-2">
                        {['basic', 'intermediate', 'advanced'].map((level) => (
                            <button
                                key={level}
                                onClick={() => setDetailLevel(level)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    detailLevel === level
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                        ))}
                    </div>
                </div> */}

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-900">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4" />
                            <p className="text-gray-400">Generating explanation...</p>
                        </div>
                    )}

                    {error && !details && (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <h3 className="font-semibold text-red-400 mb-1">Error</h3>
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {details && !isLoading && (
                        <div className="space-y-6">
                            {/* Confidence */}
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-400">Confidence Level</span>
                                    <span className="text-lg font-bold" style={{ color: getConfidenceColor(concept.confidence) }}>
                                        {Math.round(concept.confidence * 100)}%
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ 
                                            width: `${Math.round(concept.confidence * 100)}%`,
                                            backgroundColor: getConfidenceColor(concept.confidence)
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Definition */}
                            <section className="space-y-2">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span>📖</span>
                                    Definition
                                </h3>
                                <p className="text-gray-300 leading-relaxed bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                                    {details.definition || concept.description}
                                </p>
                            </section>

                            {/* How Used in Code */}
                            {/* {details.how_used_in_code && (
                                <section className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <span>💻</span>
                                        How It's Used in This Code
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
                                        {details.how_used_in_code}
                                    </p>
                                </section>
                            )} */}

                            {/* Complexity */}
                            {/* {(details.time_complexity || details.space_complexity) && (
                                <section className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <span>⏱️</span>
                                        Complexity Analysis
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {details.time_complexity && (
                                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                                <span className="text-sm text-gray-400 block mb-1">Time Complexity</span>
                                                <code className="text-blue-400 font-mono text-lg">{details.time_complexity}</code>
                                            </div>
                                        )}
                                        {details.space_complexity && (
                                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                                <span className="text-sm text-gray-400 block mb-1">Space Complexity</span>
                                                <code className="text-cyan-400 font-mono text-lg">{details.space_complexity}</code>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )} */}

                            {/* Advantages */}
                            {/* {details.advantages && details.advantages.length > 0 && (
                                <section className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <span>✅</span>
                                        Advantages
                                    </h3>
                                    <ul className="space-y-2">
                                        {details.advantages.map((adv, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-300 bg-green-900/10 rounded-lg p-3 border border-green-500/20">
                                                <span className="text-green-400 mt-1">•</span>
                                                <span>{adv}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )} */}

                            {/* Disadvantages */}
                            {/* {details.disadvantages && details.disadvantages.length > 0 && (
                                <section className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <span>❌</span>
                                        Disadvantages
                                    </h3>
                                    <ul className="space-y-2">
                                        {details.disadvantages.map((dis, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-300 bg-red-900/10 rounded-lg p-3 border border-red-500/20">
                                                <span className="text-red-400 mt-1">•</span>
                                                <span>{dis}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )} */}

                            {/* Real World Examples */}
                            {/* {details.real_world_examples && details.real_world_examples.length > 0 && (
                                <section className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <span>🌍</span>
                                        Real World Applications
                                    </h3>
                                    <ul className="space-y-2">
                                        {details.real_world_examples.map((ex, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-300 bg-purple-900/10 rounded-lg p-3 border border-purple-500/20">
                                                <span className="text-purple-400 mt-1">→</span>
                                                <span>{ex}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )} */}

                            {/* Related Concepts */}
                            {(details.related_concepts?.length > 0 || concept.relatedConcepts?.length > 0) && (
                                <section className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <span>🔗</span>
                                        Related Concepts
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(details.related_concepts || concept.relatedConcepts || []).map((rel, i) => (
                                            <span 
                                                key={i} 
                                                className="px-3 py-1.5 bg-slate-700 text-cyan-300 rounded-lg text-sm font-medium border border-slate-600 hover:bg-slate-600 transition-colors cursor-pointer"
                                            >
                                                {rel}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Evidence from Code */}
                            {concept.evidence && (
                                <section className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <span>🔍</span>
                                        Evidence in Code
                                    </h3>
                                    <pre className="bg-slate-800 text-gray-300 rounded-lg p-4 border border-slate-700 overflow-x-auto text-sm font-mono">
                                        <code>{concept.evidence}</code>
                                    </pre>
                                </section>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Generated by AI - Always verify with official documentation</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg shadow-blue-500/30"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper functions
const getCategoryColor = (category) => {
    const colors = {
        data_structure: '#10b981',
        algorithm: '#3b82f6',
        design_pattern: '#a855f7',
        architecture: '#f97316',
        paradigm: '#ec4899',
        programming_concept: '#06b6d4'
    };
    return colors[category] || '#6b7280';
};

const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.6) return '#f59e0b';
    return '#ef4444';
};

export default ConceptDetails;