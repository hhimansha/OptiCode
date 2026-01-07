import React, { useEffect, useState } from 'react';
import { getAnalyticsDashboard, getQualityTrends } from '../../../services/api';
import StatsCard from './StatsCard';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const AnalyticsDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const [dashboardData, trendsData] = await Promise.all([
                getAnalyticsDashboard(),
                getQualityTrends(30)
            ]);

            if (dashboardData.success) {
                setDashboard(dashboardData.dashboard);
            }

            if (trendsData.success) {
                setTrends(trendsData.trends);
            }
        } catch (error) {
            console.error('Analytics error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="text-white mt-4">Loading analytics...</p>
                </div>
            </div>
        );
    }

    // Prepare chart data
    const chartData = trends ? {
        labels: trends.map(t => t._id),
        datasets: [
            {
                label: 'Quality Improvement',
                data: trends.map(t => t.avgImprovement),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }
        ]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#9ca3af'
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#9ca3af'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#fff'
                }
            },
            title: {
                display: true,
                text: 'Quality Improvement Trend (Last 30 Days)',
                color: '#fff',
                font: {
                    size: 16
                }
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {dashboard && <StatsCard dashboard={dashboard} />}

            {/* Trends Chart */}
            {chartData && (
                <div className="card">
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}

            {/* Model Statistics */}
            {dashboard && dashboard.modelStats && dashboard.modelStats.length > 0 && (
                <div className="card">
                    <h3 className="text-xl font-bold text-white mb-4">Model Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left text-white font-semibold py-3 px-4">Model</th>
                                    <th className="text-center text-white font-semibold py-3 px-4">Usage Count</th>
                                    <th className="text-center text-white font-semibold py-3 px-4">Avg Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard.modelStats.map((stat, index) => (
                                    <tr key={index} className="border-b border-gray-700">
                                        <td className="text-gray-300 py-3 px-4 capitalize">{stat._id}</td>
                                        <td className="text-center text-white py-3 px-4">{stat.count}</td>
                                        <td className="text-center text-white py-3 px-4">
                                            {stat.avgRating ? stat.avgRating.toFixed(1) : 'N/A'} ⭐
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsDashboard;