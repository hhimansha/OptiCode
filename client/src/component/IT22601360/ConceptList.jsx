/**
 * Concept List Component (Dark Mode)
 * Student: IT22601360
 * 
 * Displays extracted concepts as cards
 */

import React from 'react';

// Category icons
const categoryIcons = {
    data_structure: '🗃️',
    algorithm: '⚙️',
    design_pattern: '🎨',
    architecture: '🏛️',
    paradigm: '💡',
    programming_concept: '📦'
};

// Category colors (dark mode friendly)
const categoryColors = {
    data_structure: '#10b981',
    algorithm: '#3b82f6',
    design_pattern: '#a855f7',
    architecture: '#f97316',
    paradigm: '#ec4899',
    programming_concept: '#06b6d4'
};

// Confidence level badge
const getConfidenceBadge = (confidence) => {
    const percent = Math.round(confidence * 100);
    let level = 'low';
    let colorClass = 'bg-red-500/20 text-red-400 border-red-500/30';
    
    if (percent >= 90) {
        level = 'very-high';
        colorClass = 'bg-green-500/20 text-green-400 border-green-500/30';
    } else if (percent >= 75) {
        level = 'high';
        colorClass = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    } else if (percent >= 50) {
        level = 'medium';
        colorClass = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    
    return { percent, level, colorClass };
};

const ConceptList = ({ concepts, onConceptClick }) => {
    if (!concepts || concepts.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <span className="text-6xl mb-4 block">🔍</span>
                    <p className="text-gray-400 text-lg">No concepts found</p>
                </div>
            </div>
        );
    }

    // Sort by confidence
    const sortedConcepts = [...concepts].sort((a, b) => b.confidence - a.confidence);

    return (
        <div className="h-full overflow-y-auto bg-slate-900 p-6">
            <div className="grid gap-4 max-w-4xl mx-auto">
                {sortedConcepts.map((concept, index) => {
                    const { percent, colorClass } = getConfidenceBadge(concept.confidence);
                    const icon = categoryIcons[concept.category] || '📦';
                    const color = categoryColors[concept.category] || '#6b7280';
                    
                    return (
                        <div 
                            key={index}
                            onClick={() => onConceptClick(concept)}
                            className="group bg-slate-800 hover:bg-slate-750 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
                            style={{ borderLeftWidth: '4px', borderLeftColor: color }}
                        >
                            {/* Header */}
                            <div className="flex items-start gap-4 mb-3">
                                <div className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                                    {icon}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                                            {concept.name}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${colorClass} whitespace-nowrap`}>
                                            {percent}%
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mb-3">
                                        <span 
                                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border"
                                            style={{ 
                                                color: color,
                                                backgroundColor: `${color}15`,
                                                borderColor: `${color}30`
                                            }}
                                        >
                                            {concept.category?.replace(/_/g, ' ')}
                                        </span>
                                        {concept.source && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-700 text-gray-400 border border-slate-600">
                                                {concept.source === 'gemini' ? '🤖 AI' : concept.source === 'ast_analysis' ? '🔬 AST' : '📋 Rules'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Description */}
                            <p className="text-gray-300 leading-relaxed mb-4">
                                {concept.description}
                            </p>
                            
                            {/* Evidence */}
                            {concept.evidence && (
                                <div className="bg-slate-900/50 rounded-lg p-3 mb-3 border border-slate-700">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs text-gray-500 font-medium flex-shrink-0 mt-0.5">Evidence:</span>
                                        <code className="text-xs text-blue-300 font-mono flex-1">
                                            {concept.evidence.substring(0, 150)}
                                            {concept.evidence.length > 150 && '...'}
                                        </code>
                                    </div>
                                </div>
                            )}
                            
                            {/* Related Concepts */}
                            {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs text-gray-500 font-medium">Related:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {concept.relatedConcepts.slice(0, 3).map((related, i) => (
                                            <span 
                                                key={i} 
                                                className="px-2 py-1 bg-slate-700 text-cyan-300 rounded-md text-xs font-medium border border-slate-600 hover:bg-slate-600 transition-colors"
                                            >
                                                {related}
                                            </span>
                                        ))}
                                        {concept.relatedConcepts.length > 3 && (
                                            <span className="px-2 py-1 bg-slate-700 text-gray-400 rounded-md text-xs">
                                                +{concept.relatedConcepts.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {/* Click hint */}
                            <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                                <span className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                                    Click for detailed explanation
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConceptList;