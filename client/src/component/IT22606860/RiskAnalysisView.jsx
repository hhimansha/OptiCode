// ============================================
// RiskAnalysisView Component
// Comprehensive Risk Analysis Display with Charts and Details
// ============================================
import React from 'react';
import { FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaChartPie, FaTachometerAlt } from 'react-icons/fa';

const RiskAnalysisView = ({ riskAnalysis }) => {
    // Debug logging
    console.log('[RiskAnalysisView] Received riskAnalysis:', riskAnalysis);
    
    if (!riskAnalysis) {
        return (
            <div className="text-center py-12 text-slate-400">
                <FaShieldAlt className="text-5xl mx-auto mb-4 opacity-50" />
                <p className="text-lg">No risk analysis data available</p>
                <p className="text-sm mt-2">Risk analysis was not performed for this refactoring</p>
                <p className="text-xs mt-4 text-slate-500">
                    Click "Analyze Risk" on the refactor page to generate risk analysis
                </p>
            </div>
        );
    }

    // Check if we have detailed analysis
    if (!riskAnalysis.detailed) {
        // Check if we have old format data (before/after)
        if (riskAnalysis.before || riskAnalysis.after) {
            return (
                <div className="text-center py-12 text-slate-400">
                    <FaShieldAlt className="text-5xl mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Basic risk analysis available</p>
                    <p className="text-sm mt-2">This refactoring has basic risk data but not detailed analysis</p>
                    <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
                        {riskAnalysis.before && (
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <p className="text-slate-400 text-xs mb-2">Before</p>
                                <p className="text-white text-2xl font-bold">{riskAnalysis.before.totalRisks || 0}</p>
                                <p className="text-slate-400 text-xs">Total Risks</p>
                            </div>
                        )}
                        {riskAnalysis.after && (
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                <p className="text-slate-400 text-xs mb-2">After</p>
                                <p className="text-white text-2xl font-bold">{riskAnalysis.after.totalRisks || 0}</p>
                                <p className="text-slate-400 text-xs">Total Risks</p>
                            </div>
                        )}
                    </div>
                    <p className="text-xs mt-6 text-slate-500">
                        Re-analyze this code to get detailed risk assessment
                    </p>
                </div>
            );
        }
        
        return (
            <div className="text-center py-12 text-slate-400">
                <FaShieldAlt className="text-5xl mx-auto mb-4 opacity-50" />
                <p className="text-lg">No detailed risk analysis available</p>
                <p className="text-sm mt-2">Risk analysis data was not captured for this refactoring</p>
            </div>
        );
    }

    const { detailed } = riskAnalysis;
    console.log('[RiskAnalysisView] Full riskAnalysis object:', riskAnalysis);
    console.log('[RiskAnalysisView] Detailed data:', detailed);
    
    const {
        riskScore = 0,
        riskLevel = 'medium',
        explanation = '',
        recommendation = '',
        riskFactors = [],
        suggestions = [],
        potentialIssues = [],
        sideEffects = []
    } = detailed;

    // Get risk level badge color
    const getRiskLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 'from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-400';
            case 'medium': return 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-400';
            case 'high': return 'from-red-500/20 to-rose-500/10 border-red-500/30 text-red-400';
            default: return 'from-slate-500/20 to-gray-500/10 border-slate-500/30 text-slate-400';
        }
    };

    // Get gauge color based on score
    const getGaugeColor = (score) => {
        if (score <= 30) return { primary: '#10B981', secondary: '#34D399', glow: 'rgba(16, 185, 129, 0.5)' };
        if (score <= 60) return { primary: '#F59E0B', secondary: '#FBBF24', glow: 'rgba(245, 158, 11, 0.5)' };
        return { primary: '#EF4444', secondary: '#F87171', glow: 'rgba(239, 68, 68, 0.5)' };
    };

    const gaugeColors = getGaugeColor(riskScore);
    
    // Calculate gauge position (0-100 to degrees for half circle)
    const gaugePercentage = Math.min(Math.max(riskScore, 0), 100);
    const gaugeRotation = (gaugePercentage / 100) * 180;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Modern Header with Glassmorphism Effect */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <FaShieldAlt className="text-white text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-2xl">Risk Analysis Report</h3>
                                <p className="text-slate-300 text-sm mt-1">AI-Powered Safety Assessment</p>
                            </div>
                        </div>
                        <div className={`px-6 py-3 rounded-2xl bg-gradient-to-br ${getRiskLevelColor(riskLevel)} border-2 font-bold text-3xl shadow-xl backdrop-blur-sm`}>
                            {riskScore}<span className="text-xl opacity-70">/100</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${getRiskLevelColor(riskLevel)} border-2 text-sm font-bold uppercase tracking-wide shadow-lg`}>
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: gaugeColors.primary }}></span>
                            {riskLevel} Risk Level
                        </div>
                        {riskScore <= 30 && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-semibold">
                                <FaCheckCircle /> Safe to Apply
                            </div>
                        )}
                        {riskScore > 70 && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-semibold">
                                <FaExclamationTriangle /> Review Required
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Modern Circular Gauge */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                            <FaTachometerAlt className="text-blue-400 text-xl" />
                        </div>
                        <h4 className="text-white font-bold text-lg">Risk Meter</h4>
                    </div>
                    
                    {/* Modern Gauge Chart */}
                    <div className="relative flex items-center justify-center py-8">
                        <svg className="w-64 h-32" viewBox="0 0 200 100">
                            {/* Background Arc */}
                            <path
                                d="M 20 90 A 80 80 0 0 1 180 90"
                                fill="none"
                                stroke="rgba(148, 163, 184, 0.1)"
                                strokeWidth="20"
                                strokeLinecap="round"
                            />
                            
                            {/* Gradient Definition */}
                            <defs>
                                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10B981" />
                                    <stop offset="50%" stopColor="#F59E0B" />
                                    <stop offset="100%" stopColor="#EF4444" />
                                </linearGradient>
                                
                                {/* Glow Filter */}
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                    <feMerge>
                                        <feMergeNode in="coloredBlur"/>
                                        <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                </filter>
                            </defs>
                            
                            {/* Colored Arc (Animated) */}
                            <path
                                d="M 20 90 A 80 80 0 0 1 180 90"
                                fill="none"
                                stroke="url(#gaugeGradient)"
                                strokeWidth="20"
                                strokeLinecap="round"
                                strokeDasharray={`${(gaugePercentage / 100) * 251.2} 251.2`}
                                filter="url(#glow)"
                                style={{
                                    transition: 'stroke-dasharray 1.5s ease-out',
                                }}
                            />
                            
                            {/* Center Dot */}
                            <circle cx="100" cy="90" r="6" fill={gaugeColors.primary} opacity="0.8" />
                            
                            {/* Needle */}
                            <g style={{ transform: `rotate(${gaugeRotation}deg)`, transformOrigin: '100px 90px', transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                                <line
                                    x1="100"
                                    y1="90"
                                    x2="100"
                                    y2="25"
                                    stroke={gaugeColors.primary}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    filter="url(#glow)"
                                />
                                <circle cx="100" cy="90" r="8" fill={gaugeColors.primary} />
                                <circle cx="100" cy="90" r="4" fill="#fff" />
                            </g>
                            
                            {/* Score Labels */}
                            <text x="20" y="95" fill="#94A3B8" fontSize="10" textAnchor="middle">0</text>
                            <text x="100" y="15" fill="#94A3B8" fontSize="10" textAnchor="middle">50</text>
                            <text x="180" y="95" fill="#94A3B8" fontSize="10" textAnchor="middle">100</text>
                        </svg>
                    </div>
                    
                    <div className="text-center mt-2">
                        <div className="text-5xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                            {riskScore}
                        </div>
                        <div className="text-sm text-slate-400 font-medium tracking-wide">RISK SCORE</div>
                        <div className={`inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider`}
                             style={{ 
                                 backgroundColor: `${gaugeColors.primary}20`, 
                                 color: gaugeColors.primary,
                                 border: `1px solid ${gaugeColors.primary}40`
                             }}>
                            {riskScore <= 30 ? 'Excellent' : riskScore <= 60 ? 'Moderate' : 'Critical'}
                        </div>
                    </div>
                </div>

                {/* Risk Factors with Modern Cards */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <FaChartPie className="text-purple-400 text-xl" />
                        </div>
                        <h4 className="text-white font-bold text-lg">Risk Factors</h4>
                    </div>
                    
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        {riskFactors.length > 0 ? (
                            riskFactors.map((factor, index) => (
                                <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-slate-700/40 to-slate-800/40 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 hover:border-slate-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{factor.factor}</span>
                                        <div 
                                            className="relative px-3 py-1.5 rounded-lg text-xs font-black border-2 shadow-lg"
                                            style={{ 
                                                backgroundColor: factor.score < 30 ? '#10B98110' : factor.score < 60 ? '#F59E0B10' : '#EF444410',
                                                color: factor.score < 30 ? '#10B981' : factor.score < 60 ? '#F59E0B' : '#EF4444',
                                                borderColor: factor.score < 30 ? '#10B98140' : factor.score < 60 ? '#F59E0B40' : '#EF444440',
                                                boxShadow: `0 0 20px ${factor.score < 30 ? '#10B98120' : factor.score < 60 ? '#F59E0B20' : '#EF444420'}`
                                            }}
                                        >
                                            {factor.score}%
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="mb-2 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ 
                                                width: `${factor.score}%`,
                                                backgroundColor: factor.score < 30 ? '#10B981' : factor.score < 60 ? '#F59E0B' : '#EF4444',
                                                boxShadow: `0 0 10px ${factor.score < 30 ? '#10B98180' : factor.score < 60 ? '#F59E0B80' : '#EF444480'}`
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{factor.description}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <FaCheckCircle className="text-green-400 text-2xl" />
                                </div>
                                <p className="text-slate-400 text-sm font-medium">No risk factors identified</p>
                                <p className="text-slate-500 text-xs mt-1">This refactoring appears safe</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modern Analysis Explanation */}
            {explanation && (
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-6 shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center shadow-lg">
                                <FaShieldAlt className="text-indigo-300 text-xl" />
                            </div>
                            <h4 className="text-white font-bold text-lg">Analysis Explanation</h4>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed pl-[52px]">{explanation}</p>
                    </div>
                </div>
            )}

            {/* Risk Factors Detailed */}
            {riskFactors.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FaExclamationTriangle className="text-yellow-400" />
                        <h4 className="text-white font-semibold">Risk Factors</h4>
                    </div>
                    
                    <div className="space-y-3">
                        {riskFactors.map((factor, index) => (
                            <div key={index} className="flex items-start gap-3 bg-slate-700/30 rounded-lg p-4">
                                <div 
                                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold"
                                    style={{ 
                                        backgroundColor: factor.score < 30 ? '#10B98120' : factor.score < 60 ? '#F59E0B20' : '#EF444420',
                                        color: factor.score < 30 ? '#10B981' : factor.score < 60 ? '#F59E0B' : '#EF4444'
                                    }}
                                >
                                    {factor.score}%
                                </div>
                                <div className="flex-1">
                                    <h5 className="text-white font-medium mb-1">{factor.factor}</h5>
                                    <p className="text-slate-400 text-sm">{factor.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modern Suggestions */}
            {suggestions.length > 0 && (
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center shadow-lg">
                            <FaLightbulb className="text-yellow-400 text-xl" />
                        </div>
                        <h4 className="text-white font-bold text-lg">Recommendations</h4>
                    </div>
                    
                    <div className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="group flex items-start gap-4 bg-gradient-to-r from-slate-700/30 to-slate-800/20 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 text-yellow-400 rounded-lg flex items-center justify-center text-sm font-black shadow-lg group-hover:scale-110 transition-transform">
                                    {index + 1}
                                </div>
                                <span className="flex-1 text-slate-200 text-sm leading-relaxed pt-1">{suggestion}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modern Recommendation Banner */}
            {recommendation && (
                <div className="relative overflow-hidden bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-teal-500/20 backdrop-blur-sm border-2 border-green-500/30 rounded-2xl p-6 shadow-2xl shadow-green-500/20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400/10 to-transparent rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-xl shadow-green-500/30">
                            <FaCheckCircle className="text-white text-2xl" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-lg mb-2">Final Recommendation</h4>
                            <p className="text-green-50 text-sm leading-relaxed">{recommendation}</p>
                        </div>
                        {riskScore <= 30 && (
                            <button className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105">
                                ✓ SAFE TO APPLY
                            </button>
                        )}
                        {riskScore > 70 && (
                            <button className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/30 cursor-not-allowed opacity-75">
                                ⚠ HIGH RISK
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Modern Potential Issues */}
            {potentialIssues.length > 0 && (
                <details className="group bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:border-orange-500/30 transition-all">
                    <summary className="px-6 py-5 cursor-pointer text-white font-bold text-lg hover:bg-slate-700/30 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                                <FaExclamationTriangle className="text-orange-400 text-xl" />
                            </div>
                            <span>Potential Issues</span>
                            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-bold border border-orange-500/30">
                                {potentialIssues.length}
                            </span>
                        </div>
                        <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </summary>
                    <div className="px-6 pb-6">
                        <div className="space-y-3 pt-2">
                            {potentialIssues.map((issue, index) => (
                                <div key={index} className="flex items-start gap-3 bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-xl p-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center text-lg font-bold">
                                        ⚠
                                    </div>
                                    <span className="text-slate-200 text-sm leading-relaxed pt-1">{issue}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </details>
            )}

            {/* Modern Side Effects */}
            {sideEffects.length > 0 && (
                <details className="group bg-gradient-to-br from-slate-800/60 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:border-purple-500/30 transition-all">
                    <summary className="px-6 py-5 cursor-pointer text-white font-bold text-lg hover:bg-slate-700/30 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                                <FaShieldAlt className="text-purple-400 text-xl" />
                            </div>
                            <span>Side Effects</span>
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold border border-purple-500/30">
                                {sideEffects.length}
                            </span>
                        </div>
                        <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </summary>
                    <div className="px-6 pb-6">
                        <div className="space-y-3 pt-2">
                            {sideEffects.map((effect, index) => (
                                <div key={index} className="flex items-start gap-3 bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center text-lg font-bold">
                                        ℹ
                                    </div>
                                    <span className="text-slate-200 text-sm leading-relaxed pt-1">{effect}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </details>
            )}
        </div>
    );
};

export default RiskAnalysisView;
