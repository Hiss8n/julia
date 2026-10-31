
import { useEffect} from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ChatPage from './ChatPage'
import Admin from './components/admin'
import Login from './components/login'
import SignUp from './components/sign-up'
import { useAuthStore } from './store/authStore'
import './index.css'

/*  function ProtectedRoute({ children }: { children: ReactNode }) {
   const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
   const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth) 
  const token = useAuthStore((state) => state.token)

  if ( !token) return <main className="login-shell" aria-live="polite">Checking your session…</main>
  return token? children : <Navigate to="/login" replace />
} */
 
export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const token = useAuthStore((state) => state.token)

  console.log("tok:",token)

  useEffect(() => {
    void checkAuth()
  }, [checkAuth])

  return (
      <Routes>
        <Route path="/" element={token?<ChatPage />:<Navigate to={"/sign-up"} />} />
        <Route path="/sign-up" element={!token?<SignUp />:<Navigate to={"/chat"} />} />
        <Route path="/login" element={!token?<Login />:<Navigate to={"/chat"} />} />
        <Route path="/sign-in" element={!token?<Login />:<Navigate to={"/chat"} />} />
        <Route path="/chat" element={token?<ChatPage />:<Navigate to={"/sign-up"} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/login"  />} />
      </Routes>
  )
}
