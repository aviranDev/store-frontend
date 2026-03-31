import './assets/main.css'

import { createRoot } from 'react-dom/client'
import App from './App'
import AuthProvider from './Store/LoginProvider'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
