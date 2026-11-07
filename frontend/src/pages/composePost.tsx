import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import type { BulletinPost } from '../types'
import { useAuthStore } from '../store/authStore'
import { usePostStore } from '../store/postStore'
export default function ComposePostPage() {
  const [category, setCategory] = useState('Community news')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const isAdmin = useAuthStore((state) => Boolean(state.user?.has_organisation))
  const createPost = usePostStore((state) => state.createPost)


  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (pdfFile && (pdfFile.type !== 'application/pdf' || pdfFile.size > 2 * 1024 * 1024)) {
      setError('Choose a PDF file no larger than 2 MB.')
      return
    }

    let attachment: BulletinPost['attachment']
    if (pdfFile) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read the PDF'))
          reader.onerror = () => reject(new Error('Could not read the PDF'))
          reader.readAsDataURL(pdfFile)
        })
        attachment = { name: pdfFile.name, dataUrl }
      } catch {
        setError('The PDF could not be read. Please choose it again.')
        return
      }
    }

    const paragraphs = body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
    const organization = 'Sample Organization'
    const initials = 'SO'
    const post: BulletinPost = {
      id: `community-${crypto.randomUUID()}`,
      organization,
      initials,
      category: category.trim(),
      title: title.trim(),
      summary: summary.trim(),
      published: 'Just now',
      image: image.trim() || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1400&q=85',
      imageAlt: 'Community members meeting together',
      paragraphs,
      isOrganizationPost: true,
      attachment,
    }


    try {
      console.log("post:",post)
      const createdPost = await createPost(post)

      console.log("post",createPost)
      navigate(`/posts/${createdPost.id}`)
    } catch {
      setError('This post could not be published. Please try again.')
    }
  }

    if (!isAdmin) return <Navigate to="/organizations" replace />

  return <div className="bulletin-shell compose-shell">
    <div className="bulletin-topline"><span>KAKUMA, TURKANA COUNTY</span><span>COMMUNITY BULLETIN</span><span>SHARE A LOCAL UPDATE</span></div>
    <header className="bulletin-header">
      <Link className="bulletin-brand" to="/" aria-label="Julia Bulletin home"><img src="/logo.png" alt="" /><span>Julia<span className="brand-period">.</span></span></Link>
      <div className="bulletin-brand-copy"><span>KAKUMA</span><strong>Community news, from the organizations serving here.</strong></div>
      <nav className="bulletin-actions" aria-label="Main navigation"><Link to="/">Cancel <span aria-hidden="true">×</span></Link></nav>
    </header>

    <main className="compose-main">
      <Link className="back-to-bulletin" to="/">← <span>Back to updates</span></Link>
      <div className="compose-heading">
        <p className="section-kicker">Organisation Name</p>
        <h1>Share an organization update</h1>
        <p>Publish a clear, useful update for people in Kakuma. Your organization name will appear as the source.</p>
      </div>

      <form className="compose-form" onSubmit={submitPost}>
        <p className="compose-org-source">Posting as <strong>NRC</strong></p>
        <label className="compose-field">Topic
          <input value={category} onChange={(event) => setCategory(event.target.value)} maxLength={60} required />
        </label>
        <label className="compose-field">Headline
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="What should readers know?" required />
          <span className="compose-hint">Keep it specific and easy to understand.</span>
        </label>
        <label className="compose-field">Short description
          <textarea value={summary} onChange={(event) => setSummary(event.target.value)} maxLength={240} rows={3} placeholder="Summarize the update in a sentence or two." required />
        </label>
        <label className="compose-field">Full update
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={8} placeholder="Add details, dates, locations and useful next steps. Separate paragraphs with a blank line." required />
        </label>
        <label className="compose-field">Image URL <span className="compose-optional">OPTIONAL</span>
          <input type="url" value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://..." />
          <span className="compose-hint">Use an image you have permission to share. A bulletin image is used if left blank.</span>
        </label>
        <label className="compose-field compose-pdf-field">Attach a PDF <span className="compose-optional">OPTIONAL</span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => {
              setPdfFile(event.target.files?.[0] ?? null)
              setError('')
            }}
          />
          <span className="compose-hint">PDF only, up to 2 MB. The document will be available from the published post.</span>
          {pdfFile && <span className="compose-file-name">Selected: {pdfFile.name} <button type="button" onClick={() => setPdfFile(null)}>Remove</button></span>}
        </label>
        <p className="compose-disclaimer">Do not include private personal details, passwords, payment requests or unverified assistance schedules.</p>
        {error && <p className="compose-error" role="alert">{error}</p>}
        <div className="compose-actions"><Link to="/">Cancel</Link><button type="submit">Publish update <span aria-hidden="true">→</span></button></div>
      </form>
    </main>
    <footer className="bulletin-footer"><Link className="bulletin-brand" to="/"><img src="/logo.png" alt="" /><span>Julia<span className="brand-period">.</span></span></Link><p>Organization updates are shared directly by their registered profiles.</p><Link to="/chat">Ask Julia <span aria-hidden="true">↗</span></Link></footer>
  </div>
}