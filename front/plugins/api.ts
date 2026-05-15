import axios from 'axios'
import type { AxiosError } from 'axios'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const api = axios.create({
    baseURL: config.public.apiBaseUrl
  })

  api.interceptors.request.use((request) => {
    if (authStore.token) {
      request.headers.Authorization = `Bearer ${authStore.token}`
    }

    return request
  })

  api.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      const status = error.response?.status

      if ((status === 401 || status === 403) && authStore.isAuthenticated) {
        authStore.logout()

        if (import.meta.client && useRoute().path !== '/login') {
          navigateTo('/login')
        }
      }

      return Promise.reject(error)
    }
  )

  return {
    provide: {
      api
    }
  }
})
