import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ComparisonChart = ({ before, after }) => {
    const data = {
        labels: ['LOC', 'Complexity', 'Maintainability', 'Functions'],
        datasets: [
            {
                label: 'Before',
                data: [
                    before.loc || 0,
                    before.complexity?.average || 0,
                    before.maintainability_index || 0,
                    before.functions_count || 0
                ],
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1
            },
            {
                label: 'After',
                data: [
                    after.loc || 0,
                    after.complexity?.average || 0,
                    after.maintainability_index || 0,
                    after.functions_count || 0
                ],
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1
            }
        ]
    };

    const options = {
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
                    color: '#fff'
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
                text: 'Before vs After Comparison',
                color: '#fff',
                font: {
                    size: 16
                }
            }
        }
    };

    return (
        <div className="card">
            <Bar data={data} options={options} />
        </div>
    );
};

export default ComparisonChart;