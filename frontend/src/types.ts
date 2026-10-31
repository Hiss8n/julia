export type AuthUser = {
	id: number
	first_name: string
	second_name: string
	email: string
}




export type AuthResponse = {
	access_token: string
	token_type: string
	user: AuthUser
}

export type RegisterDetails = {
	firstName: string
	secondName: string
	email: string
	password: string
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