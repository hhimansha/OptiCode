import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaChartLine, FaShieldAlt, FaCode, FaTrophy, FaHistory, FaArrowLeft,
    FaBolt, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaBug,
    FaLightbulb, FaMedal, FaStar, FaRocket, FaChartBar, FaChartPie,
    FaChartArea, FaCogs, FaRegClock, FaArrowUp, FaArrowDown, FaLayerGroup
} from 'react-icons/fa';
import {
    getDashboardOverview,
    getEvolutionTimeline,
    getPerformanceAnalytics,
    getRiskSecurityAnalytics,
    getBestPracticeCompliance,
    getTechnicalDebtTracker,
    getDeveloperGrowth
} from '../../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

// ============================================
// Sub Components
// ============================================

const StatCard = ({ icon: Icon, label, value, subtitle, color = 'blue', trend }) => (
    <div className={`bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:border-${color}-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/10 group`}>
        <div className="flex items-start justify-between mb-3">
            <div className={`p-3 bg-gradient-to-br from-${color}-500/20 to-${color}-600/10 rounded-xl border border-${color}-500/20 group-hover:border-${color}-500/40 transition-all`}>
                <Icon className={`text-${color}-400 text-xl`} />
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm font-medium text-slate-300">{label}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, color = 'blue' }) => (
    <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl shadow-lg shadow-${color}-500/30`}>
            <Icon className="text-white text-xl" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
        </div>
    </div>
);

const GrowthMeter = ({ score, level }) => {
    const getColor = () => {
        if (score >= 80) return { ring: 'text-green-500', bg: 'from-green-500/20', label: 'text-green-400' };
        if (score >= 60) return { ring: 'text-blue-500', bg: 'from-blue-500/20', label: 'text-blue-400' };
        if (score >= 40) return { ring: 'text-yellow-500', bg: 'from-yellow-500/20', label: 'text-yellow-400' };
        if (score >= 20) return { ring: 'text-orange-500', bg: 'from-orange-500/20', label: 'text-orange-400' };
        return { ring: 'text-red-500', bg: 'from-red-500/20', label: 'text-red-400' };
    };
    const colors = getColor();
    const circumference = 2 * Math.PI * 60;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="60" fill="none" stroke="#1e293b" strokeWidth="12" />
                    <circle cx="70" cy="70" r="60" fill="none"
                        className={colors.ring}
                        stroke="currentColor" strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{score}</span>
                    <span className="text-xs text-slate-400 font-medium">/ 100</span>
                </div>
            </div>
            <div className={`mt-3 px-4 py-1.5 rounded-full bg-gradient-to-r ${colors.bg} to-transparent border border-slate-700/50`}>
                <span className={`text-sm font-bold ${colors.label}`}>{level}</span>
            </div>
        </div>
    );
};

// ============================================
// Main Dashboard Component
// ============================================
const RefactorDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data states
    const [overview, setOverview] = useState(null);
    const [timeline, setTimeline] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [riskSecurity, setRiskSecurity] = useState(null);
    const [bestPractices, setBestPractices] = useState(null);
    const [technicalDebt, setTechnicalDebt] = useState(null);
    const [growth, setGrowth] = useState(null);

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [overviewRes, timelineRes, perfRes, riskRes, bpRes, debtRes, growthRes] = await Promise.allSettled([
                getDashboardOverview(),
                getEvolutionTimeline(90),
                getPerformanceAnalytics(),
                getRiskSecurityAnalytics(),
                getBestPracticeCompliance(),
                getTechnicalDebtTracker(),
                getDeveloperGrowth()
            ]);

            if (overviewRes.status === 'fulfilled' && overviewRes.value.success) {
                console.log('[DASHBOARD] Overview Risk Distribution:', overviewRes.value.overview.riskDistribution);
                setOverview(overviewRes.value.overview);
            }
            if (timelineRes.status === 'fulfilled' && timelineRes.value.success) {
                console.log('[DASHBOARD] Timeline Daily Trends:', timelineRes.value.dailyTrends);
                setTimeline(timelineRes.value);
            }
            if (perfRes.status === 'fulfilled' && perfRes.value.success) setPerformance(perfRes.value.performance);
            if (riskRes.status === 'fulfilled' && riskRes.value.success) setRiskSecurity(riskRes.value.riskSecurity);
            if (bpRes.status === 'fulfilled' && bpRes.value.success) setBestPractices(bpRes.value.bestPractices);
            if (debtRes.status === 'fulfilled' && debtRes.value.success) setTechnicalDebt(debtRes.value.technicalDebt);
            if (growthRes.status === 'fulfilled' && growthRes.value.success) setGrowth(growthRes.value.growth);

            // Check if all failed (likely auth issue)
            const allFailed = [overviewRes, timelineRes, perfRes, riskRes, bpRes, debtRes, growthRes]
                .every(r => r.status === 'rejected');
            if (allFailed) {
                setError('Unable to load dashboard data. Please make sure you are logged in.');
            }
        } catch (err) {
            console.error('Dashboard load error:', err);
            setError('Failed to load dashboard data. Please log in first.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Chart common options
    const chartColors = {
        blue: { border: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.15)' },
        cyan: { border: 'rgb(6, 182, 212)', bg: 'rgba(6, 182, 212, 0.15)' },
        green: { border: 'rgb(34, 197, 94)', bg: 'rgba(34, 197, 94, 0.15)' },
        purple: { border: 'rgb(168, 85, 247)', bg: 'rgba(168, 85, 247, 0.15)' },
        red: { border: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.15)' },
        amber: { border: 'rgb(245, 158, 11)', bg: 'rgba(245, 158, 11, 0.15)' },
        pink: { border: 'rgb(236, 72, 153)', bg: 'rgba(236, 72, 153, 0.15)' },
    };

    const darkChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { labels: { color: '#94a3b8', font: { size: 12 } } },
        },
        scales: {
            x: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#64748b', font: { size: 11 } } },
            y: { grid: { color: 'rgba(148,163,184,0.08)' }, ticks: { color: '#64748b', font: { size: 11 } }, beginAtZero: true }
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FaChartBar },
        { id: 'timeline', label: 'Evolution', icon: FaChartLine },
        { id: 'performance', label: 'Performance', icon: FaBolt },
        { id: 'security', label: 'Security', icon: FaShieldAlt },
        { id: 'practices', label: 'Best Practices', icon: FaCheckCircle },
        { id: 'debt', label: 'Tech Debt', icon: FaCogs },
        { id: 'growth', label: 'Growth', icon: FaTrophy },
    ];

    // ============================================
    // RENDER FUNCTIONS
    // ============================================

    const renderOverview = () => {
        if (!overview) return <EmptyState message="No overview data available yet. Start refactoring to see your analytics!" />;

        return (
            <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={FaCode} label="Total Refactors" value={overview.totalRefactors} color="blue" />
                    <StatCard icon={FaStar} label="Avg Quality Score" value={overview.avgRefactorScore} color="cyan" />
                    <StatCard icon={FaLayerGroup} label="Avg Maintainability" value={overview.avgMaintainabilityScore} color="green" />
                    <StatCard icon={FaBolt} label="Performance Gain" value={`${overview.avgPerformanceImprovement}%`} color="purple" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={FaCogs} label="Tech Debt Reduced" value={`${overview.technicalDebtReduction}%`} color="amber" />
                    <StatCard icon={FaRegClock} label="Avg Processing" value={`${(overview.avgProcessingTime / 1000).toFixed(1)}s`} color="pink" />
                    <StatCard icon={FaRocket} label="Most Used Lang" value={overview.mostUsedLanguage} color="blue" />
                    <StatCard icon={FaStar} label="Avg Rating" value={overview.avgRating || 'N/A'} color="amber" />
                </div>

                {/* Risk Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaChartPie className="text-purple-400" /> Risk Level Distribution
                        </h3>
                        {overview.riskDistribution ? (
                            (overview.riskDistribution.low + overview.riskDistribution.medium + overview.riskDistribution.high > 0) ? (
                                <Doughnut
                                    data={{
                                        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                                        datasets: [{
                                            data: [overview.riskDistribution.low || 0, overview.riskDistribution.medium || 0, overview.riskDistribution.high || 0],
                                            backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)'],
                                            borderColor: ['rgb(34, 197, 94)', 'rgb(245, 158, 11)', 'rgb(239, 68, 68)'],
                                            borderWidth: 2
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 15 } }
                                        }
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-center">
                                    <FaExclamationTriangle className="text-slate-600 text-4xl mb-3" />
                                    <p className="text-slate-400 text-sm">No risk analysis data available</p>
                                    <p className="text-slate-500 text-xs mt-2">Click "Analyze Risk" on your refactored code to see risk distribution</p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-center">
                                <FaExclamationTriangle className="text-slate-600 text-4xl mb-3" />
                                <p className="text-slate-400 text-sm">No risk analysis data available</p>
                                <p className="text-slate-500 text-xs mt-2">Click "Analyze Risk" on your refactored code to see risk distribution</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaChartBar className="text-blue-400" /> Language Distribution
                        </h3>
                        {overview.languageStats && overview.languageStats.length > 0 && (
                            <Bar
                                data={{
                                    labels: overview.languageStats.map(l => l._id),
                                    datasets: [{
                                        label: 'Refactors',
                                        data: overview.languageStats.map(l => l.count),
                                        backgroundColor: chartColors.blue.bg,
                                        borderColor: chartColors.blue.border,
                                        borderWidth: 2,
                                        borderRadius: 8
                                    }]
                                }}
                                options={darkChartOptions}
                            />
                        )}
                    </div>
                </div>

                {/* Model Performance */}
                {overview.modelStats && overview.modelStats.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaCogs className="text-cyan-400" /> Model Performance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {overview.modelStats.map((stat, i) => (
                                <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                                    <p className="text-lg font-bold text-white capitalize">{stat._id}</p>
                                    <p className="text-sm text-slate-400">{stat.count} uses</p>
                                    <p className="text-sm text-amber-400">{stat.avgRating ? `${stat.avgRating.toFixed(1)} ★` : 'No ratings'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderTimeline = () => {
        if (!timeline || !timeline.dailyTrends || timeline.dailyTrends.length === 0)
            return <EmptyState message="No timeline data yet. Complete more refactoring sessions to see your evolution!" />;

        return (
            <div className="space-y-8">
                {/* Score Trend */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FaChartLine className="text-blue-400" /> Refactor Quality Score Over Time
                    </h3>
                    <Line
                        data={{
                            labels: timeline.dailyTrends.map(t => t._id),
                            datasets: [
                                {
                                    label: 'Avg Quality Score',
                                    data: timeline.dailyTrends.map(t => t.avgScore || 0),
                                    borderColor: chartColors.blue.border,
                                    backgroundColor: chartColors.blue.bg,
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 4,
                                    pointBackgroundColor: chartColors.blue.border,
                                },
                                {
                                    label: 'Avg Maintainability',
                                    data: timeline.dailyTrends.map(t => t.avgMaintainability || 0),
                                    borderColor: chartColors.green.border,
                                    backgroundColor: chartColors.green.bg,
                                    fill: true,
                                    tension: 0.4,
                                    pointRadius: 4,
                                    pointBackgroundColor: chartColors.green.border,
                                }
                            ]
                        }}
                        options={{
                            ...darkChartOptions,
                            plugins: {
                                ...darkChartOptions.plugins,
                                title: { display: true, text: 'Quality Evolution (Last 90 Days)', color: '#e2e8f0', font: { size: 14 } }
                            }
                        }}
                    />
                </div>

                {/* Risk Reduction Trend */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FaChartArea className="text-green-400" /> Risk Reduction Trend
                    </h3>
                    {timeline.dailyTrends && timeline.dailyTrends.some(t => t.avgRiskReduction !== undefined && t.avgRiskReduction !== 0) ? (
                        <Bar
                            data={{
                                labels: timeline.dailyTrends.map(t => t._id),
                                datasets: [{
                                    label: 'Risk Reduction',
                                    data: timeline.dailyTrends.map(t => t.avgRiskReduction || 0),
                                    backgroundColor: timeline.dailyTrends.map(t =>
                                        (t.avgRiskReduction || 0) >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
                                    ),
                                    borderColor: timeline.dailyTrends.map(t =>
                                        (t.avgRiskReduction || 0) >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                                    ),
                                    borderWidth: 2,
                                    borderRadius: 6
                                }]
                            }}
                            options={darkChartOptions}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <FaExclamationTriangle className="text-slate-600 text-4xl mb-3" />
                            <p className="text-slate-400 text-sm">No risk reduction data tracked</p>
                            <p className="text-slate-500 text-xs mt-2">Click "Analyze Risk" on refactored code to track risk reduction over time</p>
                        </div>
                    )}
                </div>

                {/* Session Count */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FaHistory className="text-purple-400" /> Daily Refactor Activity
                    </h3>
                    <Bar
                        data={{
                            labels: timeline.dailyTrends.map(t => t._id),
                            datasets: [{
                                label: 'Sessions',
                                data: timeline.dailyTrends.map(t => t.count),
                                backgroundColor: chartColors.purple.bg,
                                borderColor: chartColors.purple.border,
                                borderWidth: 2,
                                borderRadius: 8
                            }]
                        }}
                        options={darkChartOptions}
                    />
                </div>
            </div>
        );
    };

    const renderPerformance = () => {
        if (!performance || !performance.data || performance.data.length === 0)
            return <EmptyState message="No performance data available yet. Refactor code to generate performance analytics!" />;

        const s = performance.summary || {};

        return (
            <div className="space-y-8">
                {/* Performance Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={FaBolt} label="Avg Complexity Reduction" value={`${(s.avgComplexityReduction || 0).toFixed(1)}%`} color="blue" />
                    <StatCard icon={FaCode} label="Avg LOC Reduction" value={`${(s.avgLocReduction || 0).toFixed(1)}%`} color="cyan" />
                    <StatCard icon={FaLayerGroup} label="Avg Maintainability" value={(s.avgMaintainabilityAfter || 0).toFixed(1)} color="green" />
                    <StatCard icon={FaStar} label="Avg Quality Score" value={(s.avgOverallScore || 0).toFixed(1)} color="purple" />
                </div>

                {/* Complexity Trend */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FaChartLine className="text-blue-400" /> Cyclomatic Complexity Trend
                    </h3>
                    <Line
                        data={{
                            labels: performance.data.map((_, i) => `Session ${i + 1}`),
                            datasets: [
                                {
                                    label: 'Before',
                                    data: performance.data.map(d => d.complexityBefore || 0),
                                    borderColor: chartColors.red.border,
                                    backgroundColor: chartColors.red.bg,
                                    tension: 0.4,
                                    fill: true
                                },
                                {
                                    label: 'After',
                                    data: performance.data.map(d => d.complexityAfter || 0),
                                    borderColor: chartColors.green.border,
                                    backgroundColor: chartColors.green.bg,
                                    tension: 0.4,
                                    fill: true
                                }
                            ]
                        }}
                        options={darkChartOptions}
                    />
                </div>

                {/* Radar Chart - Quality Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaChartPie className="text-purple-400" /> Quality Dimensions (Latest Avg)
                        </h3>
                        <Radar
                            data={{
                                labels: ['Complexity', 'Maintainability', 'LOC Efficiency', 'Quality Score', 'Risk Reduction'],
                                datasets: [{
                                    label: 'Your Performance',
                                    data: [
                                        Math.min(100, Math.max(0, (s.avgComplexityReduction || 0))),
                                        Math.min(100, (s.avgMaintainabilityAfter || 0)),
                                        Math.min(100, Math.max(0, (s.avgLocReduction || 0))),
                                        Math.min(100, (s.avgOverallScore || 0)),
                                        Math.min(100, Math.max(0, ((s.avgComplexityReduction || 0) + (s.avgMaintainabilityImprovement || 0)) / 2))
                                    ],
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    borderColor: 'rgb(59, 130, 246)',
                                    borderWidth: 2,
                                    pointBackgroundColor: 'rgb(59, 130, 246)'
                                }]
                            }}
                            options={{
                                responsive: true,
                                scales: {
                                    r: {
                                        angleLines: { color: 'rgba(148,163,184,0.1)' },
                                        grid: { color: 'rgba(148,163,184,0.1)' },
                                        pointLabels: { color: '#94a3b8', font: { size: 11 } },
                                        ticks: { display: false },
                                        suggestedMin: 0,
                                        suggestedMax: 100
                                    }
                                },
                                plugins: { legend: { labels: { color: '#94a3b8' } } }
                            }}
                        />
                    </div>

                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaChartBar className="text-cyan-400" /> Optimization Score Per Session
                        </h3>
                        <Bar
                            data={{
                                labels: performance.data.map((_, i) => `#${i + 1}`),
                                datasets: [{
                                    label: 'Overall Score',
                                    data: performance.data.map(d => d.overallScore || 0),
                                    backgroundColor: performance.data.map(d =>
                                        (d.overallScore || 0) >= 50 ? 'rgba(34, 197, 94, 0.6)' :
                                            (d.overallScore || 0) >= 20 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(239, 68, 68, 0.6)'
                                    ),
                                    borderRadius: 6,
                                    borderWidth: 1,
                                    borderColor: performance.data.map(d =>
                                        (d.overallScore || 0) >= 50 ? 'rgb(34, 197, 94)' :
                                            (d.overallScore || 0) >= 20 ? 'rgb(245, 158, 11)' : 'rgb(239, 68, 68)'
                                    )
                                }]
                            }}
                            options={darkChartOptions}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderSecurity = () => {
        if (!riskSecurity)
            return <EmptyState message="No security data available. Run risk analysis on your refactored code to see insights!" />;

        const s = riskSecurity.summary || {};
        const sd = riskSecurity.severityDistribution || {};

        return (
            <div className="space-y-8">
                {/* Risk Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={FaExclamationTriangle} label="High-Risk Refactors" value={s.totalHighRisk || 0} color="red" />
                    <StatCard icon={FaBug} label="Total Risks Found" value={s.totalRisksFound || 0} color="amber" />
                    <StatCard icon={FaCheckCircle} label="Risks Fixed" value={s.totalRisksFixed || 0} color="green" />
                    <StatCard icon={FaShieldAlt} label="Avg Risk Reduction" value={`${(s.avgRiskReduction || 0).toFixed(1)}`} color="blue" />
                </div>

                {/* Security Issues Cards */}
                {s.totalSecurityIssues > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <StatCard icon={FaShieldAlt} label="Security Issues" value={s.totalSecurityIssues || 0} color="red" />
                        <StatCard icon={FaCheckCircle} label="Issues Fixed" value={s.securityIssuesFixed || 0} color="green" />
                        <StatCard icon={FaChartBar} label="Fix Rate" value={`${s.totalSecurityIssues > 0 ? ((s.securityIssuesFixed / s.totalSecurityIssues) * 100).toFixed(0) : 0}%`} color="blue" />
                    </div>
                )}

                {/* Severity Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaChartPie className="text-red-400" /> Severity Distribution
                        </h3>
                        <Doughnut
                            data={{
                                labels: ['Critical', 'High', 'Medium', 'Low'],
                                datasets: [{
                                    data: [sd.totalCritical || 0, sd.totalHigh || 0, sd.totalMedium || 0, sd.totalLow || 0],
                                    backgroundColor: [
                                        'rgba(220, 38, 38, 0.7)', 'rgba(239, 68, 68, 0.7)',
                                        'rgba(245, 158, 11, 0.7)', 'rgba(34, 197, 94, 0.7)'
                                    ],
                                    borderColor: ['rgb(220, 38, 38)', 'rgb(239, 68, 68)', 'rgb(245, 158, 11)', 'rgb(34, 197, 94)'],
                                    borderWidth: 2
                                }]
                            }}
                            options={{
                                responsive: true,
                                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 15 } } }
                            }}
                        />
                    </div>

                    {/* Risk Heatmap */}
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaShieldAlt className="text-purple-400" /> Risk Score Trend
                        </h3>
                        {riskSecurity.trends && riskSecurity.trends.length > 0 ? (
                            <Line
                                data={{
                                    labels: riskSecurity.trends.map(t => t.date),
                                    datasets: [
                                        {
                                            label: 'Risk Before',
                                            data: riskSecurity.trends.map(t => t.riskBefore?.riskScore || 0),
                                            borderColor: chartColors.red.border,
                                            backgroundColor: chartColors.red.bg,
                                            fill: true,
                                            tension: 0.4
                                        },
                                        {
                                            label: 'Risk After',
                                            data: riskSecurity.trends.map(t => t.riskAfter?.riskScore || 0),
                                            borderColor: chartColors.green.border,
                                            backgroundColor: chartColors.green.bg,
                                            fill: true,
                                            tension: 0.4
                                        }
                                    ]
                                }}
                                options={darkChartOptions}
                            />
                        ) : (
                            <p className="text-slate-400 text-center py-8">No risk trend data available</p>
                        )}
                    </div>
                </div>

                {/* Security Issues by Category */}
                {riskSecurity.securityByCategory && riskSecurity.securityByCategory.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaBug className="text-red-400" /> Security Issues by Category
                        </h3>
                        <Bar
                            data={{
                                labels: riskSecurity.securityByCategory.map(c => c._id || 'Unknown'),
                                datasets: [
                                    {
                                        label: 'Critical',
                                        data: riskSecurity.securityByCategory.map(c => c.criticalCount || 0),
                                        backgroundColor: 'rgba(220, 38, 38, 0.7)',
                                        borderColor: 'rgb(220, 38, 38)',
                                        borderWidth: 2
                                    },
                                    {
                                        label: 'High',
                                        data: riskSecurity.securityByCategory.map(c => c.highCount || 0),
                                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                                        borderColor: 'rgb(239, 68, 68)',
                                        borderWidth: 2
                                    },
                                    {
                                        label: 'All Issues',
                                        data: riskSecurity.securityByCategory.map(c => c.count || 0),
                                        backgroundColor: 'rgba(245, 158, 11, 0.5)',
                                        borderColor: 'rgb(245, 158, 11)',
                                        borderWidth: 1
                                    }
                                ]
                            }}
                            options={{
                                ...darkChartOptions,
                                scales: {
                                    ...darkChartOptions.scales,
                                    x: {
                                        ...darkChartOptions.scales.x,
                                        stacked: false
                                    },
                                    y: {
                                        ...darkChartOptions.scales.y,
                                        stacked: false
                                    }
                                }
                            }}
                        />
                    </div>
                )}

                {/* Recent Security Issues */}
                {riskSecurity.recentSecurityIssues && riskSecurity.recentSecurityIssues.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaBug className="text-amber-400" /> Recent Security Issues
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {riskSecurity.recentSecurityIssues.map((issue, idx) => (
                                <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <FaBug className={`${
                                                issue.severity === 'critical' ? 'text-red-600' :
                                                issue.severity === 'high' ? 'text-red-400' :
                                                issue.severity === 'medium' ? 'text-amber-400' :
                                                'text-green-400'
                                            }`} />
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                issue.severity === 'critical' ? 'bg-red-600/20 text-red-300' :
                                                issue.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                                                issue.severity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                                                'bg-green-500/20 text-green-300'
                                            }`}>
                                                {issue.severity?.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-slate-500">Line {issue.line}</span>
                                        </div>
                                        {issue.fixed && (
                                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                                <FaCheckCircle className="inline mr-1" />
                                                Fixed
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-white font-medium mb-1">{issue.message}</p>
                                    <p className="text-xs text-slate-400 mb-2">{issue.explanation}</p>
                                    <div className="text-xs text-slate-500 bg-slate-900/50 p-2 rounded font-mono">
                                        {issue.code}
                                    </div>
                                    <p className="text-xs text-blue-400 mt-2">
                                        <FaLightbulb className="inline mr-1" />
                                        {issue.fixSuggestion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderBestPractices = () => {
        if (!bestPractices)
            return <EmptyState message="No best practice data available. Analyze your code to track compliance!" />;

        return (
            <div className="space-y-8">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard icon={FaCheckCircle} label="Total Violations" value={bestPractices.totalViolations || 0} color="amber" />
                    <StatCard icon={FaCheckCircle} label="Applied Fixes" value={bestPractices.totalApplied || 0} color="green" />
                    <StatCard icon={FaChartLine} label="Fix Rate" value={`${bestPractices.totalViolations > 0 ? ((bestPractices.totalApplied / bestPractices.totalViolations) * 100).toFixed(0) : 0}%`} color="blue" />
                </div>

                {/* Category Breakdown */}
                {bestPractices.byCategory && bestPractices.byCategory.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaChartBar className="text-blue-400" /> Violations by Category
                        </h3>
                        <Bar
                            data={{
                                labels: bestPractices.byCategory.map(c => c._id),
                                datasets: [
                                    {
                                        label: 'Total',
                                        data: bestPractices.byCategory.map(c => c.total),
                                        backgroundColor: chartColors.red.bg,
                                        borderColor: chartColors.red.border,
                                        borderWidth: 2,
                                        borderRadius: 6
                                    },
                                    {
                                        label: 'Applied',
                                        data: bestPractices.byCategory.map(c => c.applied),
                                        backgroundColor: chartColors.green.bg,
                                        borderColor: chartColors.green.border,
                                        borderWidth: 2,
                                        borderRadius: 6
                                    }
                                ]
                            }}
                            options={darkChartOptions}
                        />
                    </div>
                )}

                {/* Severity Breakdown */}
                {bestPractices.bySeverity && bestPractices.bySeverity.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Violations by Severity</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {bestPractices.bySeverity.map((s, i) => (
                                <div key={i} className={`p-4 rounded-xl border ${s._id === 'error' ? 'border-red-500/30 bg-red-500/10' :
                                        s._id === 'warning' ? 'border-amber-500/30 bg-amber-500/10' :
                                            'border-blue-500/30 bg-blue-500/10'
                                    }`}>
                                    <p className="text-2xl font-bold text-white">{s.count}</p>
                                    <p className={`text-sm font-medium capitalize ${s._id === 'error' ? 'text-red-400' :
                                            s._id === 'warning' ? 'text-amber-400' : 'text-blue-400'
                                        }`}>{s._id}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderTechDebt = () => {
        if (!technicalDebt || !technicalDebt.trend || technicalDebt.trend.length === 0)
            return <EmptyState message="No technical debt data available. Keep refactoring to track your debt reduction!" />;

        const s = technicalDebt.summary || {};

        return (
            <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard icon={FaCogs} label="Debt Reduction %" value={`${(s.avgDebtReduction || 0).toFixed(1)}%`} color="green" />
                    <StatCard icon={FaLayerGroup} label="Maintainability Index" value={(s.avgMaintainabilityIndex || 0).toFixed(1)} color="blue" />
                    <StatCard icon={FaStar} label="Refactor Efficiency" value={(s.avgRefactorEfficiency || 0).toFixed(1)} color="purple" />
                </div>

                {/* Maintainability Trend */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FaChartArea className="text-green-400" /> Technical Debt Trend
                    </h3>
                    <Line
                        data={{
                            labels: technicalDebt.trend.map(t => t.date || ''),
                            datasets: [
                                {
                                    label: 'Maintainability Before',
                                    data: technicalDebt.trend.map(t => t.maintainabilityBefore || 0),
                                    borderColor: chartColors.red.border,
                                    backgroundColor: chartColors.red.bg,
                                    fill: true,
                                    tension: 0.4
                                },
                                {
                                    label: 'Maintainability After',
                                    data: technicalDebt.trend.map(t => t.maintainabilityAfter || 0),
                                    borderColor: chartColors.green.border,
                                    backgroundColor: chartColors.green.bg,
                                    fill: true,
                                    tension: 0.4
                                }
                            ]
                        }}
                        options={{
                            ...darkChartOptions,
                            plugins: {
                                ...darkChartOptions.plugins,
                                title: { display: true, text: 'Maintainability Index Over Time', color: '#e2e8f0', font: { size: 14 } }
                            }
                        }}
                    />
                </div>

                {/* Complexity Reduction */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Complexity Before vs After</h3>
                    <Bar
                        data={{
                            labels: technicalDebt.trend.map((_, i) => `Session ${i + 1}`),
                            datasets: [
                                {
                                    label: 'Complexity Before',
                                    data: technicalDebt.trend.map(t => t.complexityBefore || 0),
                                    backgroundColor: chartColors.red.bg,
                                    borderColor: chartColors.red.border,
                                    borderWidth: 2,
                                    borderRadius: 6
                                },
                                {
                                    label: 'Complexity After',
                                    data: technicalDebt.trend.map(t => t.complexityAfter || 0),
                                    backgroundColor: chartColors.green.bg,
                                    borderColor: chartColors.green.border,
                                    borderWidth: 2,
                                    borderRadius: 6
                                }
                            ]
                        }}
                        options={darkChartOptions}
                    />
                </div>
            </div>
        );
    };

    const renderGrowth = () => {
        if (!growth)
            return <EmptyState message="No growth data available. Start your refactoring journey to track your growth!" />;

        return (
            <div className="space-y-8">
                {/* Growth Score */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center">
                        <h3 className="text-lg font-bold text-white mb-6">Developer Growth Score</h3>
                        <GrowthMeter score={growth.score} level={growth.level} />
                        <p className="text-slate-400 text-sm mt-4">{growth.totalSessions} total sessions</p>
                    </div>

                    {/* Score Breakdown */}
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaChartBar className="text-blue-400" /> Score Breakdown
                        </h3>
                        {growth.scoreBreakdown && (
                            <div className="space-y-4">
                                {[
                                    { label: 'Improvement Trend', value: growth.scoreBreakdown.improvementTrend, max: 20, color: 'blue' },
                                    { label: 'Quality Score', value: growth.scoreBreakdown.qualityScore, max: 30, color: 'cyan' },
                                    { label: 'Risk Awareness', value: growth.scoreBreakdown.riskAwareness, max: 20, color: 'green' },
                                    { label: 'Maintainability', value: growth.scoreBreakdown.maintainability, max: 20, color: 'purple' },
                                    { label: 'Consistency', value: growth.scoreBreakdown.consistency, max: 10, color: 'amber' },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-300">{item.label}</span>
                                            <span className="text-slate-400">{item.value}/{item.max}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2.5">
                                            <div
                                                className={`bg-${item.color}-500 h-2.5 rounded-full transition-all duration-700`}
                                                style={{ width: `${(item.value / item.max) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Milestones */}
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaMedal className="text-amber-400" /> Milestones
                        </h3>
                        <div className="space-y-3">
                            {growth.milestones && growth.milestones.map((m, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${m.achieved
                                        ? 'border-green-500/30 bg-green-500/10'
                                        : 'border-slate-700/30 bg-slate-800/30 opacity-60'
                                    }`}>
                                    {m.achieved ? (
                                        <FaCheckCircle className="text-green-400 text-lg flex-shrink-0" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm font-medium ${m.achieved ? 'text-white' : 'text-slate-500'}`}>
                                        {m.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pattern Detection */}
                {growth.patterns && growth.patterns.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaExclamationTriangle className="text-amber-400" /> Pattern Detection
                        </h3>
                        <div className="space-y-3">
                            {growth.patterns.map((p, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <FaExclamationTriangle className="text-amber-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-300">{p.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Smart Recommendations */}
                {growth.recommendations && growth.recommendations.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaLightbulb className="text-cyan-400" /> Smart Recommendations
                        </h3>
                        <div className="space-y-3">
                            {growth.recommendations.map((r, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                                    <FaLightbulb className="text-cyan-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-300">{r}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ============================================
    // MAIN RENDER
    // ============================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-slate-300 text-lg font-medium">Loading your analytics dashboard...</p>
                    <p className="text-slate-500 text-sm mt-2">Analyzing your refactoring data</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Dashboard Unavailable</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-800/60 backdrop-blur-xl sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30">
                                <FaChartLine className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                                    Refactor Analytics
                                </h1>
                                <p className="text-slate-400 text-sm">AI-Powered Code Intelligence Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/history')}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 text-slate-200 rounded-xl hover:bg-slate-700 transition-all border border-slate-700/50 text-sm font-medium"
                            >
                                <FaHistory /> History
                            </button>
                            <button
                                onClick={() => navigate('/refactor')}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all text-sm font-medium shadow-lg shadow-blue-600/30"
                            >
                                <FaCode /> Refactor
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            <tab.icon className="text-sm" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'timeline' && renderTimeline()}
                    {activeTab === 'performance' && renderPerformance()}
                    {activeTab === 'security' && renderSecurity()}
                    {activeTab === 'practices' && renderBestPractices()}
                    {activeTab === 'debt' && renderTechDebt()}
                    {activeTab === 'growth' && renderGrowth()}
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/30">
            <FaChartLine className="text-slate-600 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">No Data Yet</h3>
        <p className="text-slate-400 text-center max-w-md">{message}</p>
    </div>
);

export default RefactorDashboard;
