// ============================================
// FloatingChatAssistant.jsx
// Floating chat bubble with slide-out panel for RefactorPage
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUser, FaTrash, FaCode, FaLightbulb, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import { BiMessageRoundedDots } from 'react-icons/bi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { sendChatMessage } from '../../services/api';

const FloatingChatAssistant = ({ originalCode = '', refactoredCode = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const quickQuestions = [
        {
            icon: <FaCode className="text-blue-400" />,
            text: "Explain the refactoring",
            query: "Explain what refactoring changes were made to my code and why they improve it."
        },
        {
            icon: <FaShieldAlt className="text-red-400" />,
            text: "What are the risks?",
            query: "What are the potential risks or issues with these code changes?"
        },
        {
            icon: <FaChartLine className="text-green-400" />,
            text: "How to improve performance?",
            query: "How can I further optimize the performance of this code?"
        },
        {
            icon: <FaLightbulb className="text-yellow-400" />,
            text: "Best practices tips",
            query: "What Python best practices should I apply to improve this code further?"
        }
    ];

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (message = inputMessage) => {
        if (!message.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Send message with code context
            const response = await sendChatMessageWithContext(message, messages, {
                original_code: originalCode,
                refactored_code: refactoredCode
            });

            if (response.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: response.message || response.response,
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error(response.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Extended sendChatMessage with code context
    const sendChatMessageWithContext = async (message, history, codeContext) => {
        try {
            const response = await fetch('http://localhost:8001/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    history: history.slice(-10),
                    code_context: codeContext
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Chat API error:', error);
            return {
                success: false,
                error: error.message || 'Failed to connect to chat service'
            };
        }
    };

    const handleQuickQuestion = (query) => {
        handleSendMessage(query);
    };

    const handleClearChat = () => {
        setMessages([]);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const renderMessageContent = (content) => {
        const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: content.substring(lastIndex, match.index)
                });
            }
            parts.push({
                type: 'code',
                language: match[1] || 'python',
                content: match[2].trim()
            });
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < content.length) {
            parts.push({
                type: 'text',
                content: content.substring(lastIndex)
            });
        }

        if (parts.length === 0) {
            return <p className="whitespace-pre-wrap text-sm">{content}</p>;
        }

        return (
            <div className="space-y-2">
                {parts.map((part, index) => (
                    part.type === 'code' ? (
                        <div key={index} className="rounded-lg overflow-hidden border border-slate-600">
                            <div className="bg-slate-700 px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2">
                                <FaCode className="text-blue-400" />
                                <span>{part.language}</span>
                            </div>
                            <SyntaxHighlighter
                                language={part.language}
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    padding: '0.75rem',
                                    fontSize: '0.75rem',
                                    background: '#1e293b'
                                }}
                            >
                                {part.content}
                            </SyntaxHighlighter>
                        </div>
                    ) : (
                        <p key={index} className="whitespace-pre-wrap text-sm">{part.content}</p>
                    )
                ))}
            </div>
        );
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-full shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 transform hover:scale-110 ${isOpen ? 'hidden' : 'flex'} items-center justify-center group`}
            >
                <BiMessageRoundedDots className="text-2xl" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
                
                {/* Tooltip */}
                <span className="absolute right-full mr-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-slate-700">
                    Ask AI Assistant
                </span>
            </button>

            {/* Chat Panel - No Overlay, Just Floating Panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col" style={{ width: '400px', maxWidth: 'calc(100vw - 48px)' }}>
                    {/* Chat Panel */}
                    <div 
                        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600 rounded-2xl shadow-2xl shadow-purple-500/20 flex flex-col overflow-hidden"
                        style={{
                            height: '600px',
                            maxHeight: 'calc(100vh - 100px)',
                            animation: 'slideUp 0.3s ease-out'
                        }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                                    <FaRobot className="text-xl text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Refactor Assistant</h3>
                                    <p className="text-indigo-100 text-xs">AI-powered code guidance</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {messages.length > 0 && (
                                    <button
                                        onClick={handleClearChat}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                        title="Clear chat"
                                    >
                                        <FaTrash className="text-white/80" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <FaTimes className="text-white text-lg" />
                                </button>
                            </div>
                        </div>

                        {/* Code Context Indicator */}
                        {(originalCode || refactoredCode) && (
                            <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2 text-xs text-slate-400">
                                <FaCode className="text-cyan-400" />
                                <span>Code context active - AI can see your code</span>
                            </div>
                        )}

                        {/* Quick Questions (show when empty) */}
                        {messages.length === 0 && (
                            <div className="p-4 space-y-3 border-b border-slate-700/50">
                                <p className="text-sm text-slate-400 font-medium">Quick Questions:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {quickQuestions.map((q, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuickQuestion(q.query)}
                                            className="flex items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-indigo-500/50 rounded-xl text-left transition-all text-xs"
                                        >
                                            <span className="text-lg">{q.icon}</span>
                                            <span className="text-slate-300">{q.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 rounded-lg">
                                                <FaRobot className="text-white text-sm" />
                                            </div>
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                            message.role === 'user'
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                                : message.isError
                                                ? 'bg-red-900/50 text-red-100 border border-red-700'
                                                : 'bg-slate-800 text-slate-100 border border-slate-700'
                                        }`}
                                    >
                                        {renderMessageContent(message.content)}
                                    </div>

                                    {message.role === 'user' && (
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-1.5 rounded-lg">
                                                <FaUser className="text-white text-sm" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex gap-2">
                                    <div className="flex-shrink-0">
                                        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 rounded-lg">
                                            <FaRobot className="text-white text-sm" />
                                        </div>
                                    </div>
                                    <div className="bg-slate-800 rounded-2xl px-4 py-3 border border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                            </div>
                                            <span className="text-slate-400 text-sm">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-900 border-t border-slate-700">
                            <div className="flex gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask about your code..."
                                    className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none text-sm"
                                    rows="2"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Press Enter to send • Shift+Enter for new line
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS for slide animation */}
            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
};

export default FloatingChatAssistant;
