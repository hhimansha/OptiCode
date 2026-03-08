/**
 * File Tree View Component
 * Student: IT22601360
 * 
 * Displays project file structure
 */

import React, { useState } from 'react';

const FileTreeView = ({ onFileSelect }) => {
    const [expandedFolders, setExpandedFolders] = useState(['src', 'components', 'utils']);
    const [selectedFile, setSelectedFile] = useState('binary_search.py');

    // Dummy project structure
    const fileTree = {
        name: 'my-python-project',
        type: 'folder',
        children: [
            {
                name: 'src',
                type: 'folder',
                children: [
                    {
                        name: 'algorithms',
                        type: 'folder',
                        children: [
                            { name: 'binary_search.py', type: 'file', size: '2.4 KB', language: 'python' },
                            { name: 'sorting.py', type: 'file', size: '3.8 KB', language: 'python' },
                            { name: 'graph_traversal.py', type: 'file', size: '4.2 KB', language: 'python' }
                        ]
                    },
                    {
                        name: 'data_structures',
                        type: 'folder',
                        children: [
                            { name: 'stack.py', type: 'file', size: '1.8 KB', language: 'python' },
                            { name: 'queue.py', type: 'file', size: '2.1 KB', language: 'python' },
                            { name: 'linked_list.py', type: 'file', size: '3.5 KB', language: 'python' },
                            { name: 'tree.py', type: 'file', size: '5.2 KB', language: 'python' }
                        ]
                    },
                    { name: 'main.py', type: 'file', size: '1.2 KB', language: 'python' },
                    { name: 'utils.py', type: 'file', size: '0.8 KB', language: 'python' }
                ]
            },
            {
                name: 'tests',
                type: 'folder',
                children: [
                    { name: 'test_algorithms.py', type: 'file', size: '2.7 KB', language: 'python' },
                    { name: 'test_data_structures.py', type: 'file', size: '3.1 KB', language: 'python' }
                ]
            },
            { name: 'README.md', type: 'file', size: '1.5 KB', language: 'markdown' },
            { name: 'requirements.txt', type: 'file', size: '0.3 KB', language: 'text' },
            { name: '.gitignore', type: 'file', size: '0.2 KB', language: 'text' }
        ]
    };

    const toggleFolder = (folderPath) => {
        setExpandedFolders(prev => 
            prev.includes(folderPath)
                ? prev.filter(p => p !== folderPath)
                : [...prev, folderPath]
        );
    };

    const handleFileClick = (file, path) => {
        setSelectedFile(path);
        if (onFileSelect) {
            onFileSelect(file, path);
        }
    };

    const getFileIcon = (name, type) => {
        if (type === 'folder') {
            return expandedFolders.includes(name) ? '📂' : '📁';
        }
        
        const ext = name.split('.').pop().toLowerCase();
        const icons = {
            py: '🐍',
            js: '📜',
            jsx: '⚛️',
            ts: '📘',
            tsx: '⚛️',
            json: '📋',
            md: '📝',
            txt: '📄',
            css: '🎨',
            html: '🌐',
            git: '🔧'
        };
        return icons[ext] || '📄';
    };

    const renderTree = (node, path = '', level = 0) => {
        const fullPath = path ? `${path}/${node.name}` : node.name;
        const isExpanded = expandedFolders.includes(fullPath);
        const isSelected = selectedFile === fullPath;

        return (
            <div key={fullPath}>
                <div
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all duration-150 ${
                        isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm'
                            : 'hover:bg-slate-800 text-gray-300'
                    }`}
                    style={{ paddingLeft: `${level * 16 + 8}px` }}
                    onClick={() => {
                        if (node.type === 'folder') {
                            toggleFolder(fullPath);
                        } else {
                            handleFileClick(node, fullPath);
                        }
                    }}
                >
                    {/* Expand/Collapse Icon */}
                    {node.type === 'folder' && (
                        <svg
                            className={`w-3 h-3 transition-transform duration-200 ${
                                isExpanded ? 'rotate-90' : ''
                            } ${isSelected ? 'text-white' : 'text-gray-500'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    )}
                    
                    {/* File/Folder Icon */}
                    <span className="text-sm">{getFileIcon(node.name, node.type)}</span>
                    
                    {/* Name */}
                    <span className={`text-sm flex-1 ${isSelected ? 'font-medium' : ''}`}>
                        {node.name}
                    </span>
                    
                    {/* File Size */}
                    {node.type === 'file' && node.size && (
                        <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                            {node.size}
                        </span>
                    )}
                </div>

                {/* Children */}
                {node.type === 'folder' && isExpanded && node.children && (
                    <div>
                        {node.children.map(child => renderTree(child, fullPath, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-slate-900">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <span className="text-lg">📁</span>
                        Project Explorer
                    </h3>
                    <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/30">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Import
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-slate-800 text-gray-300 text-xs font-medium rounded-md hover:bg-slate-700 transition-all duration-200 flex items-center justify-center gap-1.5 border border-slate-700">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Clone
                    </button>
                </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                {renderTree(fileTree)}
            </div>

            {/* Footer Stats */}
            <div className="px-4 py-3 bg-slate-800/50 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        15 files
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        6 folders
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FileTreeView;