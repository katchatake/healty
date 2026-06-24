<script setup>
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const errorMessage = ref('')

const onSubmit = async () => {
  errorMessage.value = ''

  try {
    await authStore.login(form.email, form.password)

    toast.add({
      title: 'Sesión iniciada',
      color: 'success'
    })

    await navigateTo(String(route.query.redirect || authStore.homePath))
  } catch {
    errorMessage.value = 'Correo o contraseña incorrectos.'

    toast.add({
      title: 'No se pudo iniciar sesión',
      description: errorMessage.value,
      color: 'error'
    })
  }
}
</script>

<template>
  <div>
    <div class="mb-7 text-center">
      <p class="mb-2 text-sm font-semibold text-blue-600">
        Acceso seguro
      </p>
      <h2 class="text-2xl font-bold tracking-tight text-slate-950">
        Bienvenido de nuevo
      </h2>
      <p class="mt-2 text-sm leading-6 text-slate-600">
        Ingresa con tu cuenta para continuar con la operación de la clínica.
      </p>
    </div>

    <UForm
      :state="form"
      class="space-y-5"
      @submit="onSubmit"
    >
      <UFormField
        name="email"
      >
        <span class="text-sm font-medium text-slate-700">Correo electrónico</span>
        <UInput
          v-model="form.email"
          type="email"
          placeholder="tu@correo.com"
          icon="i-heroicons-envelope"
          size="xl"
          color="primary"
          variant="outline"
          autocomplete="email"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Contraseña"
        name="password"
      >
        <template #label>
          <div class="flex w-full items-center justify-between gap-3">
            <span class="text-sm font-medium text-slate-700">Contraseña</span>
            <NuxtLink
              to="#"
              class="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              ¿Olvidaste tu contraseña?
            </NuxtLink>
          </div>
        </template>
        <UInput
          v-model="form.password"
          type="password"
          placeholder="Tu contraseña"
          icon="i-heroicons-lock-closed"
          size="xl"
          color="primary"
          variant="outline"
          autocomplete="current-password"
          class="w-full"
        />
      </UFormField>

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        :title="errorMessage"
      />

      <div class="flex items-center justify-between">
        <UCheckbox
          v-model="form.remember"
          label="Mantener sesión iniciada"
        />
      </div>

      <UButton
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md border-0 transition-colors"
        block
        size="xl"
        icon="i-heroicons-arrow-right-on-rectangle"
        :loading="authStore.loading"
      >
        Iniciar sesión
      </UButton>
    </UForm>
  </div>
</template>
