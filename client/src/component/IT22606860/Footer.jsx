import React from 'react';
import { FaGithub, FaHeart } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
            <div className="container-custom py-6">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    {/* Copyright */}
                    <div className="text-gray-400 text-sm text-center sm:text-left">
                        <p>© {currentYear} Code Refactor AI. All rights reserved.</p>
                    </div>

                    {/* Powered By */}
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span>Made with</span>
                        <FaHeart className="text-red-500 animate-pulse" />
                        <span>using CodeT5 AI Model</span>
                    </div>

                    {/* GitHub Link */}
                    <a
                        href="https://github.com/yourusername/code-refactor-ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                        <FaGithub className="text-xl" />
                        <span className="text-sm font-medium hidden sm:block">GitHub</span>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;