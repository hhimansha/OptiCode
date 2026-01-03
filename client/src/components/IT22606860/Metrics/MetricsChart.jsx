import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const MetricsChart = ({ metrics }) => {
    // Normalize metrics to 0-100 scale
    const normalizeComplexity = (complexity) => {
        // Lower is better, so invert: 20+ complexity = 0, 1 complexity = 100
        return Math.max(0, Math.min(100, 100 - (complexity * 5)));
    };

    const normalizeLOC = (loc) => {
        // Smaller is better for simple functions
        // Assuming 50 LOC is ideal, anything more reduces score
        return Math.max(0, Math.min(100, (50 / (loc || 50)) * 100));
    };

    const data = {
        labels: [
            'Maintainability',
            'Low Complexity',
            'Code Conciseness',
            'Documentation',
            'Overall Quality'
        ],
        datasets: [
            {
                label: 'Code Quality Metrics',
                data: [
                    metrics.maintainability_index || 0,
                    normalizeComplexity(metrics.complexity?.average || 0),
                    normalizeLOC(metrics.loc || 0),
                    ((metrics.comments || 0) / (metrics.loc || 1)) * 100,
                    ((metrics.maintainability_index || 0) + normalizeComplexity(metrics.complexity?.average || 0)) / 2
                ],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                pointLabels: {
                    color: '#fff',
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    color: '#9ca3af',
                    backdropColor: 'transparent'
                },
                suggestedMin: 0,
                suggestedMax: 100
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#fff'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + context.parsed.r.toFixed(1);
                    }
                }
            }
        }
    };

    return (
        <div className="card">
            <h3 className="text-xl font-bold text-white mb-4">Quality Radar Chart</h3>
            <div className="max-w-lg mx-auto">
                <Radar data={data} options={options} />
            </div>
        </div>
    );
};

export default MetricsChart;