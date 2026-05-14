<script setup>
// Professional Dashboard mock data
const kpis = [
  { title: 'Citas Hoy', value: '8', icon: 'i-heroicons-calendar-days', color: 'text-blue-500' },
  { title: 'Nuevos Pacientes', value: '12', icon: 'i-heroicons-user-plus', color: 'text-emerald-500' },
  { title: 'Pendientes de Cobro', value: '3', icon: 'i-heroicons-currency-dollar', color: 'text-amber-500' }
]
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Dashboard Profesional</h1>

    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard v-for="(kpi, index) in kpis" :key="index" class="bg-white">
        <div class="flex items-center gap-4">
          <div :class="['p-3 rounded-lg bg-gray-50', kpi.color]">
            <UIcon :name="kpi.icon" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ kpi.title }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ kpi.value }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Next Patient -->
    <h2 class="text-lg font-semibold text-gray-900 mt-8 mb-4">Siguiente Paciente</h2>
    <UCard class="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-2xl font-bold">María Gómez</h3>
          <p class="text-blue-100 mt-1">Motivo: Chequeo de rutina</p>
          <div class="flex items-center gap-2 mt-2 text-sm text-blue-100">
            <UIcon name="i-heroicons-clock" />
            <span>10:30 AM - 11:30 AM</span>
          </div>
        </div>
        <div>
          <UButton color="white" variant="solid" size="lg" icon="i-heroicons-document-text">
            Iniciar Consulta
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
