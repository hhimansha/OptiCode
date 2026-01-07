// ============================================
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCode } from 'react-icons/fa';

const Header = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 z-50 shadow-lg">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 text-blue-400 hover:text-blue-300 transition-colors group"
                    >
                        <FaCode className="text-3xl group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-bold hidden sm:block">
                            Code Refactor AI
                        </span>
                        <span className="text-xl font-bold sm:hidden">
                            CR AI
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex gap-1 sm:gap-2">
                        <Link
                            to="/"
                            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive('/')
                                ? 'bg-blue-600 text-white shadow-glow-blue'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/refactor"
                            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive('/refactor')
                                ? 'bg-blue-600 text-white shadow-glow-blue'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            Refactor
                        </Link>
                        <Link
                            to="/history"
                            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive('/history')
                                ? 'bg-blue-600 text-white shadow-glow-blue'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            History
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
