// ============================================
// ChangesComparison.jsx
// Shows before/after code changes with visual diff and metrics
// ============================================
import React, { useMemo, useState } from 'react';
import { FaCode, FaArrowRight, FaPlus, FaMinus, FaExchangeAlt, FaChartBar, FaLayerGroup, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChangesComparison = ({ originalCode, refactoredCode, changes = [], summary = {} }) => {
    const [activeTab, setActiveTab] = useState('overview');

    // Calculate diff metrics
    const metrics = useMemo(() => {
        if (!originalCode || !refactoredCode) return null;

        const originalLines = originalCode.split('\n');
        const refactoredLines = refactoredCode.split('\n');

        // Simple line-based comparison
        const addedLines = [];
        const removedLines = [];
        const modifiedPatterns = [];

        // Find patterns that were changed
        const patterns = [
            { pattern: /\.acquire\(\)/, replacement: 'with lock:', name: 'Lock to Context Manager' },
            { pattern: /f = open\(/, replacement: 'with open(', name: 'File to Context Manager' },
            { pattern: /yaml\.load\(/, replacement: 'yaml.safe_load(', name: 'Safe YAML Loading' },
            { pattern: /= \[.*\]/, replacement: '= {...}', name: 'List to Set' },
            { pattern: /except:/, replacement: 'except Exception:', name: 'Explicit Exception' },
            { pattern: /requests\.get\([^)]+\)(?!.*timeout)/, replacement: 'timeout=10', name: 'Request Timeout' },
            { pattern: /@lru_cache/, replacement: '@lru_cache', name: 'LRU Cache Added' },
            { pattern: /__slots__/, replacement: '__slots__', name: 'Slots Optimization' },
            { pattern: /enumerate\(/, replacement: 'enumerate', name: 'Enumerate Usage' },
        ];

        patterns.forEach(({ pattern, name }) => {
            const inOriginal = pattern.test(originalCode);
            const inRefactored = pattern.test(refactoredCode);
            
            if (!inOriginal && inRefactored) {
                modifiedPatterns.push({ name, type: 'added', color: 'green' });
            } else if (inOriginal && !inRefactored) {
                modifiedPatterns.push({ name, type: 'fixed', color: 'blue' });
            }
        });

        // Check for common improvements
        if (refactoredCode.includes('with self.lock:') && !originalCode.includes('with self.lock:')) {
            modifiedPatterns.push({ name: 'Lock Context Manager', type: 'added', color: 'green' });
        }
        if (refactoredCode.includes('timeout=') && !originalCode.includes('timeout=')) {
            modifiedPatterns.push({ name: 'Request Timeout', type: 'added', color: 'green' });
        }
        if (refactoredCode.includes('safe_load') && !originalCode.includes('safe_load')) {
            modifiedPatterns.push({ name: 'Safe YAML', type: 'fixed', color: 'cyan' });
        }
        if (refactoredCode.includes('@lru_cache') && !originalCode.includes('@lru_cache')) {
            modifiedPatterns.push({ name: 'Memoization', type: 'added', color: 'purple' });
        }
        if (refactoredCode.includes('__slots__') && !originalCode.includes('__slots__')) {
            modifiedPatterns.push({ name: '__slots__', type: 'added', color: 'amber' });
        }

        return {
            originalLines: originalLines.length,
            refactoredLines: refactoredLines.length,
            originalChars: originalCode.length,
            refactoredChars: refactoredCode.length,
            lineChange: refactoredLines.length - originalLines.length,
            charChange: refactoredCode.length - originalCode.length,
            modifiedPatterns: [...new Set(modifiedPatterns.map(p => JSON.stringify(p)))].map(p => JSON.parse(p)),
            totalChanges: changes.length || modifiedPatterns.length,
        };
    }, [originalCode, refactoredCode, changes]);

    // Find specific line changes for the diff view
    const lineDiffs = useMemo(() => {
        if (!originalCode || !refactoredCode) return [];
        
        const originalLines = originalCode.split('\n');
        const refactoredLines = refactoredCode.split('\n');
        const diffs = [];

        // Simple line comparison - mark lines that are different
        const maxLines = Math.max(originalLines.length, refactoredLines.length);
        
        for (let i = 0; i < maxLines; i++) {
            const origLine = originalLines[i] || '';
            const refLine = refactoredLines[i] || '';
            
            if (origLine !== refLine) {
                if (origLine && !refLine) {
                    diffs.push({ type: 'removed', lineNum: i + 1, content: origLine });
                } else if (!origLine && refLine) {
                    diffs.push({ type: 'added', lineNum: i + 1, content: refLine });
                } else {
                    diffs.push({ type: 'modified', lineNum: i + 1, before: origLine, after: refLine });
                }
            }
        }
        
        return diffs.slice(0, 20); // Limit to first 20 diffs
    }, [originalCode, refactoredCode]);

    if (!originalCode || !refactoredCode) {
        return (
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-slate-700/50 rounded-xl p-8 text-center">
                <FaCode className="text-4xl text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Refactor your code to see the changes comparison</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600/20 via-cyan-600/20 to-blue-600/20 border-b border-slate-700/50 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-lg shadow-emerald-500/30">
                            <FaExchangeAlt className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Code Changes Analysis</h3>
                            <p className="text-slate-400 text-sm">Visualize improvements made to your code</p>
                        </div>
                    </div>

                    {/* Metrics Bubbles */}
                    <div className="flex gap-3">
                        <MetricBubble
                            icon={<FaLayerGroup />}
                            value={metrics?.totalChanges || 0}
                            label="Changes"
                            color="emerald"
                        />
                        <MetricBubble
                            icon={<FaPlus />}
                            value={metrics?.lineChange > 0 ? `+${metrics.lineChange}` : metrics?.lineChange || 0}
                            label="Lines"
                            color={metrics?.lineChange >= 0 ? 'blue' : 'amber'}
                        />
                        <MetricBubble
                            icon={<FaChartBar />}
                            value={metrics?.modifiedPatterns?.length || 0}
                            label="Patterns"
                            color="purple"
                        />
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mt-6">
                    {['overview', 'diff', 'patterns'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                                activeTab === tab
                                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30'
                                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'overview' && (
                    <OverviewTab metrics={metrics} originalCode={originalCode} refactoredCode={refactoredCode} />
                )}
                {activeTab === 'diff' && (
                    <DiffTab lineDiffs={lineDiffs} />
                )}
                {activeTab === 'patterns' && (
                    <PatternsTab patterns={metrics?.modifiedPatterns || []} changes={changes} />
                )}
            </div>
        </div>
    );
};

// Metric Bubble Component
const MetricBubble = ({ icon, value, label, color }) => {
    const colorClasses = {
        emerald: 'from-emerald-500 to-green-500 shadow-emerald-500/30',
        blue: 'from-blue-500 to-cyan-500 shadow-blue-500/30',
        purple: 'from-purple-500 to-pink-500 shadow-purple-500/30',
        amber: 'from-amber-500 to-orange-500 shadow-amber-500/30',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-xl shadow-lg min-w-[90px] text-center transform hover:scale-105 transition-transform`}>
            <div className="text-white/80 text-sm mb-1">{icon}</div>
            <div className="text-white font-bold text-xl">{value}</div>
            <div className="text-white/70 text-xs">{label}</div>
        </div>
    );
};

// Overview Tab - Side by side code comparison
const OverviewTab = ({ metrics, originalCode, refactoredCode }) => {
    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Original Lines" value={metrics?.originalLines} icon="📄" />
                <StatCard label="Refactored Lines" value={metrics?.refactoredLines} icon="📝" />
                <StatCard label="Original Chars" value={metrics?.originalChars} icon="🔤" />
                <StatCard label="Refactored Chars" value={metrics?.refactoredChars} icon="✨" />
            </div>

            {/* Side by Side Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Before */}
                <div className="bg-slate-900/80 rounded-xl overflow-hidden border border-red-500/20">
                    <div className="bg-red-500/10 px-4 py-3 border-b border-red-500/20 flex items-center gap-2">
                        <FaMinus className="text-red-400" />
                        <span className="text-red-300 font-semibold text-sm">Before (Original)</span>
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                        <SyntaxHighlighter
                            language="python"
                            style={vscDarkPlus}
                            showLineNumbers={true}
                            customStyle={{
                                margin: 0,
                                padding: '16px',
                                background: 'transparent',
                                fontSize: '12px',
                            }}
                        >
                            {originalCode || ''}
                        </SyntaxHighlighter>
                    </div>
                </div>

                {/* After */}
                <div className="bg-slate-900/80 rounded-xl overflow-hidden border border-green-500/20">
                    <div className="bg-green-500/10 px-4 py-3 border-b border-green-500/20 flex items-center gap-2">
                        <FaPlus className="text-green-400" />
                        <span className="text-green-300 font-semibold text-sm">After (Refactored)</span>
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                        <SyntaxHighlighter
                            language="python"
                            style={vscDarkPlus}
                            showLineNumbers={true}
                            customStyle={{
                                margin: 0,
                                padding: '16px',
                                background: 'transparent',
                                fontSize: '12px',
                            }}
                        >
                            {refactoredCode || ''}
                        </SyntaxHighlighter>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ label, value, icon }) => (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
        <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{icon}</span>
            <span className="text-slate-400 text-xs">{label}</span>
        </div>
        <div className="text-2xl font-bold text-white">{value?.toLocaleString() || 0}</div>
    </div>
);

// Diff Tab - Show line-by-line differences
const DiffTab = ({ lineDiffs }) => {
    if (lineDiffs.length === 0) {
        return (
            <div className="text-center py-12">
                <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">Code is identical or minimal changes detected</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {lineDiffs.map((diff, idx) => (
                <div key={idx} className="bg-slate-900/60 rounded-lg overflow-hidden border border-slate-700/50">
                    <div className={`px-3 py-1.5 text-xs font-mono flex items-center gap-2 ${
                        diff.type === 'added' ? 'bg-green-500/10 text-green-400' :
                        diff.type === 'removed' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                    }`}>
                        {diff.type === 'added' && <FaPlus />}
                        {diff.type === 'removed' && <FaMinus />}
                        {diff.type === 'modified' && <FaExchangeAlt />}
                        <span>Line {diff.lineNum}</span>
                        <span className="ml-auto text-xs opacity-70">
                            {diff.type === 'added' ? 'New line' : diff.type === 'removed' ? 'Removed' : 'Modified'}
                        </span>
                    </div>
                    <div className="p-3 font-mono text-sm">
                        {diff.type === 'modified' ? (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <span className="text-red-400 flex-shrink-0">-</span>
                                    <code className="text-red-300/80 line-through">{diff.before}</code>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-green-400 flex-shrink-0">+</span>
                                    <code className="text-green-300">{diff.after}</code>
                                </div>
                            </div>
                        ) : (
                            <code className={diff.type === 'added' ? 'text-green-300' : 'text-red-300'}>
                                {diff.content}
                            </code>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Patterns Tab - Show what patterns were applied
const PatternsTab = ({ patterns, changes }) => {
    const allPatterns = patterns.length > 0 ? patterns : (changes || []).map(c => ({
        name: c.pattern || c.description || 'Code Improvement',
        type: 'applied',
        color: 'emerald'
    }));

    if (allPatterns.length === 0) {
        return (
            <div className="text-center py-12">
                <FaCode className="text-5xl text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No specific patterns detected</p>
            </div>
        );
    }

    const patternColors = {
        added: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300',
        fixed: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
        applied: 'from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-300',
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPatterns.map((pattern, idx) => (
                <div
                    key={idx}
                    className={`bg-gradient-to-br ${patternColors[pattern.type] || patternColors.applied} border rounded-xl p-4 transform hover:scale-105 transition-all hover:shadow-lg`}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900/50 rounded-lg">
                            <FaCheckCircle className="text-green-400" />
                        </div>
                        <div>
                            <div className="font-semibold text-sm">{pattern.name}</div>
                            <div className="text-xs opacity-70 capitalize">{pattern.type}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChangesComparison;
