<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p class="text-gray-500 mt-1">Administra accesos y roles del personal médico y recepcionistas.</p>
      </div>
      <UButton color="primary" icon="i-heroicons-user-plus">Nuevo Usuario</UButton>
    </div>

    <!-- Placeholder for users table -->
    <UCard class="bg-white">
      <div class="text-center py-12 text-gray-500">
        <UIcon name="i-heroicons-users" class="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p>Módulo de usuarios en construcción</p>
      </div>
    </UCard>
  </div>
</template>
