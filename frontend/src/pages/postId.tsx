
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePostStore } from '../store/postStore'
import { OrganizationMark } from './home'

export default function PostPage() {
  const { postId } = useParams()
  const getPost = usePostStore((state) => state.getPost)
  const post = usePostStore((state) => state.posts.find((item) => item.id === postId) ?? null)
  const isLoading = usePostStore((state) => state.isLoading) || Boolean(postId && !post)

  useEffect(() => {
    if (postId) void getPost(postId).catch(() => undefined)
  }, [getPost, postId])

  if (isLoading) {
    return <main className="post-not-found" role="status">Loading update…</main>
  }

  if (!post) {
    return <main className="post-not-found"><p className="section-kicker">404 / UPDATE NOT FOUND</p><h1>This update is no longer here.</h1><Link to="/">Back to the bulletin</Link></main>
  }

  return <div className="bulletin-shell article-shell">
    <div className="bulletin-topline"><span>KAKUMA, TURKANA COUNTY</span><span>COMMUNITY BULLETIN <i>•</i> SAMPLE EDITION</span><span>INFORMATION THAT MATTERS HERE</span></div>
    <header className="bulletin-header">
      <Link className="bulletin-brand" to="/home" aria-label="Julia Bulletin home"><img src="/logo.png" alt="" /><span>Julia<span className="brand-period">.</span></span></Link>
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
    <footer className="bulletin-footer"><Link className="bulletin-brand" to="/home"><img src="/logo.png" alt="" /><span>Julia<span className="brand-period">.</span></span></Link><p>Sample bulletin content for demonstration. Confirm service details with the organization before acting on an update.</p><Link to="/chat">Ask Julia <span aria-hidden="true">↗</span></Link></footer>
  </div>
}
