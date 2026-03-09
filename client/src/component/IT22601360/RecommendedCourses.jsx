/**
 * Recommended Courses Component
 * Student: IT22601360
 * 
 * Displays course recommendations based on extracted concepts
 */

import React, { useState } from 'react';

const RecommendedCourses = ({ concepts, language }) => {
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');

    // Dummy course data based on detected concepts
    const courses = [
        {
            id: 1,
            title: 'Python Data Structures & Algorithms',
            provider: 'Coursera',
            instructor: 'Stanford University',
            difficulty: 'intermediate',
            duration: '6 weeks',
            rating: 4.8,
            enrolled: 125000,
            thumbnail: '🎓',
            topics: ['Arrays', 'Linked Lists', 'Trees', 'Sorting', 'Searching'],
            match: 95,
            url: '#'
        },
        {
            id: 2,
            title: 'Advanced Python Programming',
            provider: 'edX',
            instructor: 'MIT',
            difficulty: 'advanced',
            duration: '8 weeks',
            rating: 4.9,
            enrolled: 89000,
            thumbnail: '🚀',
            topics: ['OOP', 'Design Patterns', 'Async/Await', 'Decorators'],
            match: 92,
            url: '#'
        },
        {
            id: 3,
            title: 'Binary Search & Divide-and-Conquer',
            provider: 'Udemy',
            instructor: 'William Fiset',
            difficulty: 'intermediate',
            duration: '4 weeks',
            rating: 4.7,
            enrolled: 67000,
            thumbnail: '🔍',
            topics: ['Binary Search', 'Recursion', 'Time Complexity'],
            match: 88,
            url: '#'
        },
        {
            id: 4,
            title: 'Python for Beginners',
            provider: 'Codecademy',
            instructor: 'Codecademy Team',
            difficulty: 'beginner',
            duration: '3 weeks',
            rating: 4.6,
            enrolled: 234000,
            thumbnail: '📚',
            topics: ['Python Basics', 'Functions', 'Classes', 'Lists'],
            match: 78,
            url: '#'
        },
        {
            id: 5,
            title: 'Object-Oriented Design Patterns',
            provider: 'LinkedIn Learning',
            instructor: 'Elisabeth Robson',
            difficulty: 'intermediate',
            duration: '5 weeks',
            rating: 4.8,
            enrolled: 45000,
            thumbnail: '🎨',
            topics: ['Singleton', 'Factory', 'Observer', 'Strategy'],
            match: 85,
            url: '#'
        },
        {
            id: 6,
            title: 'Stack & Queue Mastery',
            provider: 'YouTube',
            instructor: 'freeCodeCamp',
            difficulty: 'beginner',
            duration: '2 weeks',
            rating: 4.9,
            enrolled: 156000,
            thumbnail: '📦',
            topics: ['Stack', 'Queue', 'Implementation', 'Applications'],
            match: 82,
            url: '#'
        }
    ];

    // Filter by difficulty
    const filteredCourses = selectedDifficulty === 'all' 
        ? courses 
        : courses.filter(c => c.difficulty === selectedDifficulty);

    // Sort by match score
    const sortedCourses = [...filteredCourses].sort((a, b) => b.match - a.match);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
            case 'intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'advanced': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getMatchColor = (match) => {
        if (match >= 90) return 'text-green-600';
        if (match >= 80) return 'text-blue-600';
        return 'text-yellow-600';
    };

    return (
        <div className="h-full flex flex-col bg-slate-900">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="text-2xl">🎓</span>
                        Recommended Learning Paths
                    </h3>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                        {sortedCourses.length} courses
                    </span>
                </div>
                
                {/* Difficulty Filter */}
                <div className="flex gap-2 flex-wrap">
                    {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                        <button
                            key={level}
                            onClick={() => setSelectedDifficulty(level)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                selectedDifficulty === level
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 border border-slate-700'
                            }`}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Courses List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {sortedCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <span className="text-6xl mb-4">📚</span>
                        <p className="text-lg">No courses found</p>
                    </div>
                ) : (
                    sortedCourses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-slate-800 rounded-xl p-5 shadow-lg hover:shadow-xl border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                        >
                            {/* Course Header */}
                            <div className="flex items-start gap-4 mb-3">
                                <div className="text-4xl group-hover:scale-110 transition-transform">
                                    {course.thumbnail}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                            {course.title}
                                        </h4>
                                        <div className="flex items-center gap-1">
                                            <span className={`text-2xl font-bold ${getMatchColor(course.match)}`}>
                                                {course.match}%
                                            </span>
                                            <span className="text-xs text-gray-500">match</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            {course.provider}
                                        </span>
                                        <span>•</span>
                                        <span>{course.instructor}</span>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(course.difficulty)}`}>
                                            {course.difficulty}
                                        </span>
                                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                            ⏱️ {course.duration}
                                        </span>
                                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                                            ⭐ {course.rating}
                                        </span>
                                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                            👥 {(course.enrolled / 1000).toFixed(0)}K enrolled
                                        </span>
                                    </div>

                                    {/* Topics */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {course.topics.map((topic, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200/50"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg">
                                <span>View Course</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Info */}
            <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Courses recommended based on your code analysis</span>
                </div>
            </div>
        </div>
    );
};

export default RecommendedCourses;