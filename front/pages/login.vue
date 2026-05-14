<script setup>
definePageMeta({
  layout: 'auth'
})

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const onSubmit = () => {
  console.log('Login attempt', form)
  // Logic with pinia / axios
}
</script>

<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h2>
      <p class="text-gray-600 mt-2">Ingresa a tu portal de Healty Clinic</p>
    </div>

    <UForm :state="form" class="space-y-6" @submit="onSubmit">
      <UFormField label="Correo electrónico" name="email" :ui="{ label: { base: 'text-gray-700 font-medium mb-1' } }">
        <UInput v-model="form.email" type="email" placeholder="tu@correo.com" icon="i-heroicons-envelope" size="xl" color="white" variant="outline" class="bg-white rounded-xl shadow-sm w-full" />
      </UFormField>

      <UFormField label="Contraseña" name="password" :ui="{ label: { base: 'text-gray-700 font-medium mb-1' } }">
        <template #label>
          <div class="flex justify-between w-full">
            <span class="text-gray-700 font-medium">Contraseña</span>
            <NuxtLink to="#" class="text-sm text-blue-500 font-medium hover:text-blue-600 transition-colors">¿Olvidaste tu contraseña?</NuxtLink>
          </div>
        </template>
        <UInput v-model="form.password" type="password" placeholder="••••••••" icon="i-heroicons-lock-closed" size="xl" color="white" variant="outline" class="bg-white rounded-xl shadow-sm w-full" />
      </UFormField>

      <div class="flex items-center justify-between pt-2">
        <UCheckbox v-model="form.remember" label="Mantener sesión iniciada" :ui="{ label: 'text-gray-600' }" />
      </div>

      <div class="pt-4">
        <UButton type="submit" color="primary" block size="xl" class="font-bold tracking-wide">
          Iniciar Sesión
        </UButton>
      </div>
    </UForm>
  </div>
</template>
