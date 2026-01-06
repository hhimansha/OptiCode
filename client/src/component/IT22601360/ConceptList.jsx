/**
 * Concept List Component
 * Student: IT22601360
 * 
 * Displays extracted concepts as cards
 */

import React from 'react';
import './ConceptList.css';

// Category icons
const categoryIcons = {
    data_structure: '🗃️',
    algorithm: '⚙️',
    design_pattern: '🎨',
    architecture: '🏛️',
    paradigm: '💡',
    programming_concept: '📦'
};

// Category colors
const categoryColors = {
    data_structure: '#4CAF50',
    algorithm: '#2196F3',
    design_pattern: '#9C27B0',
    architecture: '#FF9800',
    paradigm: '#E91E63',
    programming_concept: '#00BCD4'
};

// Confidence level badge
const getConfidenceBadge = (confidence) => {
    const percent = Math.round(confidence * 100);
    let level = 'low';
    if (percent >= 90) level = 'very-high';
    else if (percent >= 75) level = 'high';
    else if (percent >= 50) level = 'medium';
    
    return { percent, level };
};

const ConceptList = ({ concepts, onConceptClick }) => {
    if (!concepts || concepts.length === 0) {
        return (
            <div className="concept-list-empty">
                <p>No concepts found</p>
            </div>
        );
    }

    // Sort by confidence
    const sortedConcepts = [...concepts].sort((a, b) => b.confidence - a.confidence);

    return (
        <div className="concept-list">
            {sortedConcepts.map((concept, index) => {
                const { percent, level } = getConfidenceBadge(concept.confidence);
                const icon = categoryIcons[concept.category] || '📦';
                const color = categoryColors[concept.category] || '#666';
                
                return (
                    <div 
                        key={index}
                        className="concept-card"
                        onClick={() => onConceptClick(concept)}
                        style={{ borderLeftColor: color }}
                    >
                        <div className="concept-header">
                            <span className="concept-icon">{icon}</span>
                            <h3 className="concept-name">{concept.name}</h3>
                            <span className={`confidence-badge ${level}`}>
                                {percent}%
                            </span>
                        </div>
                        
                        <div className="concept-category" style={{ color }}>
                            {concept.category?.replace(/_/g, ' ')}
                        </div>
                        
                        <p className="concept-description">
                            {concept.description}
                        </p>
                        
                        {concept.evidence && (
                            <div className="concept-evidence">
                                <span className="evidence-label">Evidence:</span>
                                <code>{concept.evidence.substring(0, 100)}...</code>
                            </div>
                        )}
                        
                        {concept.relatedConcepts && concept.relatedConcepts.length > 0 && (
                            <div className="concept-related">
                                <span className="related-label">Related:</span>
                                <div className="related-tags">
                                    {concept.relatedConcepts.slice(0, 3).map((related, i) => (
                                        <span key={i} className="related-tag">
                                            {related}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="concept-footer">
                            <span className="click-hint">Click for details →</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ConceptList;
