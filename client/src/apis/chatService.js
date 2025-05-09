import axios from 'axios';

const API_URL = 'http://localhost:5000/api/chat';

// Set up axios instance with auth token.
const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getContacts = async () => {
    try {
        const response = await api.get('/contacts');
        return response.data;
    } catch (error) {
        console.error('Error fetching contacts:', error);
        throw error;
    }
};

export const getMessages = async (receiverId) => {
    try {
        const response = await api.get(`/messages/${receiverId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

export const sendMessage = async (receiverId, content) => {
    try {
        // Ensure we're sending the data in the correct format
        const payload = {
            receiverId: receiverId, 
            content: content
        };

        const response = await api.post('/messages', payload);
        return response.data;
    } catch (error) {
        console.error('Error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};