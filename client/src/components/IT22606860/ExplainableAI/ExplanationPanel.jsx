import React from 'react';
import { FaLightbulb, FaArrowRight, FaCheckCircle, FaBook } from 'react-icons/fa';

const ExplanationPanel = ({ explanation, loading }) => {
    if (loading) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="text-white mt-4">Generating explanation...</p>
                </div>
            </div>
        );
    }

    if (!explanation) {
        return null;
    }

    return (
        <div className="card bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaLightbulb className="text-yellow-400" />
                Why This Refactoring?
            </h3>

            {/* Changes Made */}
            {explanation.changes && explanation.changes.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">
                        Changes Made:
                    </h4>
                    <div className="space-y-3">
                        {explanation.changes.map((change, index) => (
                            <div key={index} className="bg-gray-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <FaArrowRight className="text-green-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-white font-semibold mb-1">
                                            {change.title}
                                        </p>
                                        <p className="text-gray-300 text-sm mb-2">
                                            {change.description}
                                        </p>

                                        {change.reason && (
                                            <p className="text-blue-400 text-sm">
                                                <strong>Why:</strong> {change.reason}
                                            </p>
                                        )}

                                        {change.benefit && (
                                            <p className="text-green-400 text-sm">
                                                <strong>Benefit:</strong> {change.benefit}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Design Principles */}
            {explanation.principles && explanation.principles.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">
                        Design Principles Applied:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {explanation.principles.map((principle, index) => (
                            <div
                                key={index}
                                className="bg-gray-800 rounded-lg p-3 flex items-center gap-2"
                            >
                                <FaCheckCircle className="text-green-400" />
                                <span className="text-white">{principle}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Benefits */}
            {explanation.benefits && explanation.benefits.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">
                        Benefits:
                    </h4>
                    <ul className="space-y-2">
                        {explanation.benefits.map((benefit, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-2 text-gray-300"
                            >
                                <span className="text-green-400 mt-1">✓</span>
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Learn More */}
            {explanation.resources && explanation.resources.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold text-white mb-3">
                        Learn More:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {explanation.resources.map((resource, index) => (
                            <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition"
                            >
                                <FaBook />
                                <span>{resource.title}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExplanationPanel;
