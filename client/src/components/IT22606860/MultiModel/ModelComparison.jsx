import React, { useState } from 'react';
import { FaTrophy, FaClock, FaChartLine, FaCheckCircle } from 'react-icons/fa';
import ModelCard from './ModelCard';

const ModelComparison = ({ models, winner, loading }) => {
    const [selectedModel, setSelectedModel] = useState(null);

    if (loading) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="text-white mt-4">Running multi-model comparison...</p>
                </div>
            </div>
        );
    }

    if (!models || models.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Winner Banner */}
            {winner && (
                <div className="card bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <FaTrophy className="text-5xl text-yellow-500" />
                            <div>
                                <p className="text-sm text-yellow-400 font-semibold">Winner</p>
                                <h3 className="text-2xl font-bold text-white">{winner.model_name}</h3>
                                <p className="text-gray-300 text-sm">
                                    {winner.reasons && winner.reasons.join(' • ')}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold text-yellow-500">{winner.score}</p>
                            <p className="text-sm text-gray-400">Overall Score</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Model Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {models.map((model, index) => (
                    <ModelCard 
                        key={index}
                        model={model}
                        isWinner={winner && model.model_id === winner.model_id}
                        rank={index + 1}
                        onClick={() => setSelectedModel(model)}
                    />
                ))}
            </div>

            {/* Comparison Table */}
            <div className="card">
                <h3 className="text-xl font-bold text-white mb-4">Detailed Comparison</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left text-white font-semibold py-3 px-4">Metric</th>
                                {models.map((model, index) => (
                                    <th key={index} className="text-center text-white font-semibold py-3 px-4">
                                        {model.model_name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-700">
                                <td className="text-gray-300 py-3 px-4">Processing Time</td>
                                {models.map((model, index) => (
                                    <td key={index} className="text-center text-white py-3 px-4">
                                        {model.processing_time ? `${(model.processing_time / 1000).toFixed(2)}s` : 'N/A'}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-700">
                                <td className="text-gray-300 py-3 px-4">Quality Score</td>
                                {models.map((model, index) => (
                                    <td key={index} className="text-center text-white py-3 px-4">
                                        {model.qualityMetrics?.improvement?.overallScore || 'N/A'}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-700">
                                <td className="text-gray-300 py-3 px-4">Risks Fixed</td>
                                {models.map((model, index) => (
                                    <td key={index} className="text-center text-white py-3 px-4">
                                        {model.riskAnalysis?.risksFixed || 0}
                                    </td>
                                ))}
                            </tr>
                            <tr className="border-b border-gray-700">
                                <td className="text-gray-300 py-3 px-4">LOC Reduction</td>
                                {models.map((model, index) => (
                                    <td key={index} className="text-center text-white py-3 px-4">
                                        {model.qualityMetrics?.improvement?.locReduction || 0}
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="text-gray-300 py-3 px-4 font-semibold">Total Score</td>
                                {models.map((model, index) => (
                                    <td key={index} className="text-center py-3 px-4">
                                        <span className={`font-bold text-lg ${
                                            winner && model.model_id === winner.model_id 
                                                ? 'text-yellow-500' 
                                                : 'text-white'
                                        }`}>
                                            {model.totalScore || 0}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ModelComparison;