<script setup>
const authStore = useAuthStore()

const route = useRoute()

const links = [
  { label: 'Dashboard', to: '/dashboard', icon: 'i-heroicons-home' },
  { label: 'Agenda', to: '/appointments', icon: 'i-heroicons-calendar-days' },
  { label: 'Pacientes', to: '/patients', icon: 'i-heroicons-users' },
  {
    label: 'Servicios',
    to: '/admin/services',
    icon: 'i-heroicons-clipboard-document-list',
    roles: ['Root', 'Admin']
  },
  {
    label: 'Usuarios',
    to: '/admin/users',
    icon: 'i-heroicons-user-group',
    roles: ['Root', 'Admin']
  }
]

const userEmail = computed(() => authStore.user?.email || 'Usuario')
const userRole = computed(() => authStore.roles[0] || 'Sesión activa')
const userInitial = computed(() => userEmail.value.charAt(0).toUpperCase())
const visibleLinks = computed(() => {
  return links.filter(link => !link.roles || authStore.hasRole(link.roles))
})
const pageTitle = computed(() => {
  return visibleLinks.value.find(link => link.to !== '#' && route.path.startsWith(link.to))?.label || 'Healty'
})

const logout = async () => {
  authStore.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-blue-50 text-slate-900">
    <aside class="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div class="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <UIcon
            name="i-heroicons-heart"
            class="h-6 w-6"
          />
        </div>
        <div>
          <p class="text-lg font-bold leading-5 text-slate-950">
            Healty
          </p>
          <p class="text-xs font-medium text-slate-500">
            Clinic OS
          </p>
        </div>
      </div>

      <nav class="flex-1 space-y-1 px-4 py-5">
        <NuxtLink
          v-for="link in visibleLinks"
          :key="link.label"
          :to="link.to"
          class="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors"
          :class="route.path.startsWith(link.to) && link.to !== '#'
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'"
        >
          <UIcon
            :name="link.icon"
            class="h-5 w-5 shrink-0"
          />
          <span>{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <div class="border-t border-slate-100 p-4">
        <div class="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
          <UAvatar
            :text="userInitial"
            size="md"
          />
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-slate-900">
              {{ userEmail }}
            </p>
            <p class="truncate text-xs text-slate-500">
              {{ userRole }}
            </p>
          </div>
        </div>
        <UButton
          color="error"
          variant="soft"
          icon="i-heroicons-arrow-left-on-rectangle"
          block
          @click="logout"
        >
          Cerrar sesión
        </UButton>
      </div>
    </aside>

    <main class="min-h-screen lg:pl-72">
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-8">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white lg:hidden">
            <UIcon
              name="i-heroicons-heart"
              class="h-5 w-5"
            />
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Healty
            </p>
            <h1 class="text-lg font-bold text-slate-950 sm:text-xl">
              {{ pageTitle }}
            </h1>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <UButton
            class="hidden sm:inline-flex"
            color="primary"
            variant="soft"
            icon="i-heroicons-plus"
            to="/appointments"
          >
            Nueva cita
          </UButton>
          <div class="hidden min-w-0 text-right md:block">
            <p class="max-w-48 truncate text-sm font-semibold text-slate-900">
              {{ userEmail }}
            </p>
            <p class="text-xs text-slate-500">
              {{ userRole }}
            </p>
          </div>
          <UAvatar
            :text="userInitial"
            size="md"
          />
          <UButton
            color="error"
            variant="soft"
            icon="i-heroicons-arrow-left-on-rectangle"
            aria-label="Cerrar sesión"
            @click="logout"
          />
        </div>
      </header>

      <div class="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <slot />
      </div>

      <nav class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
        <NuxtLink
          v-for="link in visibleLinks"
          :key="link.label"
          :to="link.to"
          class="flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium"
          :class="route.path.startsWith(link.to) && link.to !== '#'
            ? 'text-blue-700'
            : 'text-slate-500'"
        >
          <UIcon
            :name="link.icon"
            class="h-5 w-5"
          />
          <span class="max-w-full truncate">{{ link.label }}</span>
        </NuxtLink>
      </nav>
    </main>
  </div>
</template>
