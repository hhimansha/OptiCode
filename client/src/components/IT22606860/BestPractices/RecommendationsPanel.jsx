import React from 'react';
import { FaBook, FaLightbulb, FaExternalLinkAlt } from 'react-icons/fa';

const RecommendationsPanel = ({ recommendations }) => {
    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical':
                return 'border-red-500 bg-red-500/10';
            case 'high':
                return 'border-orange-500 bg-orange-500/10';
            case 'medium':
                return 'border-yellow-500 bg-yellow-500/10';
            case 'low':
                return 'border-blue-500 bg-blue-500/10';
            default:
                return 'border-gray-500 bg-gray-500/10';
        }
    };

    return (
        <div className="card bg-blue-500/10 border-blue-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaLightbulb className="text-blue-400" />
                Learning Recommendations
            </h3>

            <div className="space-y-4">
                {recommendations.map((rec, index) => (
                    <div
                        key={index}
                        className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
                    >
                        <h4 className="text-lg font-semibold text-white mb-2">
                            {rec.title}
                        </h4>

                        <p className="text-gray-300 text-sm mb-3">
                            {rec.summary}
                        </p>

                        {rec.tips && rec.tips.length > 0 && (
                            <div className="mb-3">
                                <p className="text-sm font-semibold text-blue-400 mb-2">
                                    Quick Tips:
                                </p>
                                <ul className="space-y-1">
                                    {rec.tips.map((tip, i) => (
                                        <li
                                            key={i}
                                            className="text-sm text-gray-300 flex items-start gap-2"
                                        >
                                            <span className="text-blue-400 mt-0.5">•</span>
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {rec.example && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div>
                                    <p className="text-xs text-red-400 font-semibold mb-1">
                                        ❌ Avoid:
                                    </p>
                                    <pre className="bg-gray-900 text-red-300 p-2 rounded text-xs overflow-x-auto">
                                        {rec.example.bad}
                                    </pre>
                                </div>

                                <div>
                                    <p className="text-xs text-green-400 font-semibold mb-1">
                                        ✅ Prefer:
                                    </p>
                                    <pre className="bg-gray-900 text-green-300 p-2 rounded text-xs overflow-x-auto">
                                        {rec.example.good}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {rec.example?.explanation && (
                            <p className="text-sm text-gray-300 italic mb-3">
                                💡 {rec.example.explanation}
                            </p>
                        )}

                        {rec.resources && rec.resources.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {rec.resources.map((resource, i) => (
                                    <a
                                        key={i}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                                    >
                                        <FaBook />
                                        <span>{resource.title}</span>
                                        <FaExternalLinkAlt className="text-xs" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendationsPanel;
