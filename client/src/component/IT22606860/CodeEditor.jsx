import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({
    value,
    onChange,
    language = 'javascript',
    readOnly = false,
    height = '400px',
    showLineNumbers = true
}) => {
    const handleEditorChange = (value) => {
        if (onChange) {
            onChange(value);
        }
    };

    return (
        <div className="rounded-xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-950">
            {/* Line numbers gutter styling is handled by Monaco */}
            <Editor
                height={height}
                language={language}
                value={value}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                    readOnly: readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    lineNumbers: showLineNumbers ? 'on' : 'off',
                    lineNumbersMinChars: 4,
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 8,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    renderLineHighlight: 'all',
                    renderLineHighlightOnlyWhenFocus: false,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    wordWrap: 'on',
                    bracketPairColorization: { enabled: true },
                    guides: {
                        indentation: true,
                        bracketPairs: true
                    },
                    overviewRulerBorder: false,
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto',
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10
                    }
                }}
            />
        </div>
    );
};

export default CodeEditor;