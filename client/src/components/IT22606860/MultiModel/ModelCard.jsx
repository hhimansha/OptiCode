import React from 'react';
import { FaTrophy, FaClock, FaCheckCircle, FaCode } from 'react-icons/fa';

const ModelCard = ({ model, isWinner, rank, onClick }) => {
    return (
        <div 
            className={`card cursor-pointer transition-all hover:scale-105 ${
                isWinner 
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20' 
                    : 'hover:border-blue-500'
            }`}
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {isWinner && <FaTrophy className="text-2xl text-yellow-500" />}
                    <div>
                        <h4 className="text-lg font-bold text-white">{model.model_name}</h4>
                        <p className="text-xs text-gray-400">{model.description}</p>
                    </div>
                </div>
                <div className={`text-2xl font-bold ${
                    rank === 1 ? 'text-yellow-500' :
                    rank === 2 ? 'text-gray-400' :
                    'text-orange-700'
                }`}>
                    #{rank}
                </div>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                        <FaClock /> Processing Time
                    </span>
                    <span className="text-white font-semibold">
                        {model.processing_time ? `${(model.processing_time / 1000).toFixed(2)}s` : 'N/A'}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                        <FaCheckCircle /> Quality Score
                    </span>
                    <span className="text-white font-semibold">
                        {model.qualityMetrics?.improvement?.overallScore || 'N/A'}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                        <FaCode /> LOC Reduction
                    </span>
                    <span className="text-white font-semibold">
                        {model.qualityMetrics?.improvement?.locReduction || 0}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <span className="text-sm text-gray-400 font-semibold">Total Score</span>
                    <span className={`text-2xl font-bold ${
                        isWinner ? 'text-yellow-500' : 'text-white'
                    }`}>
                        {model.totalScore || 0}
                    </span>
                </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4">
                {model.success ? (
                    <span className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                        ✓ Success
                    </span>
                ) : (
                    <span className="inline-block bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                        ✗ Failed
                    </span>
                )}
            </div>
        </div>
    );
};

export default ModelCard;