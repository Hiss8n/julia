export type AuthUser = {
	id: number
	first_name: string
	second_name: string
	email: string
	has_organisation: boolean
}

export type RegisterDetails = {
	firstName: string
	secondName: string
	email: string
	password: string
	has_organisation: boolean
}

export type OrganizationDetails = {
	organisation_name: string,
	organisation_type: string,
	organisation_description:string,
	organisation_location:string,
	organisation_website: string,
	organisation_phone: string,
	organisation_email:string,
	organisation_logo: string,
    organisation_admin: string,
	organisation_password:string
}

export type BulletinPost = {
	id: string
	can_edit?: boolean
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

export type AuthResponse = {
	access_token: string
	token_type: string
	user: AuthUser
}



export type LoginDetails = {
	email: string
	password: string
}

export type AuthState = {
	user: AuthUser | null
	token: string | null
	isAuthenticated: boolean
	isCheckingAuth: boolean
	isLoading: boolean
	error: string
	register: (details: RegisterDetails) => Promise<boolean>
	login: (details: LoginDetails) => Promise<boolean>
	checkAuth: () => Promise<boolean>
	logout: () => void
}