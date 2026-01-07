import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({
    value,
    onChange,
    language = 'javascript',
    readOnly = false,
    height = '400px'
}) => {
    const handleEditorChange = (value) => {
        if (onChange) {
            onChange(value);
        }
    };

    return (
        <div className="rounded-lg overflow-hidden border border-gray-700 shadow-lg">
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
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    renderLineHighlight: 'all',
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: true,
                    wordWrap: 'on',
                }}
            />
        </div>
    );
};

export default CodeEditor;