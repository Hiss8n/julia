import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { OrganizationDetails, RegisterDetails } from '../types'
import { useOrganizationStore } from '../store/organisationStore'


const organizationTypes = ['NGO', 'Business', 'CBO', 'School', 'Company', 'Other']

const emptyOrganization: OrganizationDetails = {
	organisation_name: '',
	organisation_type: 'NGO',
	organisation_description: '',
	organisation_location: '',
	organisation_website: '',
	organisation_phone: '',
	organisation_email: '',
	organisation_logo: '',
    organisation_admin: '',
	organisation_password:''
}

function readLogo(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('The logo could not be read.'))
		reader.onerror = () => reject(new Error('The logo could not be read.'))
		reader.readAsDataURL(file)
	})
}

export default function OrganisationPage() {

	const navigate = useNavigate()
	const location = useLocation()
	const user = useAuthStore((state) => state.user)
	const register = useAuthStore((state) => state.register)
	const checkAuth = useAuthStore((state) => state.checkAuth)
	const authError = useAuthStore((state) => state.error)
	const isLoading = useAuthStore((state) => state.isLoading)
	const registrationData = (location.state as { registrationData?: RegisterDetails } | null)?.registrationData

	const createOrganization = useOrganizationStore((state) => state.createOrganization)
	const [details, setDetails] = useState<OrganizationDetails>(() => ({
		...emptyOrganization,
		organisation_email:registrationData?.email??'',
		organisation_admin: registrationData?.firstName ?? '',
	}))
	const [logoFile, setLogoFile] = useState<File | null>(null)
	const [error, setError] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function createMyOrganization(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError('')
		console.log("userData:",registrationData)
		if (!user && !registrationData) {
			setError('Your account details are missing. Return to sign up and try again.')
			return
		}
		if (logoFile && (!logoFile.type.startsWith('image/') || logoFile.size > 1024 * 1024)) {
			setError('Choose an image no larger than 1 MB for the organisation logo.')
			return
		}

		setIsSubmitting(true)
		try {
			if (!user && registrationData) {
				const registered = await register(registrationData)
				if (!registered) {
					setError(useAuthStore.getState().error || 'Could not create your user account.')
					return
				}
			}

			const organizationDetails = {
				...details,
				organisation_logo: logoFile ? await readLogo(logoFile) : '',
			}
			await createOrganization(organizationDetails)
			 checkAuth()
			navigate('/', { replace: true })
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Could not create the organisation.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return <main className="org-account-page">
		<section className="org-account-panel" aria-labelledby="org-account-title">
			<div className="org-account-heading">
				<p className="org-account-eyebrow">JULIA KAKUMA COMMUNITY</p>
				<h1 id="org-account-title">Create an organisation or company  account</h1>
				<p>Set up your organisation profile to share useful updates with the community.</p>
			</div>
			<form className="org-registration-form" onSubmit={createMyOrganization}>
				<div className="org-form-grid">
					<label className="compose-field">Organization name
						<input value={details.organisation_name} onChange={(event) => setDetails({ ...details, organisation_name: event.target.value })} maxLength={100} autoComplete="organization" required />
					</label>
					<label className="compose-field">Organization type
						<select value={details.organisation_type} onChange={(event) => setDetails({ ...details, organisation_type: event.target.value })} required>
							{organizationTypes.map((type) => <option key={type}>{type}</option>)}
						</select>
					</label>
					<label className="compose-field org-form-wide">Description
						<textarea value={details.organisation_description} onChange={(event) => setDetails({ ...details, organisation_description: event.target.value })} rows={4} maxLength={500} required />
					</label>
					<label className="compose-field">Location
						<input value={details.organisation_location} onChange={(event) => setDetails({ ...details, organisation_location: event.target.value })} autoComplete="address-level2" required />
					</label>
					<label className="compose-field">Website <span className="compose-optional">OPTIONAL</span>
						<input type="url" value={details.organisation_website} onChange={(event) => setDetails({ ...details, organisation_website: event.target.value })} placeholder="https://example.org" />
					</label>
					<label className="compose-field">Phone
						<input type="tel" value={details.organisation_phone} onChange={(event) => setDetails({ ...details, organisation_phone: event.target.value })} autoComplete="tel" required />
					</label>
				
					<label className="compose-field org-form-wide">Logo <span className="compose-optional">OPTIONAL · IMAGE UP TO 1 MB</span>
						<input type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} />
						{logoFile && <span className="compose-file-name">Selected: {logoFile.name} <button type="button" onClick={() => setLogoFile(null)}>Remove</button></span>}
					</label>
				</div>
				{(error || authError) && <p className="compose-error" role="alert">{error || authError}</p>}
				<div className="org-form-actions">
					<Link className="org-skip-button" to="/sign-up">Back to sign up</Link>
					<button className="org-submit-button" type="submit" disabled={isSubmitting || isLoading}>{isSubmitting || isLoading ? 'Creating account…' : 'Create Account'} <span aria-hidden="true">→</span></button>
				</div>
			</form>
		</section>
	</main>
}
