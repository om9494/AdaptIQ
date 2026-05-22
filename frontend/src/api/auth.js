import api from './axios'

export const registerUser = (payload) => api.post('/auth/register', payload)
export const loginUser = (payload) => api.post('/auth/login', payload)
export const getMe = () => api.get('/auth/me')
export const updateProfile = (payload) => api.put('/auth/profile', payload)
export const logoutUser = () => api.post('/auth/logout')
