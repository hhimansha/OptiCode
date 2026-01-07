// ============================================
// client/src/pages/IT22606860/History.jsx (Tailwind)
// ============================================
import React, { useState, useEffect } from 'react';
import { FaTrash, FaEye, FaClock, FaCode } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getHistory, deleteHistory, clearAllHistory } from '../../services/api';
import CodeEditor from '../../components/IT22606860/CodeEditor';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await getHistory(page, 10);
      if (response.success) {
        setHistory(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
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
        }
      }
    } catch (error) {
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
      }
    } catch (error) {
      toast.error('Failed to clear history');
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="container-custom">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Refactoring History
            </h1>
            <p className="text-gray-400">
              {pagination ? `${pagination.total} total refactors` : 'View your past refactorings'}
            </p>
          </div>
          {history.length > 0 && (
            <button onClick={handleClearAll} className="btn-danger">
              <FaTrash /> Clear All History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          /* Empty State */
          <div className="card text-center py-16">
            <FaCode className="text-6xl text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">
              No Refactoring History Yet
            </h3>
            <p className="text-gray-400 mb-8">
              Start by refactoring some code to see your history here!
            </p>
            <a href="/refactor" className="btn-primary">
              Start Refactoring
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* History List */}
            <div className="lg:col-span-1 space-y-4">
              {history.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  className={`card-hover ${selectedItem?._id === item._id ? 'border-blue-500 bg-blue-500/5' : ''}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FaClock className="text-xs" />
                      {formatDate(item.createdAt)}
                    </div>
                    <span className={`badge ${item.status === 'completed' ? 'badge-success' :
                      item.status === 'failed' ? 'badge-error' :
                        'badge-warning'
                      }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Instruction */}
                  <p className="text-white font-medium mb-3 line-clamp-2">
                    {item.instruction}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="badge-info">
                      {item.language}
                    </span>
                    {item.processingTime && (
                      <span className="text-green-400 text-sm font-semibold">
                        {(item.processingTime / 1000).toFixed(2)}s
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="btn-icon flex-1"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                      }}
                      className="btn-icon text-red-400 hover:text-red-300 hover:border-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors font-medium"
                  >
                    Previous
                  </button>
                  <span className="text-gray-400 font-semibold">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2">
              {selectedItem ? (
                <div className="card">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Refactoring Details
                  </h2>

                  {/* Info Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Instruction</p>
                      <p className="text-white font-medium">{selectedItem.instruction}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Language</p>
                      <span className="badge-info">{selectedItem.language}</span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Date</p>
                      <p className="text-white font-medium">{formatDate(selectedItem.createdAt)}</p>
                    </div>
                  </div>

                  {/* Code Comparison */}
                  <div className="space-y-6">
                    {/* Original Code */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        Original Code
                      </h3>
                      <CodeEditor
                        value={selectedItem.inputCode}
                        language={selectedItem.language}
                        readOnly={true}
                        height="300px"
                      />
                    </div>

                    {/* Refactored Code */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        Refactored Code
                      </h3>
                      <CodeEditor
                        value={selectedItem.refactoredCode}
                        language={selectedItem.language}
                        readOnly={true}
                        height="300px"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card flex flex-col items-center justify-center min-h-[400px] text-center">
                  <FaEye className="text-6xl text-gray-600 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Select a Refactor to View
                  </h3>
                  <p className="text-gray-400">
                    Click on any item from the history list to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;