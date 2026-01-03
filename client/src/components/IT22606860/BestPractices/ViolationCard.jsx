import React, { useState } from 'react';
import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaChevronDown, FaChevronUp, FaBook } from 'react-icons/fa';

const ViolationCard = ({ violation, index }) => {
    const [expanded, setExpanded] = useState(false);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'error':
                return 'border-red-500 bg-red-500/10';
            case 'warning':
                return 'border-yellow-500 bg-yellow-500/10';
            case 'info':
                return 'border-blue-500 bg-blue-500/10';
            default:
                return 'border-gray-500 bg-gray-500/10';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'error':
                return <FaExclamationTriangle className="text-red-500" />;
            case 'warning':
                return <FaExclamationCircle className="text-yellow-500" />;
            case 'info':
                return <FaInfoCircle className="text-blue-500" />;
            default:
                return <FaInfoCircle />;
        }
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        return badges[severity] || 'bg-gray-500 text-white';
    };

    return (
        <div className={`border rounded-lg p-4 ${getSeverityColor(violation.severity)} transition-all`}>
            <div 
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                {getSeverityIcon(violation.severity)}
                
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityBadge(violation.severity)}`}>
                            {violation.severity.toUpperCase()}
                        </span>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {violation.category}
                        </span>
                        <span className="text-xs text-gray-400">Line {violation.line}</span>
                    </div>
                    
                    <p className="text-white font-medium mb-2">{violation.message}</p>
                    
                    <code className="bg-gray-900 text-yellow-400 px-2 py-1 rounded text-sm block overflow-x-auto">
                        {violation.code}
                    </code>
                </div>

                <button className="text-gray-400 hover:text-white transition">
                    {expanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>

            {expanded && (
                <div className="mt-4 pl-8 space-y-4 border-t border-gray-700 pt-4">
                    <div>
                        <p className="text-sm font-semibold text-green-400 mb-2">
                            ✅ Recommendation:
                        </p>
                        <p className="text-white text-sm">{violation.recommendation}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-semibold text-red-400 mb-2">
                                ❌ Don't do this:
                            </p>
                            <pre className="bg-gray-900 text-red-300 p-3 rounded text-xs overflow-x-auto">
                                {violation.bad_example || violation.badExample}
                            </pre>
                        </div>
                        
                        <div>
                            <p className="text-sm font-semibold text-green-400 mb-2">
                                ✅ Do this instead:
                            </p>
                            <pre className="bg-gray-900 text-green-300 p-3 rounded text-xs overflow-x-auto">
                                {violation.good_example || violation.goodExample}
                            </pre>
                        </div>
                    </div>

                    {violation.reference && (
                        <div>
                            
                                href={violation.reference}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 inline-flex"
                            <a>
                                <FaBook /> Learn more about this
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViolationCard;