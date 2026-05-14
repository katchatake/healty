<script setup>
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/login')
    }
  ]
})
</script>

<template>
  <div>Redirigiendo...</div>
</template>
