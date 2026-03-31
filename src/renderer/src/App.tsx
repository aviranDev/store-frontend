import Login from './Pages/Login'
import { useLogin } from './Store/LoginProvider'
import ProtectedRoute from './ProtectedRoute'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import PublicRoute from './PublicRoute'

function App(): React.JSX.Element {
  const { isLoggedIn } = useLogin()

  console.log(isLoggedIn)

  return (
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
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  )
}

export default App
