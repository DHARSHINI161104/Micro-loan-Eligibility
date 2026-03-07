import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerUser = async (data) => {
  const response = await api.post('/user/register', data);
  return response.data;
};

export const saveFinancialData = async (data) => {
  const response = await api.post('/user/financial-data', data);
  return response.data;
};

export const getScoreHistory = async (userId) => {
  const response = await api.get(`/user/score-history?user_id=${userId}`);
  return response.data;
};

export const getLoanMatcher = async (data) => {
  const response = await api.post('/loan-matcher', data);
  return response.data;
};

export const getChatbotResponse = async (message, language) => {
  const response = await api.post('/chatbot', { message, language });
  return response.data;
};

export const calculateScore = async (data) => {
  const response = await api.post('/calculate-score', data);
  return response.data;
};

export default api;
