import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

const TestResults = ({ results, loading }) => {
    if (loading) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="text-white mt-4">Running tests...</p>
                </div>
            </div>
        );
    }

    if (!results) {
        return null;
    }

    const { tests, passed, failed, total, coverage } = results;

    return (
        <div className="card">
            <h3 className="text-xl font-bold text-white mb-4">Test Results</h3>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-400 font-semibold">Passed</p>
                            <p className="text-3xl font-bold text-white">{passed || 0}</p>
                        </div>
                        <FaCheckCircle className="text-4xl text-green-500" />
                    </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-400 font-semibold">Failed</p>
                            <p className="text-3xl font-bold text-white">{failed || 0}</p>
                        </div>
                        <FaTimesCircle className="text-4xl text-red-500" />
                    </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-400 font-semibold">Coverage</p>
                            <p className="text-3xl font-bold text-white">{coverage || 0}%</p>
                        </div>
                        <FaInfoCircle className="text-4xl text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Test List */}
            {tests && tests.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Test Cases:</h4>
                    <div className="space-y-2">
                        {tests.map((test, index) => (
                            <div 
                                key={index}
                                className={`border rounded-lg p-3 ${
                                    test.passed 
                                        ? 'border-green-500 bg-green-500/10' 
                                        : 'border-red-500 bg-red-500/10'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {test.passed ? (
                                            <FaCheckCircle className="text-green-500" />
                                        ) : (
                                            <FaTimesCircle className="text-red-500" />
                                        )}
                                        <div>
                                            <p className="text-white font-semibold">{test.name}</p>
                                            {test.description && (
                                                <p className="text-gray-400 text-sm">{test.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                                        test.passed 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-red-500 text-white'
                                    }`}>
                                        {test.passed ? 'PASS' : 'FAIL'}
                                    </span>
                                </div>
                                {!test.passed && test.error && (
                                    <div className="mt-2 bg-gray-900 rounded p-2">
                                        <p className="text-red-400 text-xs font-mono">{test.error}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Overall Result */}
            <div className={`mt-6 border-t pt-4 ${
                failed === 0 ? 'border-green-500' : 'border-red-500'
            }`}>
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-white">Overall Result:</p>
                    <div className="flex items-center gap-2">
                        {failed === 0 ? (
                            <>
                                <FaCheckCircle className="text-green-500 text-xl" />
                                <span className="text-green-400 font-bold">All Tests Passed</span>
                            </>
                        ) : (
                            <>
                                <FaTimesCircle className="text-red-500 text-xl" />
                                <span className="text-red-400 font-bold">{failed} Test(s) Failed</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestResults;