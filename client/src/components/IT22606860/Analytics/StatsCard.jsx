import React from 'react';
import { FaCode, FaChartLine, FaShieldAlt, FaStar, FaClock } from 'react-icons/fa';

const StatsCards = ({ dashboard }) => {
    if (!dashboard) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Refactorings */}
            <div className="card bg-blue-500/10 border-blue-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-blue-400 font-semibold">Total Refactorings</p>
                        <p className="text-3xl font-bold text-white">{dashboard.totalRefactorings || 0}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {dashboard.recentActivity || 0} in last 7 days
                        </p>
                    </div>
                    <FaCode className="text-4xl text-blue-500" />
                </div>
            </div>

            {/* Avg Quality Improvement */}
            <div className="card bg-green-500/10 border-green-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-green-400 font-semibold">Avg Quality Gain</p>
                        <p className="text-3xl font-bold text-white">
                            +{dashboard.avgQualityImprovement?.toFixed(1) || 0}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Per refactoring</p>
                    </div>
                    <FaChartLine className="text-4xl text-green-500" />
                </div>
            </div>

            {/* Risks Fixed */}
            <div className="card bg-red-500/10 border-red-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-red-400 font-semibold">Risks Fixed</p>
                        <p className="text-3xl font-bold text-white">
                            {dashboard.fixedRisks || 0}/{dashboard.totalRisks || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {dashboard.riskFixRate?.toFixed(1) || 0}% fix rate
                        </p>
                    </div>
                    <FaShieldAlt className="text-4xl text-red-500" />
                </div>
            </div>

            {/* User Satisfaction */}
            <div className="card bg-yellow-500/10 border-yellow-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-yellow-400 font-semibold">User Rating</p>
                        <p className="text-3xl font-bold text-white">
                            {dashboard.avgUserRating?.toFixed(1) || 0}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {dashboard.totalRatings || 0} ratings
                        </p>
                    </div>
                    <FaStar className="text-4xl text-yellow-500" />
                </div>
            </div>

            {/* Avg Processing Time */}
            <div className="card bg-purple-500/10 border-purple-500/30 md:col-span-2 lg:col-span-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-purple-400 font-semibold">Average Processing Time</p>
                        <p className="text-3xl font-bold text-white">
                            {dashboard.avgProcessingTime 
                                ? `${(dashboard.avgProcessingTime / 1000).toFixed(2)}s` 
                                : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Time to refactor code</p>
                    </div>
                    <FaClock className="text-4xl text-purple-500" />
                </div>
            </div>
        </div>
    );
};

export default StatsCards;