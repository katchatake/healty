export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  if (!authStore.hasRole(['Root', 'Admin'])) {
    return navigateTo(authStore.homePath)
  }
})
