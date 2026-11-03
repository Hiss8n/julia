import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { OrganizationDetails } from '../types'


const organizationTypes = ['NGO', 'Business', 'CBO', 'School', 'Company', 'Other']

const emptyOrganization: OrganizationDetails = {
	name: '',
	type: 'NGO',
	description: '',
	location: '',
	website: '',
	phone: '',
	email: '',
	logo: '',
}

function readLogo(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('The logo could not be read.'))
		reader.onerror = () => reject(new Error('The logo could not be read.'))
		reader.readAsDataURL(file)
	})
}

export default function OrganizationPage() {
	const navigate = useNavigate()
	const user = useAuthStore((state) => state.user)
	const [details, setDetails] = useState(emptyOrganization)
	const [logoFile, setLogoFile] = useState<File | null>(null)
	const [error, setError] = useState('')

	function chooseVisitor() {
		try {

			navigate('/home', { replace: true })
		} catch {
			setError('Your choice could not be saved in this browser. Check available storage and try again.')
		}
	}

	async function createOrganization(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError('')
		if (!user) {
			setError('You need an account to register an organization.')
			return
		}
		if (logoFile && (!logoFile.type.startsWith('image/') || logoFile.size > 1024 * 1024)) {
			setError('Choose an image no larger than 1 MB for the organization logo.')
			return
		}

		try {
			const logo = logoFile ? await readLogo(logoFile) : ''
			const organizationDetails = { ...details, logo }
			console.log('Organization registration pending backend integration:', {
				userId: user?.id ?? null,
				organizationDetails,
			})
	
			navigate('/home', { replace: true })
		} catch {
			setError('Your organization could not be saved. Check available storage and try again.')
		}
	}

	return <div className="bulletin-shell org-onboarding-shell">
		<div className="bulletin-topline"><span>KAKUMA, TURKANA COUNTY</span><span>COMMUNITY BULLETIN</span><span>JOIN THE LOCAL NETWORK</span></div>
		<header className="bulletin-header">
			<Link className="bulletin-brand" to="/home" aria-label="Julia Bulletin home"><img src="/logo.png" alt="" /><span>Julia<span className="brand-period">.</span></span></Link>
			<div className="bulletin-brand-copy"><span>KAKUMA</span><strong>Community news, from the organizations serving here.</strong></div>
			<nav className="bulletin-actions" aria-label="Main navigation"><Link to="/home">Read updates <span aria-hidden="true">→</span></Link></nav>
		</header>

		<main className="org-onboarding-main">
			<div className="org-onboarding-intro">
				<p className="section-kicker">A PLACE IN THE BULLETIN</p>
				<h1>Create your organization</h1>
				<p>Add your organization details to share useful updates with the community. You can also skip registration and continue as a visitor.</p>
			</div>

			<form className="org-registration-form" onSubmit={createOrganization}>
				<div className="org-form-grid">
					<label className="compose-field">Organization name
						<input value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} maxLength={100} autoComplete="organization" required />
					</label>
					<label className="compose-field">Organization type
						<select value={details.type} onChange={(event) => setDetails({ ...details, type: event.target.value })} required>
							{organizationTypes.map((type) => <option key={type}>{type}</option>)}
						</select>
					</label>
					<label className="compose-field org-form-wide">Description
						<textarea value={details.description} onChange={(event) => setDetails({ ...details, description: event.target.value })} rows={4} maxLength={500} required />
					</label>
					<label className="compose-field">Location
						<input value={details.location} onChange={(event) => setDetails({ ...details, location: event.target.value })} autoComplete="address-level2" required />
					</label>
					<label className="compose-field">Website <span className="compose-optional">OPTIONAL</span>
						<input type="url" value={details.website} onChange={(event) => setDetails({ ...details, website: event.target.value })} placeholder="https://example.org" />
					</label>
					<label className="compose-field">Phone
						<input type="tel" value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} autoComplete="tel" required />
					</label>
					<label className="compose-field">Email
						<input type="email" value={details.email} onChange={(event) => setDetails({ ...details, email: event.target.value })} autoComplete="email" required />
					</label>
					<label className="compose-field org-form-wide">Logo <span className="compose-optional">OPTIONAL · IMAGE UP TO 1 MB</span>
						<input type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} />
						{logoFile && <span className="compose-file-name">Selected: {logoFile.name} <button type="button" onClick={() => setLogoFile(null)}>Remove</button></span>}
					</label>
				</div>
				{error && <p className="compose-error" role="alert">{error}{!user && <> <Link to="/sign-up">Create an account</Link> or <Link to="/login">sign in</Link>.</>}</p>}
				<div className="org-form-actions">
					<button className="org-skip-button" type="button" onClick={chooseVisitor}>Skip registration <span>Continue as a visitor</span></button>
					<button className="org-submit-button" type="submit">Create organization <span aria-hidden="true">→</span></button>
				</div>
			</form>
		</main>
		<footer className="bulletin-footer"><Link className="bulletin-brand" to="/home"><img src="/logo.png" alt="" /><span>Julia<span className="brand-period">.</span></span></Link><p>Local information shared by organizations serving Kakuma.</p><Link to="/home">Read updates <span aria-hidden="true">→</span></Link></footer>
	</div>
}
