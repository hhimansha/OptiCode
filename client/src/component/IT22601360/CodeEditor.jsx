/**
 * Code Editor Component
 * Student: IT22601360
 * 
 * Simple code editor with syntax highlighting support
 */

import React, { useCallback } from 'react';
import './CodeEditor.css';

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
        <div className="code-editor-container">
            {/* Line Numbers */}
            <div className="line-numbers">
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i + 1} className="line-number">
                        {i + 1}
                    </div>
                ))}
            </div>
            
            {/* Code Textarea */}
            <textarea
                className={`code-textarea language-${language}`}
                value={code}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={`Paste your ${language} code here...`}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
            />
        </div>
    );
};

export default CodeEditor;
