<script setup>
definePageMeta({
  middleware: [
    function () {
      const authStore = useAuthStore()

      if (authStore.isAuthenticated) {
        return navigateTo(authStore.homePath)
      }

      return navigateTo('/login')
    }
  ]
})
</script>

<template>
  <div>Redirigiendo...</div>
</template>
