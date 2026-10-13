import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from '../components/common/ProtectedRoute'
import AuthProvider from '../features/auth/AuthProvider'
import AuthPage from '../features/auth/pages/AuthPage'
import AdminPage from '../features/admin/pages/AdminPage'
import CoursesPage from '../features/courses/pages/CoursesPage'
import MyCoursesPage from '../features/courses/pages/MyCoursesPage'
import CourseDetailPage from '../features/courses/pages/CourseDetailPage'

export default function App() {
  return <AuthProvider><BrowserRouter><Toaster position="top-right" toastOptions={{ duration: 3200 }} /><AppLayout><Routes><Route path="/" element={<Navigate to="/courses" replace />} /><Route path="/login" element={<AuthPage />} /><Route path="/register" element={<AuthPage mode="register" />} /><Route path="/courses" element={<CoursesPage />} /><Route path="/courses/:courseId" element={<CourseDetailPage />} /><Route path="/my-courses" element={<ProtectedRoute><MyCoursesPage /></ProtectedRoute>} /><Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} /><Route path="*" element={<Navigate to="/courses" replace />} /></Routes></AppLayout></BrowserRouter></AuthProvider>
}
