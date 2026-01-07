import React from 'react';
import { FaCode } from 'react-icons/fa';

const LoadingSpinner = ({ message = 'Processing...' }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            {/* Animated Icon */}
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                <div className="relative bg-gray-800 p-6 rounded-full border-4 border-blue-500 shadow-glow-blue">
                    <FaCode className="text-5xl text-blue-400 animate-pulse" />
                </div>
            </div>

            {/* Spinner */}
            <div className="spinner"></div>

            {/* Message */}
            <p className="text-gray-300 text-lg font-medium animate-pulse">
                {message}
            </p>

            {/* Progress Indicator */}
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;