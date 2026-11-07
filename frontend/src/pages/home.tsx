/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { BulletinPost } from '../types'
import { useAuthStore } from '../store/authStore'
import { usePostStore } from '../store/postStore'



 export const posts: BulletinPost[] = [
	{
		id: 'nrc-community-support',
		organization: 'NRC',
		initials: 'N',
		category: 'Community services',
		title: 'What to expect from community support services this week',
		summary: 'A sample bulletin about legal information, referrals and practical support available to displaced families in Kakuma.',
		published: '2 hours ago',
		image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=85',
		imageAlt: 'Children taking part in a community learning activity',
		paragraphs: [
			'This sample update brings together the kinds of practical information a community bulletin can share: where to ask questions, how referrals work and what to bring when seeking support.',
			'Residents are encouraged to confirm dates, locations and eligibility directly with the organization before travelling. Service schedules can change, and this demonstration post is not an official NRC announcement.',
			'A complete notice could include contact details, languages supported, accessibility information and the next date for community outreach.'
		]
	},
	

	{
		id: 'drs-youth-services',
		organization: 'DRS',
		initials: 'D',
		category: 'Youth',
		title: 'Youth activities: a sample weekly community notice',
		summary: 'A sample post format for sharing youth activity times, age groups and registration information.',
		published: 'Yesterday',
		image: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1000&q=85',
		imageAlt: 'Young people gathered for a group activity',
		paragraphs: [
			'Youth programmes are easier to access when notices clearly explain who can attend, where activities take place and how to register.',
			'This example is illustrative only. Confirm all programme details and dates with DRS before attending.',
			'Organizations can use this space to share a short update, participation requirements and a contact for questions.'
		]
	},
	


]
 
const organizations = ['All organizations', 'NRC', 'IRC', 'UNHCR', 'DRS', 'DRC', 'Don Bosco', 'WFP']

export function OrganizationMark({ post }: { post: BulletinPost }) {
	return <span className={`organization-mark org-${post.initials.toLowerCase().replace(/\s/g, '-')}`} aria-hidden="true">{post.initials}</span>
}

export default function HomePage() {
	const user = useAuthStore((state) => state.user)
	const logout = useAuthStore((state) => state.logout)
	const [organization, setOrganization] = useState('All organizations')
	const [query, setQuery] = useState('')
	const [accountMenuOpen, setAccountMenuOpen] = useState(false)
	const accountMenuRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()
	const allPosts = usePostStore((state) => state.posts)
	const getPosts = usePostStore((state) => state.getPosts)
	const postsLoading = usePostStore((state) => state.isLoading)
	const postsError = usePostStore((state) => state.error)

	const featuredPost = allPosts[0]
	const showFeature = Boolean(featuredPost && organization === 'All organizations' && query.trim() === '')
	const filteredPosts = allPosts.filter((post) => {
		const matchesOrganization = organization === 'All organizations' || post.organization === organization
		const searchText = `${post.organization} ${post.category} ${post.title} ${post.summary}`.toLowerCase()
		return matchesOrganization && searchText.includes(query.trim().toLowerCase())
	}).filter((post) => !showFeature || post.id !== featuredPost?.id)

	useEffect(() => {
		void getPosts().catch(() => undefined)
	}, [getPosts])

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
		navigate('/login', { replace: true })
	}

	
	

	return (
		<div className="bulletin-shell">
			<div className="bulletin-topline"><span>KAKUMA, TURKANA COUNTY</span><span>COMMUNITY BULLETIN <i>•</i> SAMPLE EDITION</span><span>INFORMATION THAT MATTERS HERE</span></div>
			<header className="bulletin-header">
				<Link className="bulletin-brand" to="/home" aria-label="Julia Bulletin home"><img src="/logo.png" alt="" /> <span>Julia<span className="brand-period">.</span></span></Link>
				<div className="bulletin-brand-copy"><span>KAKUMA</span><strong>Community news, from the organizations serving here.</strong></div>
				<nav className="bulletin-actions" aria-label="Main navigation">
					{user?.has_organisation
					? <Link to="/posts/new">Post <span aria-hidden="true">+</span></Link>
					:<Link to="/organizations">Browse organizations <span aria-hidden="true">↗</span></Link>}
					<Link to="/chat">Ask Julia <span aria-hidden="true">↗</span></Link>
					<div className="account-menu" ref={accountMenuRef}>
						<button
							className="user-avatar"
							type="button"
							aria-label="Open account menu"
							aria-haspopup="menu"
							aria-expanded={accountMenuOpen}
							onClick={() => setAccountMenuOpen((open) => !open)}
						>
							{user?.first_name?.trim().charAt(0).toUpperCase() || '?'}
						</button>
						{accountMenuOpen && <div className="account-dropdown" role="menu">
							<span className="account-dropdown-label">{user?.first_name} {user?.second_name}</span>
							<button type="button" role="menuitem" onClick={handleLogout}>
								<span className="account-menu-icon" aria-hidden="true">↪</span> Log out
							</button>
						</div>}
					</div>
				</nav>
			</header>

			<nav className="organization-nav" aria-label="Organizations">
				{organizations.slice(1).map((name) => <button key={name} type="button" onClick={() => setOrganization(name)}>{name}</button>)}
			</nav>

			<main className="bulletin-main">
				<section className="bulletin-heading-row">
					<div><p className="section-kicker">LOCAL UPDATES <span> / </span> KAKUMA</p><h1>The latest, from around Kakuma.</h1></div>
					<label className="bulletin-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search updates" aria-label="Search updates" /></label>
				</section>

				{featuredPost && showFeature && <section className="lead-story" aria-label="Featured update">
					<Link className="lead-image-link" to={`/posts/${featuredPost.id}`} aria-label={`Read ${featuredPost.title}`}>
						<img className="lead-image" src={featuredPost.image} alt={featuredPost.imageAlt} />
						<span className="image-caption">KAKUMA <span>•</span> COMMUNITY LIFE</span>
					</Link>
					<div className="lead-copy">
						<div className="post-meta"><OrganizationMark post={featuredPost} /><span>{featuredPost.organization}</span><i>•</i><span>{featuredPost.category}</span></div>
						<p className="lead-label">FEATURED UPDATE</p>
						<h2><Link to={`/posts/${featuredPost.id}`}>{featuredPost.title}</Link></h2>
						<p className="lead-summary">{featuredPost.summary}</p>
						<div className="story-byline"><span>{featuredPost.published}</span><span>{featuredPost.isOrganizationPost ? 'Organization post' : featuredPost.isCommunityPost ? 'Community post' : 'Sample post'}</span></div>
						<Link className="read-story" to={`/posts/${featuredPost.id}`}>Read the full update <span aria-hidden="true">→</span></Link>
					</div>
				</section>}

				<section className="updates-section" aria-labelledby="updates-title">
					<div className="updates-heading">
						<div><p className="section-kicker">THE ROUNDUP</p><h2 id="updates-title">More from Kakuma</h2></div>
						<label className="filter-label">SHOWING
							<select value={organization} onChange={(event) => setOrganization(event.target.value)} aria-label="Filter by organization">
								{organizations.map((name) => <option key={name} value={name}>{name}</option>)}
							</select>
						</label>
					</div>

					{postsError && <p className="no-stories" role="alert">{postsError}</p>}
					{postsLoading && allPosts.length === 0 && <p className="no-stories" role="status">Loading updates…</p>}
					{filteredPosts.length > 0 ? <div className="story-grid">
						{filteredPosts.map((post, index) => <article className={`story-card story-card-${index + 1}`} key={post.id}>
							<Link className="story-image-link" to={`/posts/${post.id}`} tabIndex={-1} aria-hidden="true"><img src={post.image} alt="" loading="lazy" /></Link>
							<div className="story-card-copy">
								<div className="post-meta"><OrganizationMark post={post} /><span>{post.organization}</span><i>•</i><span>{post.category}</span></div>
								<h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3>
								<p>{post.summary}</p>
								<div className="story-card-footer"><span>{post.published}</span><Link to={`/posts/${post.id}`} aria-label={`Read ${post.title}`}>Read update <span aria-hidden="true">→</span></Link></div>
							</div>
						</article>)}
					</div> : <p className="no-stories">No updates match that search. Try another organization or keyword.</p>}
				</section>
			</main>

			<footer className="bulletin-footer"><Link className="bulletin-brand" to="/home"><img src="/logo.png" alt="" /><span>Julia<span className="brand-period">.</span></span></Link><p>Sample bulletin content for demonstration. Confirm service details with the organization before acting on an update.</p><Link to="/chat">Ask Julia <span aria-hidden="true">↗</span></Link></footer>
		</div>
	)
}
