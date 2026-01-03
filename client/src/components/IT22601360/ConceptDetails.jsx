/**
 * Concept Details Modal Component
 * Student: IT22601360
 * 
 * Shows detailed information about a selected concept
 * Uses Gemini API to generate educational content
 */

import React, { useState, useEffect } from 'react';
import { conceptExtractorApi } from '../../modules/IT22601360/conceptExtractorApi';
import './ConceptDetails.css';

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
        if (e.target.classList.contains('concept-details-overlay')) {
            onClose();
        }
    };

    if (!concept) return null;

    return (
        <div className="concept-details-overlay" onClick={handleBackdropClick}>
            <div className="concept-details-modal">
                {/* Header */}
                <div className="modal-header">
                    <div className="header-content">
                        <h2>{concept.name}</h2>
                        <span 
                            className="category-badge"
                            style={{ backgroundColor: getCategoryColor(concept.category) }}
                        >
                            {concept.category?.replace(/_/g, ' ')}
                        </span>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Detail Level Selector */}
                <div className="detail-level-selector">
                    <span>Detail Level:</span>
                    {['basic', 'intermediate', 'advanced'].map((level) => (
                        <button
                            key={level}
                            className={detailLevel === level ? 'active' : ''}
                            onClick={() => setDetailLevel(level)}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="modal-content">
                    {isLoading && (
                        <div className="loading-details">
                            <div className="spinner"></div>
                            <p>Generating explanation...</p>
                        </div>
                    )}

                    {error && !details && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {details && !isLoading && (
                        <div className="details-content">
                            {/* Confidence */}
                            <div className="confidence-section">
                                <div className="confidence-bar">
                                    <div 
                                        className="confidence-fill"
                                        style={{ 
                                            width: `${Math.round(concept.confidence * 100)}%`,
                                            backgroundColor: getConfidenceColor(concept.confidence)
                                        }}
                                    />
                                </div>
                                <span className="confidence-text">
                                    {Math.round(concept.confidence * 100)}% confidence
                                </span>
                            </div>

                            {/* Definition */}
                            <section className="detail-section">
                                <h3>📖 Definition</h3>
                                <p>{details.definition || concept.description}</p>
                            </section>

                            {/* How Used in Code */}
                            {details.how_used_in_code && (
                                <section className="detail-section">
                                    <h3>💻 How It's Used in This Code</h3>
                                    <p>{details.how_used_in_code}</p>
                                </section>
                            )}

                            {/* Complexity */}
                            {(details.time_complexity || details.space_complexity) && (
                                <section className="detail-section">
                                    <h3>⏱️ Complexity Analysis</h3>
                                    <div className="complexity-grid">
                                        {details.time_complexity && (
                                            <div className="complexity-item">
                                                <span className="complexity-label">Time:</span>
                                                <code>{details.time_complexity}</code>
                                            </div>
                                        )}
                                        {details.space_complexity && (
                                            <div className="complexity-item">
                                                <span className="complexity-label">Space:</span>
                                                <code>{details.space_complexity}</code>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* Advantages */}
                            {details.advantages && details.advantages.length > 0 && (
                                <section className="detail-section">
                                    <h3>✅ Advantages</h3>
                                    <ul className="pros-list">
                                        {details.advantages.map((adv, i) => (
                                            <li key={i}>{adv}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Disadvantages */}
                            {details.disadvantages && details.disadvantages.length > 0 && (
                                <section className="detail-section">
                                    <h3>❌ Disadvantages</h3>
                                    <ul className="cons-list">
                                        {details.disadvantages.map((dis, i) => (
                                            <li key={i}>{dis}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Real World Examples */}
                            {details.real_world_examples && details.real_world_examples.length > 0 && (
                                <section className="detail-section">
                                    <h3>🌍 Real World Applications</h3>
                                    <ul className="examples-list">
                                        {details.real_world_examples.map((ex, i) => (
                                            <li key={i}>{ex}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* Related Concepts */}
                            {(details.related_concepts?.length > 0 || concept.relatedConcepts?.length > 0) && (
                                <section className="detail-section">
                                    <h3>🔗 Related Concepts</h3>
                                    <div className="related-tags">
                                        {(details.related_concepts || concept.relatedConcepts || []).map((rel, i) => (
                                            <span key={i} className="related-tag">{rel}</span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Evidence from Code */}
                            {concept.evidence && (
                                <section className="detail-section">
                                    <h3>🔍 Evidence in Code</h3>
                                    <code className="evidence-code">{concept.evidence}</code>
                                </section>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <span className="footer-note">
                        💡 Generated by AI - Always verify with official documentation
                    </span>
                    <button className="btn btn-primary" onClick={onClose}>
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
        data_structure: '#4CAF50',
        algorithm: '#2196F3',
        design_pattern: '#9C27B0',
        architecture: '#FF9800',
        paradigm: '#E91E63',
        programming_concept: '#00BCD4'
    };
    return colors[category] || '#666';
};

const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#f44336';
};

export default ConceptDetails;
