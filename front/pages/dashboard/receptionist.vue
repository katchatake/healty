<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard Recepción</h1>
      <UButton color="primary" icon="i-heroicons-plus">Nueva Cita</UButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard class="bg-white">
        <p class="text-sm text-gray-500">Citas de Hoy</p>
        <p class="text-2xl font-bold text-gray-900">24</p>
      </UCard>
      <UCard class="bg-white">
        <p class="text-sm text-gray-500">En Espera</p>
        <p class="text-2xl font-bold text-amber-500">3</p>
      </UCard>
      <UCard class="bg-white">
        <p class="text-sm text-gray-500">Completadas</p>
        <p class="text-2xl font-bold text-emerald-500">12</p>
      </UCard>
      <UCard class="bg-white">
        <p class="text-sm text-gray-500">Canceladas</p>
        <p class="text-2xl font-bold text-red-500">1</p>
      </UCard>
    </div>
  </div>
</template>
