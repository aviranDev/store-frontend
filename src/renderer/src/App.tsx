import { useLogin } from './Store/LoginProvider'
import ProtectedRoute from './ProtectedRoute'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Register from './Pages/Register'

import PublicRoute from './PublicRoute'

import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from './styles/GlobalStyles'
import { win95Theme } from './styles/theme'

function App(): React.JSX.Element {
  const { isLoggedIn } = useLogin()

  console.log('isLoggedIn: ', isLoggedIn)

  return (
    <ThemeProvider theme={win95Theme}>
      <GlobalStyles />
      <GlobalStyles />
      <HashRouter>
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
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
