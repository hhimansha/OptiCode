// ============================================
// client/src/pages/IT22606860/History.jsx
// Modern Refactoring History Page with Risk Analysis & Rename
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaTrash, FaEye, FaClock, FaCode, FaEdit, FaCheck, FaTimes, 
    FaShieldAlt, FaSearch, FaFilter, FaHistory,
    FaBolt, FaCheckCircle, FaArrowRight,
    FaDownload, FaCopy
} from 'react-icons/fa';
import { Toaster, toast } from 'sonner';
import { getHistory, deleteHistory, clearAllHistory, updateHistory, getHistoryById } from '../../services/api';
import CodeEditor from '../../component/IT22606860/CodeEditor';
import RiskAnalysisView from '../../component/IT22606860/RiskAnalysisView';

const History = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedFullItem, setSelectedFullItem] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [activeTab, setActiveTab] = useState('code'); // 'code' | 'risk'

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getHistory(page, 10);
            if (response.success) {
                setHistory(response.data);
                setPagination(response.pagination);
            }
        } catch {
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    useEffect(() => {
        // When an item is selected, fetch full details
        if (selectedItem?._id) {
            fetchFullItem(selectedItem._id);
        }
    }, [selectedItem?._id]);

    const fetchFullItem = async (id) => {
        try {
            const response = await getHistoryById(id);
            if (response.success) {
                console.log('[HISTORY] Full item loaded:', response.data);
                console.log('[HISTORY] Risk analysis data:', response.data.riskAnalysis);
                setSelectedFullItem(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch full history item:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            const response = await deleteHistory(id);
            if (response.success) {
                toast.success('Deleted successfully');
                fetchHistory();
                if (selectedItem?._id === id) {
                    setSelectedItem(null);
                    setSelectedFullItem(null);
                }
            }
        } catch {
            toast.error('Failed to delete');
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await clearAllHistory();
            if (response.success) {
                toast.success('All history cleared');
                setHistory([]);
                setSelectedItem(null);
                setSelectedFullItem(null);
            }
        } catch {
            toast.error('Failed to clear history');
        }
    };

    const handleStartRename = (item) => {
        setEditingId(item._id);
        setEditName(item.instruction || 'Untitled Refactoring');
    };

    const handleSaveRename = async (id) => {
        if (!editName.trim()) {
            toast.error('Name cannot be empty');
            return;
        }

        try {
            const response = await updateHistory(id, { instruction: editName.trim() });
            if (response.success) {
                toast.success('Renamed successfully');
                setEditingId(null);
                fetchHistory();
                if (selectedItem?._id === id) {
                    setSelectedItem({ ...selectedItem, instruction: editName.trim() });
                }
            }
        } catch {
            toast.error('Failed to rename');
        }
    };

    const handleCancelRename = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Code copied to clipboard!');
    };

    const handleDownloadCode = (code, filename) => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Code downloaded!');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateString);
    };

    const filteredHistory = searchQuery 
        ? history.filter(item => 
            item.instruction?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.language?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : history;

    // Risk analysis summary component
    const RiskSummary = ({ riskAnalysis }) => {
        if (!riskAnalysis) {
            return (
                <div className="text-center py-12 text-slate-400">
                    <FaShieldAlt className="text-5xl mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No risk analysis data available</p>
                    <p className="text-sm mt-2">Run risk analysis on the refactor page to see results here</p>
                </div>
            );
        }

        const { before, after, risksFixed } = riskAnalysis;

        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                        <p className="text-red-400 text-sm font-medium mb-1">Before Risks</p>
                        <p className="text-3xl font-bold text-white">{before?.totalRisks || 0}</p>
                        <p className="text-red-400/70 text-xs mt-1">Score: {before?.riskScore || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                        <p className="text-green-400 text-sm font-medium mb-1">After Risks</p>
                        <p className="text-3xl font-bold text-white">{after?.totalRisks || 0}</p>
                        <p className="text-green-400/70 text-xs mt-1">Score: {after?.riskScore || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
                        <p className="text-cyan-400 text-sm font-medium mb-1">Risks Fixed</p>
                        <p className="text-3xl font-bold text-white">{risksFixed || 0}</p>
                        <p className="text-cyan-400/70 text-xs mt-1">
                            {risksFixed > 0 ? 'Improved' : risksFixed < 0 ? 'Increased' : 'No change'}
                        </p>
                    </div>
                </div>

                {/* Risk Breakdown */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Before */}
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                            Before Refactoring
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-red-400 text-sm">Critical</span>
                                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-sm font-medium">
                                    {before?.critical || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-orange-400 text-sm">High</span>
                                <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-sm font-medium">
                                    {before?.high || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-yellow-400 text-sm">Medium</span>
                                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-sm font-medium">
                                    {before?.medium || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-400 text-sm">Low</span>
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-sm font-medium">
                                    {before?.low || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* After */}
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            After Refactoring
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-red-400 text-sm">Critical</span>
                                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-sm font-medium">
                                    {after?.critical || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-orange-400 text-sm">High</span>
                                <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-sm font-medium">
                                    {after?.high || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-yellow-400 text-sm">Medium</span>
                                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-sm font-medium">
                                    {after?.medium || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-400 text-sm">Low</span>
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-sm font-medium">
                                    {after?.low || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && history.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400">Loading history...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
            </div>

            <Toaster position="top-right" richColors />

            <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                                <FaHistory className="text-2xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent">
                                    Refactoring History
                                </h1>
                                <p className="text-slate-400 mt-1">
                                    {pagination ? `${pagination.total} total refactorings` : 'View your past refactorings'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search history..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 w-64 transition-all"
                                />
                            </div>

                            {/* Back to Refactor */}
                            <button
                                onClick={() => navigate('/refactor')}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-medium shadow-lg shadow-blue-500/25"
                            >
                                <FaCode />
                                <span>New Refactor</span>
                            </button>

                            {history.length > 0 && (
                                <button 
                                    onClick={handleClearAll} 
                                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all font-medium"
                                >
                                    <FaTrash />
                                    <span>Clear All</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {filteredHistory.length === 0 ? (
                    /* Empty State */
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-16 text-center backdrop-blur-sm">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaCode className="text-4xl text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                            {searchQuery ? 'No Matching Results' : 'No Refactoring History Yet'}
                        </h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            {searchQuery 
                                ? 'Try a different search term or clear the filter'
                                : 'Start by refactoring some code to see your history here!'
                            }
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => navigate('/refactor')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-xl shadow-purple-500/30"
                            >
                                <FaBolt />
                                Start Refactoring
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* History List */}
                        <div className="lg:col-span-1 space-y-3">
                            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
                                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <FaFilter className="text-purple-400" />
                                    Recent Refactorings
                                    <span className="ml-auto bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                                        {filteredHistory.length}
                                    </span>
                                </h3>
                                
                                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                                    {filteredHistory.map((item) => (
                                        <div
                                            key={item._id}
                                            onClick={() => setSelectedItem(item)}
                                            className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                                                selectedItem?._id === item._id 
                                                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 shadow-lg shadow-purple-500/10' 
                                                    : 'bg-slate-800/50 border-slate-700/30 hover:border-slate-600 hover:bg-slate-800/80'
                                            }`}
                                        >
                                            {/* Name/Instruction with Edit */}
                                            <div className="mb-2">
                                                {editingId === item._id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSaveRename(item._id);
                                                                if (e.key === 'Escape') handleCancelRename();
                                                            }}
                                                            className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSaveRename(item._id);
                                                            }}
                                                            className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                                                        >
                                                            <FaCheck className="text-xs" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancelRename();
                                                            }}
                                                            className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                                                        >
                                                            <FaTimes className="text-xs" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-white font-medium text-sm line-clamp-2 flex-1">
                                                            {item.instruction || 'Untitled Refactoring'}
                                                        </p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStartRename(item);
                                                            }}
                                                            className="p-1 text-slate-500 hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Rename"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Meta Info */}
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <FaClock className="text-[10px]" />
                                                    {getRelativeTime(item.createdAt)}
                                                </span>
                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                                                    {item.language || 'python'}
                                                </span>
                                                {(item.riskAnalysis?.detailed || item.riskAnalysis?.before) && (
                                                    <span className="flex items-center gap-1 text-green-400" title="Risk analyzed">
                                                        <FaShieldAlt className="text-[10px]" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Quick Stats */}
                                            {item.qualityMetrics?.improvement && (
                                                <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-3 text-xs">
                                                    {item.qualityMetrics.improvement.overallScore > 0 ? (
                                                        <span className="flex items-center gap-1 text-green-400">
                                                            <FaCheckCircle className="text-[10px]" />
                                                            +{item.qualityMetrics.improvement.overallScore.toFixed(1)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">No improvement</span>
                                                    )}
                                                    {item.processingTime && (
                                                        <span className="text-slate-500">
                                                            {(item.processingTime / 1000).toFixed(2)}s
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2 mt-3 pt-2 border-t border-slate-700/30">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedItem(item);
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 text-xs font-medium transition-all"
                                                >
                                                    <FaEye className="text-[10px]" /> View
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStartRename(item);
                                                    }}
                                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-xs font-medium transition-all"
                                                >
                                                    <FaEdit className="text-[10px]" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(item._id);
                                                    }}
                                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-xs font-medium transition-all"
                                                >
                                                    <FaTrash className="text-[10px]" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.pages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
                                        <button
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                            className="px-3 py-1.5 bg-slate-700/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors text-sm font-medium"
                                        >
                                            Prev
                                        </button>
                                        <span className="text-slate-400 text-sm">
                                            {page} / {pagination.pages}
                                        </span>
                                        <button
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === pagination.pages}
                                            className="px-3 py-1.5 bg-slate-700/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors text-sm font-medium"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detail View */}
                        <div className="lg:col-span-2">
                            {selectedItem && selectedFullItem ? (
                                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 border-b border-slate-700/50 p-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-bold text-white mb-2">
                                                    {selectedItem.instruction || 'Untitled Refactoring'}
                                                </h2>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="flex items-center gap-1.5 text-slate-400">
                                                        <FaClock className="text-xs" />
                                                        {formatDate(selectedItem.createdAt)}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                                                        {selectedItem.language || 'python'}
                                                    </span>
                                                    {selectedItem.processingTime && (
                                                        <span className="text-green-400 text-xs">
                                                            {(selectedItem.processingTime / 1000).toFixed(2)}s
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleStartRename(selectedItem)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all text-sm font-medium"
                                            >
                                                <FaEdit className="text-xs" />
                                                Rename
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex border-b border-slate-700/50">
                                        <button
                                            onClick={() => setActiveTab('code')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-all ${
                                                activeTab === 'code'
                                                    ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            }`}
                                        >
                                            <FaCode />
                                            Code Comparison
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('risk')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-all ${
                                                activeTab === 'risk'
                                                    ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            }`}
                                        >
                                            <FaShieldAlt />
                                            Risk Analysis
                                            {(selectedFullItem.riskAnalysis?.detailed || selectedFullItem.riskAnalysis?.before) && (
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        {activeTab === 'code' ? (
                                            <div className="space-y-6">
                                                {/* Quality Metrics Summary */}
                                                {selectedFullItem.qualityMetrics?.improvement && (
                                                    <div className="grid grid-cols-4 gap-3">
                                                        <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/30">
                                                            <p className="text-slate-400 text-xs mb-1">LOC Reduction</p>
                                                            <p className={`text-lg font-bold ${selectedFullItem.qualityMetrics.improvement.locReduction > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                                                                {selectedFullItem.qualityMetrics.improvement.locReduction > 0 ? '-' : ''}{selectedFullItem.qualityMetrics.improvement.locReduction}%
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/30">
                                                            <p className="text-slate-400 text-xs mb-1">Complexity</p>
                                                            <p className={`text-lg font-bold ${selectedFullItem.qualityMetrics.improvement.complexityReduction > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                                                                {selectedFullItem.qualityMetrics.improvement.complexityReduction > 0 ? '-' : ''}{selectedFullItem.qualityMetrics.improvement.complexityReduction}%
                                                            </p>
                                                        </div>
                                                        <div className="bg-slate-800/50 rounded-xl p-3 text-center border border-slate-700/30">
                                                            <p className="text-slate-400 text-xs mb-1">Maintainability</p>
                                                            <p className={`text-lg font-bold ${selectedFullItem.qualityMetrics.improvement.maintainabilityImprovement > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                                                                +{selectedFullItem.qualityMetrics.improvement.maintainabilityImprovement}
                                                            </p>
                                                        </div>
                                                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-3 text-center border border-purple-500/30">
                                                            <p className="text-purple-400 text-xs mb-1">Overall Score</p>
                                                            <p className="text-lg font-bold text-white">
                                                                {selectedFullItem.qualityMetrics.improvement.overallScore > 0 ? '+' : ''}{selectedFullItem.qualityMetrics.improvement.overallScore}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Original Code */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-white font-semibold flex items-center gap-2">
                                                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                                            Original Code
                                                        </h3>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleCopyCode(selectedFullItem.inputCode || selectedFullItem.originalCode)}
                                                                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                                                title="Copy"
                                                            >
                                                                <FaCopy />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadCode(selectedFullItem.inputCode || selectedFullItem.originalCode, 'original_code.py')}
                                                                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                                                title="Download"
                                                            >
                                                                <FaDownload />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <CodeEditor
                                                        value={selectedFullItem.inputCode || selectedFullItem.originalCode || ''}
                                                        language={selectedItem.language || 'python'}
                                                        readOnly={true}
                                                        height="250px"
                                                    />
                                                </div>

                                                {/* Arrow */}
                                                <div className="flex justify-center">
                                                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                                                        <FaArrowRight className="text-white rotate-90" />
                                                    </div>
                                                </div>

                                                {/* Refactored Code */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-white font-semibold flex items-center gap-2">
                                                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                                            Refactored Code
                                                        </h3>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleCopyCode(selectedFullItem.refactoredCode)}
                                                                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                                                title="Copy"
                                                            >
                                                                <FaCopy />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadCode(selectedFullItem.refactoredCode, 'refactored_code.py')}
                                                                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                                                                title="Download"
                                                            >
                                                                <FaDownload />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <CodeEditor
                                                        value={selectedFullItem.refactoredCode || ''}
                                                        language={selectedItem.language || 'python'}
                                                        readOnly={true}
                                                        height="250px"
                                                    />
                                                </div>

                                                {/* Changes Applied */}
                                                {selectedFullItem.changesApplied && selectedFullItem.changesApplied.length > 0 && (
                                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
                                                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                                            <FaBolt className="text-yellow-400" />
                                                            Changes Applied ({selectedFullItem.changesApplied.length})
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedFullItem.changesApplied.map((change, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs"
                                                                >
                                                                    {change}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <RiskAnalysisView riskAnalysis={selectedFullItem.riskAnalysis} />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 rounded-2xl p-16 text-center backdrop-blur-sm flex flex-col items-center justify-center min-h-[500px]">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-6">
                                        <FaEye className="text-3xl text-purple-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">
                                        Select a Refactor to View
                                    </h3>
                                    <p className="text-slate-400 max-w-sm">
                                        Click on any item from the history list to view detailed code comparison and risk analysis
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.7);
                }
            `}</style>
        </div>
    );
};

export default History;
