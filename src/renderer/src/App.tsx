import React, { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { useLogin } from './Store/LoginProvider'
import { getDefaultRouteByRole } from './utils/routeHelpers'

import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

import { GlobalStyles } from './styles/GlobalStyles'
import { win95Theme } from './styles/theme'

const LoadingPlanPage = lazy(() => import('./Pages/LoadingPlanPage'))
const Login = lazy(() => import('./Pages/Login'))
const Register = lazy(() => import('./Pages/Register'))
const AdminDashboard = lazy(() => import('./Dashboards/AdminDashboard'))
const EmployeeDashboard = lazy(() => import('./Dashboards/EmployeeDashboard'))
const CustomerDashboard = lazy(() => import('./Dashboards/CustomerDashboard'))
const Unauthorized = lazy(() => import('./Pages/Unauthorized'))
const UserAccount = lazy(() => import('./Pages/UserAccount'))

function LoadingScreen() {
  return <div>Loading...</div>
}

function RoleHomeRedirect() {
  const { user } = useLogin()
  return <Navigate to={getDefaultRouteByRole(user?.role)} replace />
}

function App(): React.JSX.Element {
  return (
    <ThemeProvider theme={win95Theme}>
      <GlobalStyles />
      <HashRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleHomeRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/EmployeeLoadingPlan"
              element={
                <ProtectedRoute allowedRoles={['employee', 'admin']}>
                  <LoadingPlanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={['employee', 'admin']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer"
              element={
                <ProtectedRoute allowedRoles={['customer', 'employee', 'admin']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute allowedRoles={['customer', 'employee', 'admin']}>
                  <UserAccount />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
