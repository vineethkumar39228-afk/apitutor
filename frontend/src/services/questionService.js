import api from './api';

export const getAllQuestions = async () => {
    try {
        const response = await api.get('/questions');
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch questions';
    }
};