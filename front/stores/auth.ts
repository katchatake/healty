import { defineStore } from 'pinia'

type Role = 'Admin' | 'Root' | 'Professional' | 'Receptionist' | 'Patient' | string

interface AuthUser {
  id: number
  email: string
  is_active?: boolean
  roles?: Role[]
}

interface LoginResponse {
  success: boolean
  data: {
    user: AuthUser
    token: string
  }
}

const decodeTokenPayload = (token: string): Partial<AuthUser> => {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return {}
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(char => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    )

    return JSON.parse(json)
  } catch {
    return {}
  }
}

export const useAuthStore = defineStore('auth', () => {
  const tokenCookie = useCookie<string | null>('healty_token', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24
  })
  const userCookie = useCookie<AuthUser | null>('healty_user', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24
  })

  const token = ref<string | null>(tokenCookie.value || null)
  const user = ref<AuthUser | null>(userCookie.value || null)
  const loading = ref(false)

  const roles = computed<Role[]>(() => user.value?.roles || [])
  const isAuthenticated = computed(() => Boolean(token.value))

  const setSession = (sessionToken: string, sessionUser: AuthUser) => {
    const tokenPayload = decodeTokenPayload(sessionToken)
    const normalizedUser = {
      ...sessionUser,
      roles: sessionUser.roles || tokenPayload.roles || []
    }

    token.value = sessionToken
    user.value = normalizedUser
    tokenCookie.value = sessionToken
    userCookie.value = normalizedUser
  }

  const login = async (email: string, password: string) => {
    loading.value = true

    try {
      const { $api } = useNuxtApp()
      const response = await $api.post<LoginResponse>('/auth/login', {
        email,
        password
      })

      setSession(response.data.data.token, response.data.data.user)

      return response.data.data.user
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    tokenCookie.value = null
    userCookie.value = null
  }

  const hasRole = (allowedRoles: Role[]) => {
    return allowedRoles.some(role => roles.value.includes(role))
  }

  const homePath = computed(() => {
    if (hasRole(['Root', 'Admin'])) {
      return '/admin/users'
    }

    if (hasRole(['Receptionist'])) {
      return '/dashboard/receptionist'
    }

    if (hasRole(['Professional'])) {
      return '/dashboard/professional'
    }

    return '/appointments'
  })

  return {
    token,
    user,
    roles,
    loading,
    isAuthenticated,
    homePath,
    login,
    logout,
    hasRole,
    setSession
  }
})
