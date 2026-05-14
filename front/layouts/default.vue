<script setup>
const links = [
  { label: 'Dashboard', to: '/dashboard/professional', icon: 'i-heroicons-home' },
  { label: 'Agenda', to: '/appointments', icon: 'i-heroicons-calendar' },
  { label: 'Pacientes', to: '#', icon: 'i-heroicons-users' },
  { label: 'Servicios', to: '/admin/services', icon: 'i-heroicons-clipboard-document-list' },
  { label: 'Usuarios', to: '/admin/users', icon: 'i-heroicons-cog-8-tooth' },
]
</script>

<template>
  <div class="min-h-screen flex bg-slate-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
      <div class="h-16 flex items-center px-6 border-b border-gray-200">
        <span class="text-xl font-bold text-blue-600">Healty</span>
      </div>
      <div class="p-4 flex-1">
        <UNavigationMenu :items="links" orientation="vertical" class="w-full" />
      </div>
      <div class="p-4 border-t border-gray-200">
        <UButton color="neutral" variant="ghost" icon="i-heroicons-arrow-left-on-rectangle" to="/login" block>
          Cerrar Sesión
        </UButton>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Top header for mobile / profile -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
        <div class="md:hidden">
          <span class="text-xl font-bold text-blue-600">Healty</span>
        </div>
        <div class="flex items-center gap-4 ml-auto">
          <UAvatar src="https://avatars.githubusercontent.com/u/739984?v=4" alt="Avatar" />
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
