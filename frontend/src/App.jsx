import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import useAuth from './hooks/useAuth'
import Layout from './components/layout/Layout'
import { PageSpinner } from './components/ui/Spinner'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import StudentDashboard from './pages/student/Dashboard'
import StudentCourses from './pages/student/Courses'
import StudentCourseDetail from './pages/student/CourseDetail'
import ContentViewer from './pages/student/ContentViewer'
import Quiz from './pages/student/Quiz'
import StudentProgress from './pages/student/Progress'

import EducatorDashboard from './pages/educator/Dashboard'
import CourseForm from './pages/educator/CourseForm'
import ContentList from './pages/educator/ContentList'
import UploadContent from './pages/educator/UploadContent'
import StudentAnalytics from './pages/educator/StudentAnalytics'
import Assessments from './pages/educator/Assessments'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminAnalytics from './pages/admin/Analytics'

const ProtectedRoute = ({ role, children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  if (isLoading) return <PageSpinner />
  if (!isAuthenticated || (role && user?.role !== role)) return <Navigate to="/login" replace />
  return children
}

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route path="/student/*" element={
      <ProtectedRoute role="student">
        <Layout>
          <Routes>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="courses/:id" element={<StudentCourseDetail />} />
            <Route path="content/:id" element={<ContentViewer />} />
            <Route path="quiz/:courseId" element={<Quiz />} />
            <Route path="progress" element={<StudentProgress />} />
          </Routes>
        </Layout>
      </ProtectedRoute>
    } />

    <Route path="/educator/*" element={
      <ProtectedRoute role="educator">
        <Layout>
          <Routes>
            <Route path="dashboard" element={<EducatorDashboard />} />
            <Route path="courses/new" element={<CourseForm />} />
            <Route path="courses/:id/edit" element={<CourseForm />} />
            <Route path="courses/:id/content" element={<ContentList />} />
            <Route path="courses/:id/upload" element={<UploadContent />} />
            <Route path="students/:id/analytics" element={<StudentAnalytics />} />
            <Route path="assessments" element={<Assessments />} />
          </Routes>
        </Layout>
      </ProtectedRoute>
    } />

    <Route path="/admin/*" element={
      <ProtectedRoute role="admin">
        <Layout>
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Routes>
        </Layout>
      </ProtectedRoute>
    } />
  </Routes>
)

export default App
