import api from './axios'

export const getStudentDashboard = () => api.get('/student/dashboard')
export const getStudentCourses = () => api.get('/student/courses')
export const enrollCourse = (courseId) => api.post(`/student/courses/${courseId}/enroll`)
export const getCourseDetail = (courseId) => api.get(`/student/courses/${courseId}`)
export const startContent = (contentId) => api.post(`/student/content/${contentId}/start`)
export const completeContent = (contentId, payload) => api.post(`/student/content/${contentId}/complete`, payload)
export const getContent = (contentId) => api.get(`/student/content/${contentId}`)
export const getQuiz = (courseId, milestone) => api.get(`/student/quiz/${courseId}`, { params: milestone ? { milestone } : {} })
export const submitQuiz = (courseId, payload) => api.post(`/student/quiz/${courseId}/submit`, payload)
export const getProgress = () => api.get('/student/progress')
