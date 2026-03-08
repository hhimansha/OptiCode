// ============================================
// client/src/component/IT22606860/RefactorAssistantChat.jsx
// AI Chatbot Assistant for Code Refactoring Guidance
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaTrash, FaCode, FaLightbulb, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import { BiCodeBlock } from 'react-icons/bi';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../../services/api';
import toast from 'react-hot-toast';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const RefactorAssistantChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const quickQuestions = [
    {
      icon: <FaCode className="text-blue-500" />,
      text: "How did you refactor this code?",
      query: "Explain the refactoring approach you used for the code"
    },
    {
      icon: <FaExclamationTriangle className="text-red-500" />,
      text: "What are the risks in this code?",
      query: "Analyze and identify potential risks and vulnerabilities in the code"
    },
    {
      icon: <FaLightbulb className="text-yellow-500" />,
      text: "How can I improve my refactoring skills?",
      query: "Give me tips and best practices to improve my code refactoring skills"
    },
    {
      icon: <FaChartLine className="text-green-500" />,
      text: "How to increase code performance?",
      query: "Suggest ways to optimize and improve the performance of my code"
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await getChatHistory();
      if (response.success && response.history) {
        setChatHistory(response.history);
        setMessages(response.history);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
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
      const response = await sendChatMessage(message, messages);
      
      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.message,
          metadata: response.metadata,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from AI assistant');
      
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

  const handleQuickQuestion = (query) => {
    setInputMessage(query);
    handleSendMessage(query);
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory();
      setMessages([]);
      setChatHistory([]);
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Failed to clear chat:', error);
      toast.error('Failed to clear chat history');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageContent = (content) => {
    // Check if content contains code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'javascript',
        content: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }

    // If no code blocks found, return plain text
    if (parts.length === 0) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    return (
      <div className="space-y-3">
        {parts.map((part, index) => (
          part.type === 'code' ? (
            <div key={index} className="rounded-lg overflow-hidden border border-gray-700">
              <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 flex items-center gap-2">
                <BiCodeBlock />
                <span>{part.language}</span>
              </div>
              <SyntaxHighlighter
                language={part.language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem'
                }}
              >
                {part.content}
              </SyntaxHighlighter>
            </div>
          ) : (
            <p key={index} className="whitespace-pre-wrap">{part.content}</p>
          )
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <FaRobot className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Refactor Assistant</h2>
              <p className="text-sm text-indigo-100">Your AI-powered code refactoring guide</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors backdrop-blur-sm"
            >
              <FaTrash />
              <span>Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length === 0 && (
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question.query)}
                className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl flex items-center gap-3 transition-all transform hover:scale-105 border border-gray-700 hover:border-indigo-500"
              >
                <div className="text-2xl">{question.icon}</div>
                <span className="text-left text-sm">{question.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-lg">
                  <FaRobot className="text-white text-xl" />
                </div>
              </div>
            )}

            <div
              className={`max-w-3xl rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : message.isError
                  ? 'bg-red-900/50 text-red-100 border border-red-700'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
            >
              {renderMessageContent(message.content)}
              
              {message.metadata && (
                <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>Analysis Type: {message.metadata.analysisType || 'General'}</span>
                  </div>
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                  <FaUser className="text-white text-xl" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-lg">
                <FaRobot className="text-white text-xl" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-2xl px-4 py-3 border border-gray-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-gray-400 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gray-900 border-t border-gray-700">
        <div className="flex gap-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about code refactoring, risks, performance, or best practices..."
            className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
          >
            <FaPaperPlane />
            <span className="font-medium">Send</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default RefactorAssistantChat;
