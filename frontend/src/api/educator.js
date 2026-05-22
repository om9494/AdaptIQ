import api from './axios'

export const getEducatorDashboard = () => api.get('/educator/dashboard')
export const createCourse = (payload) => api.post('/educator/courses', payload)
export const getCourse = (courseId) => api.get(`/educator/courses/${courseId}`)
export const updateCourse = (courseId, payload) => api.put(`/educator/courses/${courseId}`, payload)
export const togglePublish = (courseId) => api.patch(`/educator/courses/${courseId}/publish`)
export const getCourseContent = (courseId) => api.get(`/educator/courses/${courseId}/content`)
export const uploadContent = (courseId, formData) => api.post(`/educator/courses/${courseId}/content/upload`, formData)
export const extractTags = (formData) => api.post('/educator/content/extract-tags', formData)
export const deleteContent = (contentId) => api.delete(`/educator/content/${contentId}`)
export const getCourseStudents = (courseId) => api.get(`/educator/courses/${courseId}/students`)
export const getStudentAnalytics = (studentId) => api.get(`/educator/students/${studentId}/analytics`)
export const getAssessments = () => api.get('/educator/assessments')
