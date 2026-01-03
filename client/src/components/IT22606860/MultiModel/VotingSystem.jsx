import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown, FaStar } from 'react-icons/fa';

const VotingSystem = ({ models, onVote }) => {
    const [selectedModel, setSelectedModel] = useState(null);
    const [rating, setRating] = useState(0);

    const handleVote = (modelId, vote) => {
        if (onVote) {
            onVote(modelId, vote, rating);
        }
    };

    return (
        <div className="card">
            <h3 className="text-xl font-bold text-white mb-4">Vote for Best Model</h3>
            <p className="text-gray-300 mb-6">Help us improve by voting for the best refactoring</p>

            <div className="space-y-4">
                {models.map((model, index) => (
                    <div 
                        key={index}
                        className={`border rounded-lg p-4 transition ${
                            selectedModel === model.model_id
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 hover:border-gray-600'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-semibold">{model.model_name}</h4>
                                <p className="text-sm text-gray-400">Score: {model.totalScore}</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedModel(model.model_id);
                                        handleVote(model.model_id, 'up');
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                                >
                                    <FaThumbsUp /> Vote
                                </button>
                            </div>
                        </div>

                        {selectedModel === model.model_id && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <p className="text-sm text-gray-400 mb-2">Rate this refactoring:</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="transition"
                                        >
                                            <FaStar 
                                                className={`text-2xl ${
                                                    star <= rating ? 'text-yellow-500' : 'text-gray-600'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VotingSystem;