import { create } from 'zustand'

import { useAuthStore } from './authStore'
import type { OrganizationDetails } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

type Organization = OrganizationDetails & {
    id: number
}

type OrganizationState = {
    organizations: Organization[]
    currentOrganization: Organization | null
    isLoading: boolean
    error: string | null
    getOrganizations: () => Promise<void>
    getOrganization: (orgId: number) => Promise<void>
    createOrganization: (details: OrganizationDetails) => Promise<Organization>
    updateOrganization: (orgId: number,details: Partial<OrganizationDetails>,) => Promise<Organization>
    deleteOrganization: (orgId: number) => Promise<void>
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
        const detail =
            typeof data === 'object' && data !== null && 'detail' in data
                ? data.detail
                : null
        throw new Error(
            typeof detail === 'string' ? detail : 'Organization request failed',
        )
    }

    return data as T
}

export const useOrganizationStore = create<OrganizationState>((set,get) => ({
    organizations: [],
    currentOrganization: null,
    isLoading: false,
    error: null,

    getOrganizations: async () => {
        set({ isLoading: true, error: null })
        try {
            const organizations = await request<Organization[]>('/organizations/')
            set({ organizations })
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Could not load organizations' })
        } finally {
            set({ isLoading: false })
        }
    },

    getOrganization: async (orgId) => {
        set({ isLoading: true, error: null })
        try {
            const organization = await request<Organization>(`/organizations/${orgId}`)
            set({ currentOrganization: organization })
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Could not load organization' })
        } finally {
            set({ isLoading: false })
        }
    },

    createOrganization: async (details) => {
        set({ isLoading: true, error: null })
        try {
            const organization = await request<Organization>('/organizations/create', {
                method: 'POST',
                body: JSON.stringify(details),
            })
            set((state) => ({
                organizations: [...state.organizations, organization],
                currentOrganization: organization,
            }))
            return organization
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Could not create organization'
            set({ error: message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    updateOrganization: async (orgId, details) => {
        set({ isLoading: true, error: null })
        try {
            const organization = await request<Organization>(`/organizations/${orgId}`, {
                method: 'PATCH',
                body: JSON.stringify(details),
            })
            set((state) => ({
                organizations: state.organizations.map((item) =>
                    item.id === orgId ? organization : item,
                ),
                currentOrganization: organization,
            }))
            return organization
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Could not update organization'
            set({ error: message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },

    deleteOrganization: async (orgId) => {
        set({ isLoading: true, error: null })
        try {
            await request<void>(`/organizations/delete/${orgId}`, {
                method: 'DELETE',
            })
            set((state) => ({
                organizations: state.organizations.filter((item) => item.id !== orgId),
                currentOrganization:
                    state.currentOrganization?.id === orgId ? null : state.currentOrganization,
            }))
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Could not delete organization'
            set({ error: message })
            throw error
        } finally {
            set({ isLoading: false })
        }
    },
}))