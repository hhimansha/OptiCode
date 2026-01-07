import React, { useState, useEffect } from 'react';
import { 
    FaExclamationTriangle, 
    FaCheckCircle, 
    FaExclamationCircle,
    FaChartBar,
    FaChartPie,
    FaChartLine,
    FaInfoCircle,
    FaLightbulb,
    FaShieldAlt
} from 'react-icons/fa';
import {
    PieChart, Pie, Cell, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';

const RiskAnalysisPanel = ({ riskData, loading, error }) => {
    if (loading) {
        return (
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm shadow-lg shadow-slate-900/50">
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-300 text-sm">Analyzing refactoring risks...</p>
                    <p className="text-slate-400 text-xs mt-2">Checking for side effects, performance impacts, and maintainability</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg shadow-slate-900/50">
                <div className="flex items-center gap-3 text-red-400 mb-4">
                    <FaExclamationCircle className="text-xl" />
                    <h3 className="text-lg font-semibold">Risk Analysis Failed</h3>
                </div>
                <p className="text-slate-300">{error}</p>
            </div>
        );
    }

    if (!riskData) {
        return (
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm shadow-lg shadow-slate-900/50">
                <div className="text-center py-8">
                    <FaShieldAlt className="text-4xl text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">Risk Analysis</h3>
                    <p className="text-slate-400 text-sm">Click "Analyze Risk" to evaluate refactoring safety</p>
                </div>
            </div>
        );
    }

    const { risk_analysis, comparison_metrics, chart_data } = riskData;

    // Get risk level icon and color
    const getRiskLevelInfo = (level) => {
        switch(level.toLowerCase()) {
            case 'low':
                return { icon: <FaCheckCircle />, color: 'text-green-500', bg: 'bg-green-500/20', border: 'border-green-500/40' };
            case 'medium':
                return { icon: <FaExclamationTriangle />, color: 'text-yellow-500', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40' };
            case 'high':
                return { icon: <FaExclamationCircle />, color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/40' };
            default:
                return { icon: <FaInfoCircle />, color: 'text-slate-500', bg: 'bg-slate-500/20', border: 'border-slate-500/40' };
        }
    };

    const riskInfo = getRiskLevelInfo(risk_analysis.risk_level);

    return (
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm shadow-lg shadow-slate-900/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${riskInfo.bg} ${riskInfo.border} border`}>
                        <div className={`text-2xl ${riskInfo.color}`}>
                            {riskInfo.icon}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-100">Risk Analysis</h3>
                        <p className="text-slate-400 text-sm">Comprehensive safety assessment</p>
                    </div>
                </div>
                
                {/* Risk Score Badge */}
                <div className={`px-4 py-2 rounded-lg ${riskInfo.bg} ${riskInfo.border} border`}>
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${riskInfo.color}`}>
                            {risk_analysis.risk_score}/100
                        </div>
                        <div className={`text-xs font-semibold uppercase tracking-wider ${riskInfo.color} mt-1`}>
                            {risk_analysis.risk_level} RISK
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Risk Gauge Chart */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-4">
                        <FaChartPie className="text-cyan-500" />
                        <h4 className="font-semibold text-slate-200">Risk Level</h4>
                    </div>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart 
                                innerRadius="20%" 
                                outerRadius="100%" 
                                data={chart_data?.gauge_chart || []}
                                startAngle={180}
                                endAngle={0}
                            >
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar
                                    background
                                    dataKey="value"
                                    fill={risk_analysis.risk_color}
                                    cornerRadius={10}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-2">
                        <div className="text-3xl font-bold text-slate-100">
                            {risk_analysis.risk_score}
                        </div>
                        <div className="text-sm text-slate-400">Risk Score</div>
                    </div>
                </div>

                {/* Risk Factors Pie Chart */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-4">
                        <FaChartPie className="text-cyan-500" />
                        <h4 className="font-semibold text-slate-200">Risk Factors</h4>
                    </div>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chart_data?.pie_chart || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {chart_data?.pie_chart?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value}%`, 'Risk Score']}
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {risk_analysis.risk_factors?.slice(0, 4).map((factor, index) => (
                            <div key={index} className="bg-slate-800/30 p-2 rounded-lg">
                                <div className="text-xs text-slate-400 truncate">{factor.factor}</div>
                                <div className="text-sm font-semibold text-slate-200">{factor.score}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comparison Bar Chart */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-4">
                        <FaChartBar className="text-cyan-500" />
                        <h4 className="font-semibold text-slate-200">Code Comparison</h4>
                    </div>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { 
                                    name: 'Lines', 
                                    original: comparison_metrics?.line_count?.original || 0, 
                                    refactored: comparison_metrics?.line_count?.refactored || 0 
                                },
                                { 
                                    name: 'Complexity', 
                                    original: comparison_metrics?.complexity?.original_loops || 0, 
                                    refactored: comparison_metrics?.complexity?.refactored_loops || 0 
                                },
                                { 
                                    name: 'Readability', 
                                    original: comparison_metrics?.readability_score?.original || 0, 
                                    refactored: comparison_metrics?.readability_score?.refactored || 0 
                                }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="original" name="Original" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="refactored" name="Refactored" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Analysis */}
            <div className="space-y-6">
                {/* Explanation */}
                <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3">
                        <FaInfoCircle className="text-blue-500" />
                        <h4 className="font-semibold text-slate-200">Analysis Explanation</h4>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {risk_analysis.explanation}
                    </p>
                </div>

                {/* Risk Factors Detailed */}
                <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3">
                        <FaExclamationTriangle className="text-yellow-500" />
                        <h4 className="font-semibold text-slate-200">Risk Factors</h4>
                    </div>
                    <div className="space-y-3">
                        {risk_analysis.risk_factors?.map((factor, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/20 rounded-lg">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    factor.score <= 30 ? 'bg-green-500/20' : 
                                    factor.score <= 60 ? 'bg-yellow-500/20' : 
                                    'bg-red-500/20'
                                }`}>
                                    <span className={`font-bold ${
                                        factor.score <= 30 ? 'text-green-500' : 
                                        factor.score <= 60 ? 'text-yellow-500' : 
                                        'text-red-500'
                                    }`}>
                                        {factor.score}%
                                    </span>
                                </div>
                                <div>
                                    <div className="font-medium text-slate-200">{factor.factor}</div>
                                    <div className="text-slate-400 text-sm">{factor.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Suggestions and Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Suggestions */}
                    <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-3">
                            <FaLightbulb className="text-cyan-500" />
                            <h4 className="font-semibold text-slate-200">Suggestions</h4>
                        </div>
                        <ul className="space-y-2">
                            {risk_analysis.suggestions?.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-slate-300 text-sm">{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Final Recommendation */}
                    <div className={`rounded-xl p-4 border ${
                        risk_analysis.risk_level === 'low' ? 'bg-green-500/10 border-green-500/30' :
                        risk_analysis.risk_level === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-red-500/10 border-red-500/30'
                    }`}>
                        <div className="flex items-center gap-2 mb-3">
                            <FaShieldAlt className={
                                risk_analysis.risk_level === 'low' ? 'text-green-500' :
                                risk_analysis.risk_level === 'medium' ? 'text-yellow-500' :
                                'text-red-500'
                            } />
                            <h4 className="font-semibold text-slate-200">Recommendation</h4>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">
                            {risk_analysis.recommendation}
                        </p>
                        <div className={`px-3 py-2 rounded-lg text-center font-semibold text-sm ${
                            risk_analysis.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
                            risk_analysis.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                        }`}>
                            {risk_analysis.risk_level === 'low' ? '✅ SAFE TO APPLY' :
                             risk_analysis.risk_level === 'medium' ? '⚠️ APPLY WITH CAUTION' :
                             '❌ AVOID OR TEST THOROUGHLY'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskAnalysisPanel;