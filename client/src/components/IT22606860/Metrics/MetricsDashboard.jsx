import React from 'react';
import { FaChartLine, FaCode, FaBrain, FaCheckCircle } from 'react-icons/fa';
import MetricsChart from './MetricsChart';

const MetricsDashboard = ({ metrics, loading }) => {
    if (loading) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="text-white mt-4">Calculating metrics...</p>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card bg-blue-500/10 border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-400 font-semibold">Lines of Code</p>
                            <p className="text-3xl font-bold text-white">{metrics.loc || 0}</p>
                        </div>
                        <FaCode className="text-4xl text-blue-500" />
                    </div>
                </div>

                <div className="card bg-purple-500/10 border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-400 font-semibold">Complexity</p>
                            <p className="text-3xl font-bold text-white">
                                {metrics.complexity?.average?.toFixed(1) || 0}
                            </p>
                        </div>
                        <FaBrain className="text-4xl text-purple-500" />
                    </div>
                </div>

                <div className="card bg-green-500/10 border-green-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-400 font-semibold">Maintainability</p>
                            <p className="text-3xl font-bold text-white">
                                {metrics.maintainability_index?.toFixed(0) || 0}
                            </p>
                        </div>
                        <FaCheckCircle className="text-4xl text-green-500" />
                    </div>
                </div>

                <div className="card bg-orange-500/10 border-orange-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-400 font-semibold">Functions</p>
                            <p className="text-3xl font-bold text-white">
                                {metrics.functions_count || 0}
                            </p>
                        </div>
                        <FaChartLine className="text-4xl text-orange-500" />
                    </div>
                </div>
            </div>

            {/* Detailed Metrics */}
            <div className="card">
                <h3 className="text-xl font-bold text-white mb-4">Detailed Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Code Structure</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-gray-300">
                                <span>Total Lines (LOC):</span>
                                <span className="font-semibold text-white">{metrics.loc || 0}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Logical Lines (LLOC):</span>
                                <span className="font-semibold text-white">{metrics.lloc || 0}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Source Lines (SLOC):</span>
                                <span className="font-semibold text-white">{metrics.sloc || 0}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Comments:</span>
                                <span className="font-semibold text-white">{metrics.comments || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Complexity</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-gray-300">
                                <span>Average Complexity:</span>
                                <span className="font-semibold text-white">
                                    {metrics.complexity?.average?.toFixed(1) || 0}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Max Complexity:</span>
                                <span className="font-semibold text-white">
                                    {metrics.complexity?.max || 0}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Total Functions:</span>
                                <span className="font-semibold text-white">
                                    {metrics.complexity?.total_functions || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Chart */}
            {metrics.complexity && (
                <MetricsChart metrics={metrics} />
            )}
        </div>
    );
};

export default MetricsDashboard;