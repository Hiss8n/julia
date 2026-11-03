/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAccountProfile } from '../store/organisationStore'

export type BulletinPost = {
	id: string
	organization: string
	initials: string
	category: string
	title: string
	summary: string
	published: string
	image: string
	imageAlt: string
	paragraphs: string[]
	isCommunityPost?: boolean
	isOrganizationPost?: boolean
	attachment?: {
		name: string
		dataUrl: string
	}
}

const COMMUNITY_POSTS_KEY = 'julia_community_posts'

export function getBulletinPosts(): BulletinPost[] {
	try {
		const savedPosts: unknown = JSON.parse(localStorage.getItem(COMMUNITY_POSTS_KEY) ?? '[]')
		if (Array.isArray(savedPosts)) return [...savedPosts as BulletinPost[], ...posts]
	} catch {
		return posts
	}
	return posts
}

export function saveBulletinPost(post: BulletinPost) {
	const existingPosts = getBulletinPosts().filter((item) => !posts.some((sample) => sample.id === item.id))
	localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify([post, ...existingPosts]))
}

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
		id: 'irc-health-outreach',
		organization: 'IRC',
		initials: 'I',
		category: 'Health',
		title: 'A guide to finding maternal and family health support',
		summary: 'A sample explainer on the kinds of health services, clinic information and referral guidance families may look for.',
		published: '4 hours ago',
		image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=85',
		imageAlt: 'Health worker speaking with a patient',
		paragraphs: [
			'Clear health information helps families understand where to seek care and what services may be available. This sample post shows how an organization could summarize clinic access and referral steps.',
			'Before visiting a facility, check the current opening hours and service availability through the organization or a trusted community focal point.',
			'For urgent medical needs, use the locally established emergency pathway rather than relying on a bulletin post.'
		]
	},
	{
		id: 'unhcr-information',
		organization: 'UNHCR',
		initials: 'U',
		category: 'Information',
		title: 'Keeping your household documents and contact details up to date',
		summary: 'A sample reminder about checking official information channels and keeping important household records together.',
		published: 'Yesterday',
		image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=85',
		imageAlt: 'Notebook and pen on a desk',
		paragraphs: [
			'This sample information post demonstrates a useful bulletin format for reminders about household records, appointments and official communication channels.',
			'Always use verified UNHCR channels for individual case questions. Do not share personal documents or sensitive details with unofficial accounts.',
			'A published notice should include the date it was checked and a trusted way to verify the information.'
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
	{
		id: 'drc-community-services',
		organization: 'DRC',
		initials: 'D',
		category: 'Community services',
		title: 'Community support: where to start when you need a referral',
		summary: 'A sample overview of how a clear referral notice can explain next steps and protect personal information.',
		published: '2 days ago',
		image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=85',
		imageAlt: 'Community members meeting around a table',
		paragraphs: [
			'A good referral notice explains what kind of support is available, how to request it and what information is necessary to share.',
			'Never post private case information in public comments. Ask the organization which confidential channel to use for personal requests.',
			'This sample story is not an official DRC service update; confirm current services with the organization.'
		]
	},
	{
		id: 'don-bosco-skills',
		organization: 'Don Bosco',
		initials: 'DB',
		category: 'Learning',
		title: 'Skills training: what a useful course announcement should include',
		summary: 'A sample guide to course notices with details on entry requirements, dates, duration and application steps.',
		published: '2 days ago',
		image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=85',
		imageAlt: 'Students learning together in a classroom',
		paragraphs: [
			'Training announcements are most useful when they state the course topic, who can apply, the expected schedule and whether any materials are needed.',
			'This sample post illustrates a format for a future Don Bosco update. Course availability and application dates must be checked with the training centre.',
			'A complete announcement can also explain how applicants will be contacted and when they can expect a response.'
		]
	},
	{
		id: 'wfp-food-assistance',
		organization: 'WFP',
		initials: 'W',
		category: 'Food assistance',
		title: 'Food assistance information: dates, notices and trusted sources',
		summary: 'A sample explainer about checking official food assistance notices and avoiding misinformation.',
		published: '3 days ago',
		image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85',
		imageAlt: 'A meal prepared with fresh ingredients',
		paragraphs: [
			'Assistance dates and processes may change. This sample post shows how a bulletin can point readers toward official notices without publishing unverified distribution details.',
			'Use trusted WFP and partner communication channels to confirm any schedule, eligibility or collection information.',
			'Be cautious of messages asking for payment, passwords or personal details in exchange for assistance.'
		]
	}
]

const organizations = ['All organizations', 'NRC', 'IRC', 'UNHCR', 'DRS', 'DRC', 'Don Bosco', 'WFP']

export function OrganizationMark({ post }: { post: BulletinPost }) {
	return <span className={`organization-mark org-${post.initials.toLowerCase().replace(/\s/g, '-')}`} aria-hidden="true">{post.initials}</span>
}

export default function HomePage() {
	const [organization, setOrganization] = useState('All organizations')
	const [query, setQuery] = useState('')
	const profile = getAccountProfile()
	const allPosts = getBulletinPosts()
	const featuredPost = allPosts[0]
	const showFeature = organization === 'All organizations' && query.trim() === ''
	const filteredPosts = allPosts.filter((post) => {
		const matchesOrganization = organization === 'All organizations' || post.organization === organization
		const searchText = `${post.organization} ${post.category} ${post.title} ${post.summary}`.toLowerCase()
		return matchesOrganization && searchText.includes(query.trim().toLowerCase())
	}).filter((post) => !showFeature || post.id !== featuredPost.id)

	return (
		<div className="bulletin-shell">
			<div className="bulletin-topline"><span>KAKUMA, TURKANA COUNTY</span><span>COMMUNITY BULLETIN <i>•</i> SAMPLE EDITION</span><span>INFORMATION THAT MATTERS HERE</span></div>
			<header className="bulletin-header">
				<Link className="bulletin-brand" to="/home" aria-label="Julia Bulletin home"><img src="/logo.png" alt="" /> <span>Julia<span className="brand-period">.</span></span></Link>
				<div className="bulletin-brand-copy"><span>KAKUMA</span><strong>Community news, from the organizations serving here.</strong></div>
				<nav className="bulletin-actions" aria-label="Main navigation">
					{profile?.role === 'organization'
						? <Link to="/posts/new">Post <span aria-hidden="true">+</span></Link>
						: <Link to="/organisation">Register organization <span aria-hidden="true">↗</span></Link>}
					<Link to="/chat">Ask Julia <span aria-hidden="true">↗</span></Link>
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

				{showFeature && <section className="lead-story" aria-label="Featured update">
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
