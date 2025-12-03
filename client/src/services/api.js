// API service for refactoring history
const API_BASE_URL = 'http://localhost:5000/api';

export const getHistory = async (page = 1, limit = 10) => {
    try {
        const response = await fetch(`${API_BASE_URL}/history?page=${page}&limit=${limit}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
};

export const deleteHistory = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/history/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting history:', error);
        throw error;
    }
};

export const clearAllHistory = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/history/clear`, {
            method: 'DELETE',
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error clearing history:', error);
        throw error;
    }
};

export const refactorCode = async (code, instruction, language) => {
    try {
        const response = await fetch(`${API_BASE_URL}/refactor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, instruction, language }),
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error refactoring code:', error);
        throw error;
    }
};
