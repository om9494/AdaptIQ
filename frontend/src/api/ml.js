import api from './axios'

export const recommendContent = (payload) => api.post('/api/recommend', payload)
export const generateLearningPath = (payload) => api.post('/api/learning-path', payload)
export const getKnowledgeState = (studentId) => api.get(`/api/knowledge-state/${studentId}`)
export const updateKnowledge = (payload) => api.post('/api/update-knowledge', payload)
export const predictEngagement = (studentId, contentId) => api.get(`/api/engagement-prediction/${studentId}/${contentId}`)
export const generateQuiz = (payload) => api.post('/api/quiz/generate', payload)
export const getProgress = (studentId) => api.get(`/api/progress/${studentId}`)
