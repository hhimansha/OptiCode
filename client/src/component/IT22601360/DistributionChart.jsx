import React, { useState, useEffect } from 'react';

const DistributionChart = ({ data }) => {
    const [chartType, setChartType] = useState('bar');
    const [chartData, setChartData] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (!data) {
            setChartData([]);
            setTotal(0);
            return;
        }

        // Handle different data formats
        let concepts = [];
        
        if (Array.isArray(data)) {
            // Direct concepts array
            concepts = data;
        } else if (data.concepts && Array.isArray(data.concepts)) {
            // Has concepts property
            concepts = data.concepts;
        } else if (data.data && Array.isArray(data.data)) {
            // Already formatted for chart
            setChartData(data.data);
            setTotal(data.total || data.data.reduce((sum, d) => sum + d.count, 0));
            return;
        } else {
            setChartData([]);
            setTotal(0);
            return;
        }

        // Generate distribution from concepts
        if (concepts.length > 0) {
            generateDistribution(concepts);
        } else {
            setChartData([]);
            setTotal(0);
        }
    }, [data]);

    const generateDistribution = (concepts) => {
        const categoryColors = {
            'data_structure': '#10b981',
            'algorithm': '#3b82f6',
            'design_pattern': '#9c27b0',
            'architecture': '#f59e0b',
            'paradigm': '#ec4899',
            'programming_concept': '#06b6d4'
        };

        // Count concepts by category
        const categoryCount = {};
        concepts.forEach(concept => {
            const category = concept.category;
            categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        // Convert to chart format
        const formattedData = Object.entries(categoryCount).map(([category, count]) => ({
            name: category.replace('_', ' ').toUpperCase(),
            count: count,
            value: count,
            category: category,
            color: categoryColors[category] || '#666',
            avgConfidence: calculateAvgConfidence(concepts, category)
        }));

        setChartData(formattedData);
        setTotal(concepts.length);
    };

    const calculateAvgConfidence = (concepts, category) => {
        const categoryConcepts = concepts.filter(c => c.category === category);
        if (categoryConcepts.length === 0) return 0;
        const sum = categoryConcepts.reduce((acc, c) => acc + (c.confidence || 0.5), 0);
        return Math.round((sum / categoryConcepts.length) * 100) / 100;
    };

    if (chartData.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900 p-6">
                <div className="text-center">
                    <span className="text-6xl mb-4 block">📊</span>
                    <h3 className="text-xl font-semibold text-white mb-2">No Chart Data</h3>
                    <p className="text-gray-500 max-w-md">
                        Analyze code to see concept distribution
                    </p>
                </div>
            </div>
        );
    }

    const maxCount = Math.max(...chartData.map(d => d.count));

    return (
        <div className="h-full flex flex-col bg-slate-900 p-6">
            {/* Chart Type Toggle */}
            <div className="flex justify-center gap-2 mb-6">
                <button 
                    onClick={() => setChartType('bar')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        chartType === 'bar'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700 border border-slate-700'
                    }`}
                >
                    <span className="text-lg">📊</span>
                    Bar Chart
                </button>
                <button 
                    onClick={() => setChartType('pie')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        chartType === 'pie'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700 border border-slate-700'
                    }`}
                >
                    <span className="text-lg">🥧</span>
                    Pie Chart
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Bar Chart */}
                {chartType === 'bar' && (
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {chartData.map((item, index) => {
                            const percentage = (item.count / maxCount) * 100;
                            const totalPercentage = (item.count / total) * 100;
                            return (
                                <div key={index} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-white flex items-center gap-2">
                                            <span 
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-gray-400">
                                                {item.count} concepts
                                            </span>
                                            <span className="text-xs text-gray-500 w-12 text-right">
                                                {Math.round(totalPercentage)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-8 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                                        <div 
                                            className="h-full rounded-lg transition-all duration-1000 ease-out flex items-center px-3 group-hover:brightness-110"
                                            style={{ 
                                                width: `${percentage}%`,
                                                backgroundColor: item.color,
                                                minWidth: item.count > 0 ? '40px' : '0'
                                            }}
                                        >
                                            {item.count > 0 && (
                                                <span className="text-xs font-bold text-white">
                                                    {item.count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pie Chart */}
                {chartType === 'pie' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            {/* SVG Pie */}
                            <div className="flex-shrink-0">
                                <svg viewBox="0 0 200 200" className="w-64 h-64">
                                    <PieSlices data={chartData} total={total} />
                                </svg>
                            </div>
                            
                            {/* Legend */}
                            <div className="flex-1 space-y-3 w-full">
                                {chartData.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span 
                                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-sm font-medium text-white">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-semibold text-gray-400">
                                                {item.count} concepts
                                            </span>
                                            <span 
                                                className="text-sm font-bold px-2 py-1 rounded"
                                                style={{ 
                                                    backgroundColor: `${item.color}20`,
                                                    color: item.color
                                                }}
                                            >
                                                {Math.round((item.count / total) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
                        <div className="text-3xl font-bold text-white mb-1">{total}</div>
                        <div className="text-sm text-gray-400">Total Concepts</div>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
                        <div className="text-3xl font-bold text-white mb-1">{chartData.length}</div>
                        <div className="text-sm text-gray-400">Categories</div>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
                        <div className="text-lg font-bold text-white mb-1 truncate">
                            {chartData[0]?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-400">Top Category</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Pie Slices Component (keep the same)
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
                    <g key={index} className="group">
                        <path
                            d={pathData}
                            fill={item.color}
                            stroke="#1e293b"
                            strokeWidth="2"
                            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                            style={{
                                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
                            }}
                        >
                            <title>{item.name}: {item.count} ({Math.round(percentage * 100)}%)</title>
                        </path>
                    </g>
                );
            })}
            
            {/* Center circle for donut effect */}
            <circle cx={cx} cy={cy} r={45} fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
            <text 
                x={cx} 
                y={cy - 5} 
                textAnchor="middle" 
                dominantBaseline="middle"
                fontSize="24"
                fontWeight="bold"
                fill="#fff"
            >
                {total}
            </text>
            <text 
                x={cx} 
                y={cy + 15} 
                textAnchor="middle" 
                dominantBaseline="middle"
                fontSize="12"
                fill="#94a3b8"
            >
                concepts
            </text>
        </>
    );
};

export default DistributionChart;