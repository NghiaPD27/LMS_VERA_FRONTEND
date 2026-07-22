import { createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { TeacherLayout } from '../layouts/TeacherLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ChangePasswordPage } from '../pages/auth/ChangePasswordPage'
import { HomePage } from '../pages/public/HomePage'
import { CoursesPage } from '../pages/public/CoursesPage'
import { CourseDetailPage } from '../pages/public/CourseDetailPage'
import { DashboardPage } from '../pages/admin/DashboardPage'
import { UsersPage } from '../pages/admin/UsersPage'
import { ProgramsPage } from '../pages/admin/ProgramsPage'
import { ProgramDetailPage } from '../pages/admin/ProgramDetailPage'
import { EnrollmentPage } from '../pages/admin/EnrollmentPage'
import { PurchasesPage } from '../pages/admin/PurchasesPage'
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage'
import { MyEnrollmentsPage } from '../pages/student/MyEnrollmentsPage'
import { MyLessonsPage } from '../pages/student/MyLessonsPage'
import { MyPurchasesPage } from '../pages/student/MyPurchasesPage'
import { PurchaseDetailPage } from '../pages/student/PurchaseDetailPage'
import { TeacherAvailabilityPage } from '../pages/teacher/TeacherAvailabilityPage'
import { TeacherBookingsPage } from '../pages/teacher/TeacherBookingsPage'
import { TeacherDashboardPage } from '../pages/teacher/TeacherDashboardPage'
import { TeacherStudentsPage } from '../pages/teacher/TeacherStudentsPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { ROLES } from '../utils/constants'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/courses',
    element: <CoursesPage />,
  },
  {
    path: '/courses/:programId',
    element: <CourseDetailPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
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
              { path: 'admin/purchases', element: <PurchasesPage /> },
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
              { path: 'student/courses', element: <CoursesPage embedded courseBasePath="/student/courses" /> },
              { path: 'student/courses/:programId', element: <CourseDetailPage embedded courseBasePath="/student/courses" /> },
              { path: 'student/purchases', element: <MyPurchasesPage /> },
              { path: 'student/purchases/:purchaseId', element: <PurchaseDetailPage /> },
              { path: 'student/enrollments', element: <MyEnrollmentsPage /> },
              { path: 'student/lessons/:programId', element: <MyLessonsPage /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allowedRoles={[ROLES.TEACHER]} />,
        children: [
          {
            element: <TeacherLayout />,
            children: [
              { path: 'teacher', element: <TeacherDashboardPage /> },
              { path: 'teacher/bookings', element: <TeacherBookingsPage /> },
              { path: 'teacher/availability', element: <TeacherAvailabilityPage /> },
              { path: 'teacher/students', element: <TeacherStudentsPage /> },
            ],
          },
        ],
      },
    ],
  },
])
