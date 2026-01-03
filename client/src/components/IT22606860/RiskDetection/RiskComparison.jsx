import React from 'react';
import { FaArrowRight, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const RiskComparison = ({ comparison, loading }) => {
    if (loading) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="text-white mt-4">Comparing risks...</p>
                </div>
            </div>
        );
    }

    if (!comparison) {
        return null;
    }

    const { before, after, risksFixed, riskScoreReduction } = comparison;

    return (
        <div className="card">
            <h3 className="text-xl font-bold text-white mb-6">Risk Comparison</h3>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 font-semibold mb-2">Before Refactoring</p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-white">
                            <span>Total Risks:</span>
                            <span className="font-bold">{before.total}</span>
                        </div>
                        <div className="flex justify-between text-white text-sm">
                            <span>Critical:</span>
                            <span>{before.by_severity?.critical || 0}</span>
                        </div>
                        <div className="flex justify-between text-white text-sm">
                            <span>High:</span>
                            <span>{before.by_severity?.high || 0}</span>
                        </div>
                        <div className="flex justify-between text-white text-sm">
                            <span>Risk Score:</span>
                            <span className="font-bold text-red-400">{before.risk_score}/100</span>
                        </div>
                    </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-400 font-semibold mb-2">After Refactoring</p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-white">
                            <span>Total Risks:</span>
                            <span className="font-bold">{after.total}</span>
                        </div>
                        <div className="flex justify-between text-white text-sm">
                            <span>Critical:</span>
                            <span>{after.by_severity?.critical || 0}</span>
                        </div>
                        <div className="flex justify-between text-white text-sm">
                            <span>High:</span>
                            <span>{after.by_severity?.high || 0}</span>
                        </div>
                        <div className="flex justify-between text-white text-sm">
                            <span>Risk Score:</span>
                            <span className="font-bold text-green-400">{after.risk_score}/100</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Improvement Summary */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg font-bold text-white mb-2">Improvement Summary</p>
                        <div className="space-y-1">
                            {risksFixed > 0 ? (
                                <p className="text-green-400 flex items-center gap-2">
                                    <FaCheckCircle /> Fixed {risksFixed} risk{risksFixed > 1 ? 's' : ''}
                                </p>
                            ) : (
                                <p className="text-yellow-400 flex items-center gap-2">
                                    <FaTimesCircle /> No risks fixed
                                </p>
                            )}
                            {riskScoreReduction > 0 && (
                                <p className="text-green-400 flex items-center gap-2">
                                    <FaCheckCircle /> Risk score reduced by {riskScoreReduction} points
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="flex items-center gap-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-400">{before.risk_score}</p>
                                <p className="text-xs text-gray-400">Before</p>
                            </div>
                            <FaArrowRight className="text-gray-400" />
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-400">{after.risk_score}</p>
                                <p className="text-xs text-gray-400">After</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskComparison;