import React, { useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaBook } from 'react-icons/fa';
import ViolationCard from './ViolationCard';
import RecommendationsPanel from './RecommendationsPanel';

const BestPracticesPanel = ({ violations, recommendations, summary, loading }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');

    if (loading) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="text-white mt-4">Analyzing best practices...</p>
                </div>
            </div>
        );
    }

    if (!violations || violations.length === 0) {
        return (
            <div className="card bg-green-500/10 border-green-500/30">
                <div className="text-center py-8">
                    <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Excellent Code Quality!</h3>
                    <p className="text-gray-300">No best practice violations detected.</p>
                </div>
            </div>
        );
    }

    const filteredViolations = selectedCategory === 'all' 
        ? violations 
        : violations.filter(v => v.category === selectedCategory);

    const categories = ['all', ...new Set(violations.map(v => v.category))];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card bg-red-500/10 border-red-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-400 font-semibold">Errors</p>
                                <p className="text-3xl font-bold text-white">{summary.error || 0}</p>
                            </div>
                            <FaExclamationTriangle className="text-4xl text-red-500" />
                        </div>
                    </div>

                    <div className="card bg-yellow-500/10 border-yellow-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-400 font-semibold">Warnings</p>
                                <p className="text-3xl font-bold text-white">{summary.warning || 0}</p>
                            </div>
                            <FaExclamationTriangle className="text-4xl text-yellow-500" />
                        </div>
                    </div>

                    <div className="card bg-blue-500/10 border-blue-500/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-400 font-semibold">Suggestions</p>
                                <p className="text-3xl font-bold text-white">{summary.info || 0}</p>
                            </div>
                            <FaInfoCircle className="text-4xl text-blue-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="card">
                <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                                selectedCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {category === 'all' ? 'All' : category}
                            {category !== 'all' && (
                                <span className="ml-2 bg-gray-600 px-2 py-0.5 rounded text-xs">
                                    {violations.filter(v => v.category === category).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Violations List */}
            <div className="card">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FaBook /> Best Practice Violations
                </h3>
                <div className="space-y-3">
                    {filteredViolations.map((violation, index) => (
                        <ViolationCard key={index} violation={violation} index={index} />
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            {recommendations && recommendations.length > 0 && (
                <RecommendationsPanel recommendations={recommendations} />
            )}
        </div>
    );
};

export default BestPracticesPanel;