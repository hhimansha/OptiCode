import React, { useState } from 'react';
import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaChevronDown, FaChevronUp, FaLightbulb, FaBook } from 'react-icons/fa';

const RiskCard = ({ risk, index }) => {
    const [expanded, setExpanded] = useState(false);

    const getSeverityColor = (severity) => {
        switch (severity) {
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

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical':
            case 'high':
                return <FaExclamationTriangle className="text-red-500" />;
            case 'medium':
                return <FaExclamationCircle className="text-yellow-500" />;
            case 'low':
                return <FaInfoCircle className="text-blue-500" />;
            default:
                return <FaInfoCircle />;
        }
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            critical: 'bg-red-500 text-white',
            high: 'bg-orange-500 text-white',
            medium: 'bg-yellow-500 text-white',
            low: 'bg-blue-500 text-white'
        };
        return badges[severity] || 'bg-gray-500 text-white';
    };

    const getCategoryBadge = (category) => {
        const badges = {
            security: 'bg-red-600 text-white',
            performance: 'bg-orange-600 text-white',
            maintainability: 'bg-blue-600 text-white',
            bug: 'bg-purple-600 text-white'
        };
        return badges[category] || 'bg-gray-600 text-white';
    };

    return (
        <div className={`border rounded-lg p-4 ${getSeverityColor(risk.severity)} transition-all`}>
            <div 
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                {getSeverityIcon(risk.severity)}
                
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityBadge(risk.severity)}`}>
                            {risk.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryBadge(risk.category)}`}>
                            {risk.category}
                        </span>
                        <span className="text-xs text-gray-400">Line {risk.line}</span>
                    </div>
                    
                    <p className="text-white font-medium mb-2">{risk.message}</p>
                    
                    <code className="bg-gray-900 text-red-400 px-2 py-1 rounded text-sm block overflow-x-auto">
                        {risk.code}
                    </code>
                </div>

                <button className="text-gray-400 hover:text-white transition">
                    {expanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>

            {expanded && (
                <div className="mt-4 pl-8 space-y-3 border-t border-gray-700 pt-4">
                    <div>
                        <p className="text-sm font-semibold text-yellow-400 mb-1 flex items-center gap-2">
                            <FaExclamationCircle /> Why is this risky?
                        </p>
                        <p className="text-white text-sm">{risk.explanation}</p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-red-400 mb-1 flex items-center gap-2">
                            <FaExclamationTriangle /> Impact:
                        </p>
                        <p className="text-white text-sm">{risk.impact}</p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-green-400 mb-1 flex items-center gap-2">
                            <FaLightbulb /> How to fix:
                        </p>
                        <p className="text-white text-sm">{risk.fix_suggestion || risk.fixSuggestion}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskCard;