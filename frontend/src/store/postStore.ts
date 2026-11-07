import { create } from 'zustand'
import { useAuthStore } from './authStore'
import type { BulletinPost } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

type PdfUploadResponse = {
	status: string
	filename: string
	chunks_stored: number
}

type PostStore = {
	posts: BulletinPost[]
	isLoading: boolean
	error: string | null
	getPosts: () => Promise<BulletinPost[]>
	getPost: (postId: BulletinPost['id']) => Promise<BulletinPost>
	createPost: (post: BulletinPost) => Promise<BulletinPost>
	uploadPdf: (pdfFile: File) => Promise<PdfUploadResponse>
	updatePost: (
		postId: BulletinPost['id'],
		updates: Partial<Omit<BulletinPost, 'id'>>,
	) => Promise<BulletinPost>
	deletePost: (postId: BulletinPost['id']) => Promise<void>
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const token = useAuthStore.getState().token
	const response = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			...(options.body ? { 'Content-Type': 'application/json' } : {}),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options.headers,
		},
	})
	const data: unknown = await response.json().catch(() => null)

	if (!response.ok) {
		const detail = typeof data === 'object' && data !== null && 'detail' in data
			? data.detail
			: undefined
		throw new Error(typeof detail === 'string' ? detail : 'Post request failed')
	}

	return data as T
}

function setRequestError(set: (state: Partial<PostStore>) => void, error: unknown) {
	set({ error: error instanceof Error ? error.message : 'Post request failed' })
}

export const usePostStore = create<PostStore>((set) => ({
	posts: [],
	isLoading: false,
	error: null,

	getPosts: async () => {
		set({ isLoading: true, error: null })
		try {
			const posts = await request<BulletinPost[]>('/posts/')
			set({ posts })
			return posts
		} catch (error) {
			setRequestError(set, error)
			throw error
		} finally {
			set({ isLoading: false })
		}
	},

	getPost: async (postId) => {
		set({ isLoading: true, error: null })
		try {
			const post = await request<BulletinPost>(`/posts/${encodeURIComponent(postId)}`)
			set((state) => ({ posts: [post, ...state.posts.filter((item) => item.id !== post.id)] }))
			return post
		} catch (error) {
			setRequestError(set, error)
			throw error
		} finally {
			set({ isLoading: false })
		}
	},

	createPost: async (post) => {
		set({ isLoading: true, error: null })
		try {
			const createdPost = await request<BulletinPost>('/posts/', {
				method: 'POST',
				body: JSON.stringify(post),
			})
			set((state) => ({ posts: [createdPost, ...state.posts.filter((item) => item.id !== createdPost.id)] }))
			return createdPost
		} catch (error) {
			setRequestError(set, error)
			throw error
		} finally {
			set({ isLoading: false })
		}
	},
	uploadPdf: async (pdfFile) => {
		set({ isLoading: true, error: null })
		try {
			const formData = new FormData()
			formData.append('file', pdfFile)
			const token = useAuthStore.getState().token
			const response = await fetch(`${API_URL}/upload`, {
				method: 'POST',
				headers: token ? { Authorization: `Bearer ${token}` } : {},
				body: formData,
			})
			const data: unknown = await response.json().catch(() => null)

			if (!response.ok) {
				const detail = typeof data === 'object' && data !== null && 'detail' in data
					? data.detail
					: undefined
				throw new Error(typeof detail === 'string' ? detail : 'PDF upload failed')
			}

			return data as PdfUploadResponse
		} catch (error) {
			setRequestError(set, error)
			throw error
		} finally {
			set({ isLoading: false })
		}
	},

	updatePost: async (postId, updates) => {
		set({ isLoading: true, error: null })
		try {
			const updatedPost = await request<BulletinPost>(`/posts/${encodeURIComponent(postId)}`, {
				method: 'PATCH',
				body: JSON.stringify(updates),
			})
			set((state) => ({ posts: state.posts.map((post) => post.id === postId ? updatedPost : post) }))
			return updatedPost
		} catch (error) {
			setRequestError(set, error)
			throw error
		} finally {
			set({ isLoading: false })
		}
	},

	deletePost: async (postId) => {
		set({ isLoading: true, error: null })
		try {
			await request<void>(`/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' })
			set((state) => ({ posts: state.posts.filter((post) => post.id !== postId) }))
		} catch (error) {
			setRequestError(set, error)
			throw error
		} finally {
			set({ isLoading: false })
		}
	},
}))
