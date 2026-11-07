
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { BulletinPost } from '../types'
import { usePostStore } from '../store/postStore'
import { OrganizationMark } from './home'

export default function PostPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const getPost = usePostStore((state) => state.getPost)
  const updatePost = usePostStore((state) => state.updatePost)
  const deletePost = usePostStore((state) => state.deletePost)
  const post = usePostStore((state) => state.posts.find((item) => item.id === postId) ?? null)
  const [loadedPostId, setLoadedPostId] = useState<string | null>(null)
  const isLoading = Boolean(postId && !post && loadedPostId !== postId)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState({
    title: '',
    category: '',
    summary: '',
    image: '',
    imageAlt: '',
    paragraphs: '',
  })

  useEffect(() => {
    if (!postId) return

    let active = true
    void getPost(postId)
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoadedPostId(postId)
      })

    return () => {
      active = false
    }
  }, [getPost, postId])

  if (isLoading) {
    return <main className="post-not-found" role="status">Loading update…</main>
  }

  if (!post) {
    return <main className="post-not-found"><p className="section-kicker">404 / UPDATE NOT FOUND</p><h1>This update is no longer here.</h1><Link to="/">Back to the bulletin</Link></main>
  }

  const currentPost = post

  function startEditing() {
    setDraft({
      title: currentPost.title,
      category: currentPost.category,
      summary: currentPost.summary,
      image: currentPost.image,
      imageAlt: currentPost.imageAlt,
      paragraphs: currentPost.paragraphs.join('\n\n'),
    })
    setError('')
    setIsEditing(true)
  }

  async function saveEdits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      const updates: Partial<Omit<BulletinPost, 'id'>> = {
        title: draft.title.trim(),
        category: draft.category.trim(),
        summary: draft.summary.trim(),
        image: draft.image.trim(),
        imageAlt: draft.imageAlt.trim(),
        paragraphs: draft.paragraphs.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
      }
      await updatePost(currentPost.id, updates)
      setIsEditing(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The post could not be updated.')
    } finally {
      setIsSaving(false)
    }
  }

  async function removePost() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return

    setIsSaving(true)
    setError('')
    try {
      await deletePost(currentPost.id)
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The post could not be deleted.')
    } finally {
      setIsSaving(false)
    }
  }

  return <div className="bulletin-shell article-shell">
    <div className="bulletin-topline"><span>KAKUMA, TURKANA COUNTY</span><span>COMMUNITY BULLETIN <i>•</i> SAMPLE EDITION</span><span>INFORMATION THAT MATTERS HERE</span></div>
    <header className="bulletin-header">
      <Link className="bulletin-brand" to="/" aria-label="Julia Bulletin home"><img src="/logo.png" alt="" /><span>Julia<span className="brand-period">.</span></span></Link>
      <div className="bulletin-brand-copy"><span>KAKUMA</span><strong>Community news, from the organizations serving here.</strong></div>
      <nav className="bulletin-actions" aria-label="Main navigation"><Link to="/chat">Ask Julia <span aria-hidden="true">↗</span></Link></nav>
    </header>
    <main className="article-main">
      <Link className="back-to-bulletin" to="/">← <span>All updates</span></Link>
      <article>
        <div className="article-heading">
          <div className="post-meta"><OrganizationMark post={post} /><span>{post.organization}</span><i>•</i><span>{post.category}</span><i>•</i><span>{post.isCommunityPost ? 'Community post' : 'Sample post'}</span></div>
          <h1>{post.title}</h1>
          <p className="article-summary">{post.summary}</p>
          <p className="article-date">KAKUMA <i>•</i> {post.published}</p>
        </div>
        {post.can_edit && <div className="article-post-management">
          {!isEditing ? <div className="compose-actions article-post-actions">
            <button type="button" onClick={startEditing}>Edit post</button>
            <button className="post-delete-button" type="button" onClick={() => void removePost()} disabled={isSaving}>Delete post</button>
          </div> : <form className="article-edit-form" onSubmit={saveEdits}>
            <label className="compose-field">Headline
              <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required maxLength={200} />
            </label>
            <label className="compose-field">Category
              <input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} required maxLength={100} />
            </label>
            <label className="compose-field">Summary
              <textarea value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} required />
            </label>
            <label className="compose-field">Image URL
              <input type="url" value={draft.image} onChange={(event) => setDraft({ ...draft, image: event.target.value })} required />
            </label>
            <label className="compose-field">Image description
              <input value={draft.imageAlt} onChange={(event) => setDraft({ ...draft, imageAlt: event.target.value })} required />
            </label>
            <label className="compose-field">Post content
              <textarea value={draft.paragraphs} onChange={(event) => setDraft({ ...draft, paragraphs: event.target.value })} rows={8} required />
            </label>
            {error && <p className="compose-error" role="alert">{error}</p>}
            <div className="compose-actions">
              <button type="button" onClick={() => { setIsEditing(false); setError('') }} disabled={isSaving}>Cancel</button>
              <button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>}
          {!isEditing && error && <p className="compose-error" role="alert">{error}</p>}
        </div>}
        <figure className="article-figure"><img src={post.image} alt={post.imageAlt} /><figcaption>{post.imageAlt} <span>•</span> Illustrative image</figcaption></figure>
        <div className="article-body">
          <p className="article-disclaimer">{post.isCommunityPost ? 'COMMUNITY SUBMITTED' : 'SAMPLE CONTENT'} <span>•</span> {post.isCommunityPost ? `This post was shared by a community member and has not been verified by ${post.organization}.` : `This is a demonstration post, not an official notice from ${post.organization}.`}</p>
          {post.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {post.attachment && <a className="article-attachment" href={post.attachment.dataUrl} download={post.attachment.name}>
            <span className="attachment-icon" aria-hidden="true">PDF</span>
            <span className="attachment-copy"><strong>{post.attachment.name}</strong><span>PDF attachment · Download</span></span>
            <span className="attachment-download" aria-hidden="true">↓</span>
          </a>}
          <div className="article-source"><OrganizationMark post={post} /><div><strong>{post.organization}</strong><span>Organization update · Kakuma</span></div></div>
          <Link className="back-to-bulletin article-back-bottom" to="/">← <span>Back to all updates</span></Link>
        </div>
      </article>
    </main>
    <footer className="bulletin-footer"><Link className="bulletin-brand" to="/"><img src="/logo.png" alt="" /><span>Julia<span className="brand-period">.</span></span></Link><p>Sample bulletin content for demonstration. Confirm service details with the organization before acting on an update.</p><Link to="/chat">Ask Julia <span aria-hidden="true">↗</span></Link></footer>
  </div>
}
