import api from './axios'

export const getAdminDashboard = () => api.get('/admin/dashboard')
export const listUsers = (role) => api.get('/admin/users', { params: role ? { role } : {} })
export const toggleUserStatus = (userId) => api.patch(`/admin/users/${userId}/deactivate`)
export const changeUserRole = (userId, payload) => api.patch(`/admin/users/${userId}/role`, payload)
export const listCourses = () => api.get('/admin/courses')
export const assignCourseToStudents = (payload) => api.post('/admin/assignments', payload)
export const getAdminAnalytics = () => api.get('/admin/analytics')
