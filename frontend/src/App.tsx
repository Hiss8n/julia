
import {  Navigate, Route, Routes } from 'react-router-dom'
import ChatPage from './ChatPage'
import Admin from './components/admin'
import Login from './components/login'
import SignUp from './components/sign-up'
import './index.css'

export default function App() {
  return (
  
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
   
  )
}
