import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from './store/authStore';
import { Link, useNavigate } from 'react-router-dom';

type Message = { role: 'user' | 'assistant'; content: string }

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const user=useAuthStore(state=>state.user)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const logout = useAuthStore(state => state.logout)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  useEffect(() => {
    if (!accountMenuOpen) return

    function closeMenu(event: MouseEvent | KeyboardEvent) {
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        setAccountMenuOpen(false)
      } else if (event instanceof MouseEvent && !accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', closeMenu)
    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', closeMenu)
    }
  }, [accountMenuOpen])

  function handleLogout() {
    logout()
    navigate('/sign-up', { replace: true })
  }

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = draft.trim()
    if (!message || loading) return

    setDraft('')
    setError('')
    setMessages((current) => [...current, { role: 'user', content: message }])
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      console.log(response)
      if (!response.ok) {
        const details = await response.json().catch(() => "Somthing went wrong.Please try again later")
        console.log(details)
        throw new Error(details?.detail ?? `Request failed (${response.status})`)
      }

      const data: { answer: string } = await response.json()
      setMessages((current) => [...current, { role: 'assistant', content: data.answer }])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not reach the chat server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-layout">
      <main className="chat-page">
        <header className="chat-header">
          <div className='header-logo'>
            <Link to={"/home"} className='header-logo'><img src='/logo.png' width={60} height={60}/> Julia</Link>
            
            </div>
          
          
          <div className="account-menu" ref={accountMenuRef}>
            <button
              className="user-avatar"
              type="button"
              aria-label="Open account menu"
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              onClick={() => setAccountMenuOpen((open) => !open)}
            >
              {user?.first_name?.charAt(0).toUpperCase() ?? '?'}
            </button>
            {accountMenuOpen && <div className="account-dropdown" role="menu">
              <span className="account-dropdown-label">ACCOUNT</span>
              <Link to="/posts/new" role="menuitem" onClick={() => setAccountMenuOpen(false)}>
                <span className="account-menu-icon" aria-hidden="true">＋</span> Post news
              </Link>
              <button type="button" role="menuitem" onClick={handleLogout}>
                <span className="account-menu-icon" aria-hidden="true">↪</span> Log out
              </button>
            </div>}
          </div>
        </header>
        <section className="chat-content" aria-label="Chat conversation">
          {messages.length === 0 ? (
            <div className="empty-state">
              <h2>Karibu Julia Kakuma,How can I help?</h2>
              <p>Send a message to get started.</p>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((message, index) => (
                <article className={`message ${message.role}`} key={index}>
                  <span className="message-label">{message.role === 'user' ? 'You' : 'Julia'}</span>
                  <p>{message?.content}</p>
                </article>
              ))}
              {loading && <div className="message assistant"><span className="message-label">Julia</span><p className="loading-text">Thinking…</p></div>}
              {error && <p className="error-message" role="alert">{error}</p>}
              <div ref={endRef} />
            </div>
          )}
        </section>
        <footer className="composer-area">
          {error && messages.length === 0 && <p className="error-message" role="alert">{error}</p>}
          <form className="message-form" onSubmit={sendMessage}>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
              placeholder="Message Julia"
              aria-label="Message Julia"
              rows={1}
              disabled={loading}
            />
            <button type="submit" aria-label="Send message" disabled={!draft.trim() || loading}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m0 0L6 11m6-6 6 6" /></svg>
            </button>
          </form>
          <p className="composer-note">Julia may make mistakes. Check important information.</p>
        </footer>
      </main>
      <aside className="empty-side-panel" aria-label="Empty sidebar" />
    </div>
  )
}
