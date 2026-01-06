/**
 * Distribution Chart Component
 * Student: IT22601360
 * 
 * Displays category distribution as bar/pie chart
 * Pure CSS/SVG implementation (no chart library dependency)
 */

import React, { useState } from 'react';
import './DistributionChart.css';

const DistributionChart = ({ data }) => {
    const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'

    if (!data || !data.data || data.data.length === 0) {
        return (
            <div className="distribution-chart-empty">
                <p>No distribution data available</p>
            </div>
        );
    }

    const chartData = data.data;
    const total = data.total || chartData.reduce((sum, d) => sum + d.count, 0);
    const maxCount = Math.max(...chartData.map(d => d.count));

    return (
        <div className="distribution-chart">
            {/* Chart Type Toggle */}
            <div className="chart-toggle">
                <button 
                    className={chartType === 'bar' ? 'active' : ''}
                    onClick={() => setChartType('bar')}
                >
                    📊 Bar
                </button>
                <button 
                    className={chartType === 'pie' ? 'active' : ''}
                    onClick={() => setChartType('pie')}
                >
                    🥧 Pie
                </button>
            </div>

            {/* Bar Chart */}
            {chartType === 'bar' && (
                <div className="bar-chart">
                    {chartData.map((item, index) => {
                        const percentage = (item.count / maxCount) * 100;
                        return (
                            <div key={index} className="bar-item">
                                <div className="bar-label">
                                    <span className="bar-name">{item.name}</span>
                                    <span className="bar-count">{item.count}</span>
                                </div>
                                <div className="bar-track">
                                    <div 
                                        className="bar-fill"
                                        style={{ 
                                            width: `${percentage}%`,
                                            backgroundColor: item.color || '#2196F3'
                                        }}
                                    />
                                </div>
                                <div className="bar-percentage">
                                    {Math.round((item.count / total) * 100)}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pie Chart */}
            {chartType === 'pie' && (
                <div className="pie-chart-container">
                    <svg viewBox="0 0 200 200" className="pie-chart">
                        <PieSlices data={chartData} total={total} />
                    </svg>
                    
                    {/* Pie Legend */}
                    <div className="pie-legend">
                        {chartData.map((item, index) => (
                            <div key={index} className="legend-item">
                                <span 
                                    className="legend-color"
                                    style={{ backgroundColor: item.color || '#666' }}
                                />
                                <span className="legend-name">{item.name}</span>
                                <span className="legend-value">
                                    {item.count} ({Math.round((item.count / total) * 100)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="chart-summary">
                <div className="summary-item">
                    <span className="summary-value">{total}</span>
                    <span className="summary-label">Total Concepts</span>
                </div>
                <div className="summary-item">
                    <span className="summary-value">{chartData.length}</span>
                    <span className="summary-label">Categories</span>
                </div>
                <div className="summary-item">
                    <span className="summary-value">
                        {chartData[0]?.name || 'N/A'}
                    </span>
                    <span className="summary-label">Top Category</span>
                </div>
            </div>
        </div>
    );
};

// Pie Slices Component
const PieSlices = ({ data, total }) => {
    const cx = 100;
    const cy = 100;
    const radius = 80;
    
    let currentAngle = -90; // Start from top
    
    return (
        <>
            {data.map((item, index) => {
                const percentage = item.count / total;
                const angle = percentage * 360;
                
                // Calculate arc path
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                
                const x1 = cx + radius * Math.cos(startRad);
                const y1 = cy + radius * Math.sin(startRad);
                const x2 = cx + radius * Math.cos(endRad);
                const y2 = cy + radius * Math.sin(endRad);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const pathData = [
                    `M ${cx} ${cy}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                ].join(' ');
                
                currentAngle = endAngle;
                
                return (
                    <path
                        key={index}
                        d={pathData}
                        fill={item.color || '#666'}
                        stroke="#fff"
                        strokeWidth="2"
                    >
                        <title>{item.name}: {item.count} ({Math.round(percentage * 100)}%)</title>
                    </path>
                );
            })}
            
            {/* Center circle for donut effect */}
            <circle cx={cx} cy={cy} r={40} fill="#fff" />
            <text 
                x={cx} 
                y={cy} 
                textAnchor="middle" 
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="bold"
            >
                {total}
            </text>
            <text 
                x={cx} 
                y={cy + 15} 
                textAnchor="middle" 
                dominantBaseline="middle"
                fontSize="10"
                fill="#666"
            >
                concepts
            </text>
        </>
    );
};

export default DistributionChart;
