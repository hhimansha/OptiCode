/**
 * Code Editor Component (Dark Mode)
 * Student: IT22601360
 * 
 * Simple code editor with syntax highlighting support
 */

import React, { useCallback } from 'react';

const CodeEditor = ({ code, setCode, language }) => {
    const handleChange = useCallback((e) => {
        setCode(e.target.value);
    }, [setCode]);

    // Handle tab key for indentation
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            
            const newValue = code.substring(0, start) + '    ' + code.substring(end);
            setCode(newValue);
            
            // Move cursor after the inserted tab
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    }, [code, setCode]);

    // Count lines
    const lineCount = code.split('\n').length;

    return (
        <div className="relative h-full flex bg-slate-950">
            {/* Line Numbers */}
            <div className="flex-shrink-0 w-12 bg-slate-900 border-r border-slate-800 overflow-hidden">
                <div className="py-4 px-2 font-mono text-xs text-gray-600 select-none">
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i + 1} className="h-6 text-right pr-2 hover:text-gray-400 transition-colors">
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Code Textarea */}
            <div className="flex-1 relative">
                <textarea
                    value={code}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={`Paste your ${language} code here...\n\nExample:\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    ...\n`}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    className="w-full h-full px-4 py-4 bg-slate-950 text-gray-300 font-mono text-sm leading-6 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset placeholder:text-gray-700"
                    style={{
                        tabSize: 4,
                        fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
                    }}
                />
                
                {/* Character Count (Bottom Right) */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-800/80 backdrop-blur-sm rounded text-xs text-gray-500 border border-slate-700">
                    {code.length} chars • {lineCount} lines
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;