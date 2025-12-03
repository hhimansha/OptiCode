// client/src/pages/History.jsx
import React, { useState, useEffect } from 'react';
import { FaTrash, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getHistory, deleteHistory, clearAllHistory } from '../../services/api';
import CodeEditor from '../../components/CodeEditor';
import '../../styles/History.css';

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
    if (!window.confirm('Are you sure you want to clear all history?')) {
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
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="container">
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="container">
        <div className="history-header">
          <h1>Refactoring History</h1>
          {history.length > 0 && (
            <button onClick={handleClearAll} className="danger-button">
              <FaTrash /> Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <p>No refactoring history yet. Start by refactoring some code!</p>
          </div>
        ) : (
          <>
            <div className="history-list">
              {history.map((item) => (
                <div
                  key={item._id}
                  className={`history-item ${selectedItem?._id === item._id ? 'active' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="history-item-header">
                    <span className="history-date">{formatDate(item.createdAt)}</span>
                    <span className={`status-badge ${item.status}`}>{item.status}</span>
                  </div>
                  <p className="history-instruction">{item.instruction}</p>
                  <div className="history-item-footer">
                    <span className="language-badge">{item.language}</span>
                    {item.processingTime && (
                      <span className="processing-time">
                        {(item.processingTime / 1000).toFixed(2)}s
                      </span>
                    )}
                    <div className="history-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="icon-button"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item._id);
                        }}
                        className="icon-button danger"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}

            {selectedItem && (
              <div className="history-detail">
                <h2>Details</h2>
                <div className="detail-info">
                  <p><strong>Instruction:</strong> {selectedItem.instruction}</p>
                  <p><strong>Language:</strong> {selectedItem.language}</p>
                  <p><strong>Date:</strong> {formatDate(selectedItem.createdAt)}</p>
                </div>

                <div className="code-comparison">
                  <div className="code-section">
                    <h3>Original Code</h3>
                    <CodeEditor
                      value={selectedItem.inputCode}
                      language={selectedItem.language}
                      readOnly={true}
                      height="300px"
                    />
                  </div>

                  <div className="code-section">
                    <h3>Refactored Code</h3>
                    <CodeEditor
                      value={selectedItem.refactoredCode}
                      language={selectedItem.language}
                      readOnly={true}
                      height="300px"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;