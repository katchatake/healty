<script setup>
const columns = [
  { key: 'name', label: 'Nombre del Servicio' },
  { key: 'duration', label: 'Duración (min)' },
  { key: 'price', label: 'Costo' },
  { key: 'professionals', label: 'Asignado a' },
  { key: 'actions' }
]

const services = [
  { id: 1, name: 'Consulta General', duration: 30, price: '$500.00', professionals: 'Dr. Carlos Médico' },
  { id: 2, name: 'Chequeo Completo', duration: 60, price: '$1200.00', professionals: 'Dr. Carlos Médico' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Servicios</h1>
        <p class="text-gray-500 mt-1">Configura los servicios y asígnalos a profesionales.</p>
      </div>
      <UButton color="primary" icon="i-heroicons-plus">Nuevo Servicio</UButton>
    </div>

    <UCard class="bg-white">
      <UTable :columns="columns" :rows="services">
        <template #actions-data="{ row }">
          <UButton color="gray" variant="ghost" icon="i-heroicons-pencil-square" />
          <UButton color="red" variant="ghost" icon="i-heroicons-trash" />
        </template>
      </UTable>
    </UCard>
  </div>
</template>
