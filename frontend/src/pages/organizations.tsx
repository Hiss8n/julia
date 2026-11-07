import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useOrganizationStore } from '../store/organisationStore'

export default function OrganizationsPage() {
	const currentOrganization = useOrganizationStore((state) => state.currentOrganization)
	const organizations = useOrganizationStore((state) => state.organizations)
	const isLoading = useOrganizationStore((state) => state.isLoading)
	const error = useOrganizationStore((state) => state.error)
	const getOrganizations = useOrganizationStore((state) => state.getOrganizations)

	useEffect(() => {
		void getOrganizations()
	}, [getOrganizations])

	return <div className="bulletin-shell org-directory-shell">
		<div className="bulletin-topline"><span>KAKUMA, TURKANA COUNTY</span><span>COMMUNITY DIRECTORY</span><span>ORGANIZATIONS SERVING HERE</span></div>
		<header className="bulletin-header">
			<Link className="bulletin-brand" to="/organizations" aria-label="Julia organizations"><img src="/logo.png" alt="" /><span>Julia<span className="brand-period">.</span></span></Link>
			<div className="bulletin-brand-copy"><span>KAKUMA</span><strong>Find organisations serving the community.</strong></div>
			<nav className="bulletin-actions" aria-label="Main navigation"><Link to="/chat">Ask Julia <span aria-hidden="true">↗</span></Link></nav>
		</header>

		<main className="org-directory-main">
			<div className="org-directory-heading">
				<p className="section-kicker">LOCAL DIRECTORY <span>/</span> KAKUMA</p>
				<h1>Organisations in your community.</h1>
				<p>Explore registered organisations and ask Julia for help finding information.</p>
			</div>
			{isLoading && <p className="org-directory-state" role="status">Loading organisations…</p>}
			{error && <p className="org-directory-state" role="alert">{error}</p>}
			{!isLoading && !error && currentOrganization && <section className="org-current-dashboard" aria-labelledby="current-organization-title">
				<p className="section-kicker">YOUR ORGANISATION <span>/</span> DASHBOARD</p>
				<div className="org-current-profile">
					{currentOrganization.organisation_logo
						? <img className="org-current-logo" src={currentOrganization.organisation_logo} alt={`${currentOrganization.organisation_name} logo`} />
						: <div className="org-directory-mark" aria-hidden="true">{currentOrganization.organisation_name?.slice(0, 1).toUpperCase()}</div>}
					<div className="org-directory-copy">
						<p className="section-kicker">{currentOrganization.organisation_type} <span>/</span> {currentOrganization.organisation_location}</p>
						<h2 id="current-organization-title">{currentOrganization.organisation_name}</h2>
						<p>{currentOrganization.organisation_description}</p>
						<div className="org-current-contacts">
							{currentOrganization.organisation_email && <a href={`mailto:${currentOrganization.organisation_email}`}>{currentOrganization.organisation_email}</a>}
							{currentOrganization.organisation_phone && <a href={`tel:${currentOrganization.organisation_phone}`}>{currentOrganization.organisation_phone}</a>}
							{currentOrganization.organisation_website && <a href={currentOrganization.organisation_website} target="_blank" rel="noreferrer">Visit website <span aria-hidden="true">↗</span></a>}
						</div>
					</div>
				</div>
			</section>}
			{!isLoading && !error && organizations.length === 0 && !currentOrganization && <p className="org-directory-state">No organisations have registered yet.</p>}
			{organizations.length > 0 && <ul className="org-directory-list">
				{organizations.filter((organization) => organization.id !== currentOrganization?.id).map((organization) => <li className="org-directory-item" key={organization.id}>
					<div className="org-directory-mark" aria-hidden="true">{organization.organisation_name?.slice(0, 1).toUpperCase()}</div>
					<div className="org-directory-copy">
						<p className="section-kicker">{organization.organisation_type} <span>/</span> {organization.organisation_location}</p>
						<h2>{organization.organisation_name}</h2>
						<p>{organization.organisation_description}</p>
						{organization.organisation_website && <a href={organization.organisation_website} target="_blank" rel="noreferrer">Visit website <span aria-hidden="true">↗</span></a>}
					</div>
				</li>)}
			</ul>}
		</main>
		<footer className="bulletin-footer"><Link className="bulletin-brand" to="/"><img src="/logo.png" alt="" /><span>Julia<span className="brand-period">.</span></span></Link><p>Connect with Julia for community information.</p><Link to="/chat">Ask Julia <span aria-hidden="true">↗</span></Link></footer>
	</div>
}