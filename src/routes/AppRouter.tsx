import { createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage'
import { HomePage } from '../pages/public/HomePage'
import { DashboardPage } from '../pages/admin/DashboardPage'
import { UsersPage } from '../pages/admin/UsersPage'
import { ProgramsPage } from '../pages/admin/ProgramsPage'
import { ProgramDetailPage } from '../pages/admin/ProgramDetailPage'
import { EnrollmentPage } from '../pages/admin/EnrollmentPage'
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage'
import { MyEnrollmentsPage } from '../pages/student/MyEnrollmentsPage'
import { MyLessonsPage } from '../pages/student/MyLessonsPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { ROLES } from '../utils/constants'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: 'change-password', element: <ChangePasswordPage /> }],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={[ROLES.ADMIN]} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: 'admin', element: <DashboardPage /> },
              { path: 'admin/users', element: <UsersPage /> },
              { path: 'admin/programs', element: <ProgramsPage /> },
              { path: 'admin/programs/:programId', element: <ProgramDetailPage /> },
              { path: 'admin/enrollments', element: <EnrollmentPage /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allowedRoles={[ROLES.STUDENT]} />,
        children: [
          {
            element: <StudentLayout />,
            children: [
              { path: 'student', element: <StudentDashboardPage /> },
              { path: 'student/enrollments', element: <MyEnrollmentsPage /> },
              { path: 'student/lessons/:programId', element: <MyLessonsPage /> },
            ],
          },
        ],
      },
    ],
  },
])
