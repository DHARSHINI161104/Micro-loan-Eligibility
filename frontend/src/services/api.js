import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const calculateScore = async (userData) => {
  const response = await api.post('/calculate-score', userData);
  return response.data;
};

export const checkFraud = async (financialData) => {
  const response = await api.post('/fraud-check', financialData);
  return response.data;
};

export const getAIExplanation = async (scoreData, language = 'en') => {
  const response = await api.post('/ai-explanation', {
    ...scoreData,
    language,
  });
  return response.data;
};

export const matchLoans = async (totalScore, monthlyEarnings) => {
  const response = await api.post('/loan-match', {
    total_score: totalScore,
    monthly_earnings: monthlyEarnings,
  });
  return response.data;
};

export const getScoreHistory = async (userId) => {
  const response = await api.get(`/score-history/${userId}`);
  return response.data;
};

export const whatIfSimulate = async (simulationData) => {
  const response = await api.post('/whatif-simulate', simulationData);
  return response.data;
};

export const getDocumentChecklist = async (gigPlatform = 'other') => {
  const response = await api.get('/document-checklist', {
    params: { gig_platform: gigPlatform },
  });
  return response.data;
};

export default api;
