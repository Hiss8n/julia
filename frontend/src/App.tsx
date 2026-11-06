import { useEffect, type ReactNode} from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ChatPage from './ChatPage'
import Admin from './components/admin'
import Login from './components/login'
import SignUp from './components/sign-up'
import HomePage from './pages/home'
import PostPage from './pages/postId'
import ComposePostPage from './pages/composePost'
import OrganisationPage from './pages/createOrganisationPage'
import { useAuthStore } from './store/authStore'
import './index.css'
import OrganizationsPage from './pages/organizations'

 
export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const token = useAuthStore((state) => state.token)
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth)



  useEffect(() => {
     void checkAuth()
  }, [checkAuth])

  if (isCheckingAuth) return <main className="login-shell" aria-live="polite">Checking your session…</main>

  const isAuthenticated = Boolean(token)
  const protectedPage = (page: ReactNode) =>
    isAuthenticated ? page : <Navigate to="/login" replace />
  const authPage = (page: ReactNode) =>
    isAuthenticated ? <Navigate to="/home" replace /> : page

  return (
      <Routes>
        <Route path="/" element={protectedPage(<HomePage />)} />
        <Route path="/organisation" element={authPage(<OrganisationPage />)} />
        <Route path="/organizations" element={protectedPage(<OrganizationsPage />)} />
        <Route path="/sign-up" element={authPage(<SignUp />)} />
        <Route path="/login" element={authPage(<Login />)} />
        <Route path="/posts/:postId" element={protectedPage(<PostPage />)} />
        <Route path="/posts/new" element={protectedPage(<ComposePostPage />)} />
        <Route path="/admin" element={protectedPage(<Admin />)} />
        <Route path="/chat" element={protectedPage(<ChatPage />)} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
      </Routes>
  )
}
