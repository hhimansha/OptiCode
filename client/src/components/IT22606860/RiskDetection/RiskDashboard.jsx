import React from 'react';
import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
import RiskCard from './RiskCard';

const RiskDashboard = ({ risks, summary, loading }) => {
    if (loading) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="text-white mt-4">Analyzing code risks...</p>
                </div>
            </div>
        );
    }

    if (!risks || risks.length === 0) {
        return (
            <div className="card bg-green-500/10 border-green-500/30">
                <div className="text-center py-8">
                    <FaShieldAlt className="text-6xl text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">No Risks Detected!</h3>
                    <p className="text-gray-300">Your code looks secure and well-written.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card bg-red-500/10 border-red-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-400 font-semibold">Critical</p>
                            <p className="text-3xl font-bold text-white">{summary?.critical || 0}</p>
                        </div>
                        <FaExclamationTriangle className="text-4xl text-red-500" />
                    </div>
                </div>

                <div className="card bg-orange-500/10 border-orange-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-400 font-semibold">High</p>
                            <p className="text-3xl font-bold text-white">{summary?.high || 0}</p>
                        </div>
                        <FaExclamationCircle className="text-4xl text-orange-500" />
                    </div>
                </div>

                <div className="card bg-yellow-500/10 border-yellow-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-400 font-semibold">Medium</p>
                            <p className="text-3xl font-bold text-white">{summary?.medium || 0}</p>
                        </div>
                        <FaExclamationCircle className="text-4xl text-yellow-500" />
                    </div>
                </div>

                <div className="card bg-blue-500/10 border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-400 font-semibold">Low</p>
                            <p className="text-3xl font-bold text-white">{summary?.low || 0}</p>
                        </div>
                        <FaInfoCircle className="text-4xl text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Risk Score */}
            {summary?.risk_score !== undefined && (
                <div className="card bg-purple-500/10 border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Overall Risk Score</h3>
                            <p className="text-gray-300">
                                {summary.risk_score < 30 ? 'Low risk - Good code quality' :
                                 summary.risk_score < 60 ? 'Moderate risk - Some improvements needed' :
                                 'High risk - Significant issues found'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={`text-5xl font-bold ${
                                summary.risk_score < 30 ? 'text-green-500' :
                                summary.risk_score < 60 ? 'text-yellow-500' :
                                'text-red-500'
                            }`}>
                                {summary.risk_score}
                            </p>
                            <p className="text-gray-400 text-sm">/100</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Risk List */}
            <div className="card">
                <h3 className="text-xl font-bold text-white mb-4">Detected Risks</h3>
                <div className="space-y-3">
                    {risks.map((risk, index) => (
                        <RiskCard key={index} risk={risk} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RiskDashboard;