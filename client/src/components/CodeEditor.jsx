// Simple CodeEditor component wrapper
import React from 'react';

const CodeEditor = ({ value, language, readOnly = false, height = '400px', onChange }) => {
    return (
        <div className="code-editor-wrapper" style={{ height }}>
            <textarea
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                readOnly={readOnly}
                className="code-editor"
                style={{
                    width: '100%',
                    height: '100%',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    padding: '1rem',
                    backgroundColor: '#0d1117',
                    color: '#c9d1d9',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    resize: 'vertical',
                    outline: 'none',
                }}
                spellCheck={false}
            />
        </div>
    );
};

export default CodeEditor;
