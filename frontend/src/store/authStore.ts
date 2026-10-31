import { create } from 'zustand'
import type { AuthResponse, AuthState, AuthUser, LoginDetails, RegisterDetails } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'
const TOKEN_KEY = 'julia_access_token'

class ApiError extends Error {
	status: number

	constructor(message: string, status: number) {
		super(message)
		this.status = status
	}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const response = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	})
	const data: unknown = await response.json().catch(() => ({}))

	if (!response.ok) {
		const detail = typeof data === 'object' && data !== null && 'detail' in data
			? data.detail
			: undefined
		throw new ApiError(
			typeof detail === 'string' ? detail : 'Authentication request failed',
			response.status,
		)
	}

	return data as T
}

function saveSession(set: (state: Partial<AuthState>) => void, data: AuthResponse) {
	localStorage.setItem(TOKEN_KEY, data.access_token)
	set({ user: data.user, token: data.access_token, isAuthenticated: true, error: '' })
}

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	token: localStorage.getItem(TOKEN_KEY),
	isAuthenticated: false,
	isCheckingAuth: true,
	isLoading: false,
	error: '',

	register: async ({ firstName, secondName, email, password }: RegisterDetails) => {
		set({ isLoading: true, error: '' })
		try {
			const data = await request<AuthResponse>('/auth/register', {
				method: 'POST',
				body: JSON.stringify({
					first_name: firstName,
					second_name: secondName,
					email,
					password,
				}),
			})
		saveSession(set, data)
			return true
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Could not create account' })
			return false
		} finally {
			set({ isLoading: false })
		}
	},

	login: async ({ email, password }: LoginDetails) => {
		set({ isLoading: true, error: '' })
		try {
			const data = await request<AuthResponse>('/auth/login', {
				method: 'POST',
				body: JSON.stringify({ email, password }),
			})
			saveSession(set, data)
			return true
		} catch (error) {
			set({ error: error instanceof Error ? error.message : 'Could not sign in' })
			return false
		} finally {
			set({ isLoading: false })
		}
	},

	checkAuth: async () => {
		const token = get().token ?? localStorage.getItem(TOKEN_KEY)
		if (!token) {
			set({ user: null, token: null, isAuthenticated: false, isCheckingAuth: false })
			return false
		}

		set({ isCheckingAuth: true })
		try {
			const user = await request<AuthUser>('/auth/me', {
				headers: { Authorization: `Bearer ${token}` },
			})
			set({ user, token, isAuthenticated: true, error: '' })
			return true
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				localStorage.removeItem(TOKEN_KEY)
				set({ token: null })
			}
			set({ user: null, isAuthenticated: false })
			return false
		} finally {
			set({ isCheckingAuth: false })
		}
	},

	logout: () => {
		localStorage.removeItem(TOKEN_KEY)
		set({ user: null, token: null, isAuthenticated: false, error: '' })
	},
}))