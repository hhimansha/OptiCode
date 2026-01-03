import React from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

const ChangeHighlighter = ({ originalCode, refactoredCode }) => {
    // Simple diff highlighting (you can use a library like diff for better results)
    const getChanges = () => {
        const originalLines = originalCode.split('\n');
        const refactoredLines = refactoredCode.split('\n');
        
        const changes = [];
        const maxLines = Math.max(originalLines.length, refactoredLines.length);
        
        for (let i = 0; i < maxLines; i++) {
            const original = originalLines[i] || '';
            const refactored = refactoredLines[i] || '';
            
            if (original !== refactored) {
                if (original && !refactored) {
                    changes.push({ type: 'removed', line: i + 1, content: original });
                } else if (!original && refactored) {
                    changes.push({ type: 'added', line: i + 1, content: refactored });
                } else {
                    changes.push({ type: 'modified', line: i + 1, original, refactored });
                }
            }
        }
        
        return changes;
    };

    const changes = getChanges();

    if (changes.length === 0) {
        return (
            <div className="card">
                <p className="text-gray-300">No significant changes detected.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="text-xl font-bold text-white mb-4">Code Changes</h3>
            <div className="space-y-2">
                {changes.map((change, index) => (
                    <div key={index} className="border-l-4 pl-3 py-2">
                        {change.type === 'removed' && (
                            <div className="border-l-red-500">
                                <div className="flex items-start gap-2">
                                    <FaMinus className="text-red-500 mt-1" />
                                    <div className="flex-1">
                                        <span className="text-xs text-gray-400">Line {change.line}</span>
                                        <pre className="text-red-400 text-sm bg-red-500/10 p-2 rounded overflow-x-auto">
                                            {change.content}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {change.type === 'added' && (
                            <div className="border-l-green-500">
                                <div className="flex items-start gap-2">
                                    <FaPlus className="text-green-500 mt-1" />
                                    <div className="flex-1">
                                        <span className="text-xs text-gray-400">Line {change.line}</span>
                                        <pre className="text-green-400 text-sm bg-green-500/10 p-2 rounded overflow-x-auto">
                                            {change.content}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {change.type === 'modified' && (
                            <div className="border-l-yellow-500">
                                <div className="flex items-start gap-2">
                                    <div className="text-yellow-500 mt-1">~</div>
                                    <div className="flex-1">
                                        <span className="text-xs text-gray-400">Line {change.line}</span>
                                        <pre className="text-red-400 text-sm bg-red-500/10 p-2 rounded overflow-x-auto mb-1">
                                            - {change.original}
                                        </pre>
                                        <pre className="text-green-400 text-sm bg-green-500/10 p-2 rounded overflow-x-auto">
                                            + {change.refactored}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChangeHighlighter;