<script setup>
definePageMeta({
  middleware: [
    'auth',
    function () {
      const authStore = useAuthStore()

      if (authStore.hasRole(['Receptionist'])) {
        return navigateTo('/dashboard/receptionist')
      }

      if (authStore.hasRole(['Professional'])) {
        return navigateTo('/dashboard/professional')
      }

      // Administradores y Root pueden acceder a ambos, pero les damos por defecto el operativo de Recepción
      if (authStore.hasRole(['Admin', 'Root'])) {
        return navigateTo('/dashboard/receptionist')
      }

      return navigateTo('/appointments')
    }
  ]
})
</script>

<template>
  <div class="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
    Redirigiendo al panel correspondiente...
  </div>
</template>
