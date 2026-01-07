// ============================================
// client/src/pages/Home.jsx (Tailwind)
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import { FaRocket, FaCode, FaHistory, FaLightbulb, FaMagic, FaChartLine } from 'react-icons/fa';

const Home = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 py-20">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
                            AI-Powered Code Refactoring
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed">
                            Transform your code with advanced AI technology.
                            Improve readability, efficiency, and maintainability instantly.
                        </p>
                        <Link
                            to="/refactor"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-full hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-glow-blue"
                        >
                            <FaRocket className="text-2xl" />
                            Start Refactoring Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-900">
                <div className="container-custom">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
                        Powerful Features
                    </h2>
                    <p className="text-center text-gray-400 mb-16 text-lg">
                        Everything you need to improve your code quality
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card-hover group">
                            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-6 group-hover:scale-110 transition-transform shadow-glow-blue">
                                <FaCode className="text-3xl text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Smart Refactoring
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                AI-powered analysis to improve code quality, structure, and performance with industry best practices.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card-hover group">
                            <div className="flex items-center justify-center w-16 h-16 bg-purple-600 rounded-lg mb-6 group-hover:scale-110 transition-transform shadow-glow-purple">
                                <FaLightbulb className="text-3xl text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Best Practices
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Applies industry-standard coding patterns, conventions, and modern programming techniques.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card-hover group">
                            <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-lg mb-6 group-hover:scale-110 transition-transform shadow-glow-green">
                                <FaHistory className="text-3xl text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                History Tracking
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Keep track of all your refactoring sessions with detailed history and easy access to past work.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card-hover group">
                            <div className="flex items-center justify-center w-16 h-16 bg-yellow-600 rounded-lg mb-6 group-hover:scale-110 transition-transform">
                                <FaMagic className="text-3xl text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Multiple Languages
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Support for JavaScript, Python, Java, C++, TypeScript, and more programming languages.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="card-hover group">
                            <div className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-lg mb-6 group-hover:scale-110 transition-transform">
                                <FaChartLine className="text-3xl text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Performance Boost
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Optimize your code for better performance, reduced complexity, and improved maintainability.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="card-hover group">
                            <div className="flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-lg mb-6 group-hover:scale-110 transition-transform">
                                <FaCode className="text-3xl text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Real-time Preview
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                See refactored code instantly with side-by-side comparison and syntax highlighting.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gray-850">
                <div className="container-custom">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
                        How It Works
                    </h2>
                    <p className="text-center text-gray-400 mb-16 text-lg">
                        Three simple steps to better code
                    </p>

                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Step 1 */}
                            <div className="text-center group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-glow-blue group-hover:scale-110 transition-transform">
                                        1
                                    </div>
                                    {/* Connector Line */}
                                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    Paste Your Code
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Copy and paste the code you want to refactor into the editor.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="text-center group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-glow-purple group-hover:scale-110 transition-transform">
                                        2
                                    </div>
                                    {/* Connector Line */}
                                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-600 to-pink-600"></div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    Add Instructions
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Provide specific instructions or use our smart default settings.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="text-center group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-600 to-red-600 rounded-full flex items-center justify-center text-3xl font-bold text-white group-hover:scale-110 transition-transform">
                                        3
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">
                                    Get Results
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Receive optimized, refactored code instantly with improvements.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center mt-16">
                        <Link
                            to="/refactor"
                            className="btn-primary text-lg shadow-glow-blue"
                        >
                            <FaMagic />
                            Try It Now - It's Free!
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">10K+</div>
                            <div className="text-blue-100">Refactors</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">5+</div>
                            <div className="text-blue-100">Languages</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">99%</div>
                            <div className="text-blue-100">Success Rate</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2">2s</div>
                            <div className="text-blue-100">Avg. Time</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;