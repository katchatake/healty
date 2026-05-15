<script setup>
definePageMeta({
  middleware: 'auth'
})

const stats = [
  { label: 'Citas de hoy', value: '24', icon: 'i-heroicons-calendar-days', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'En espera', value: '3', icon: 'i-heroicons-clock', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Completadas', value: '12', icon: 'i-heroicons-check-circle', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Canceladas', value: '1', icon: 'i-heroicons-x-circle', color: 'text-red-600', bg: 'bg-red-50' }
]

const queue = [
  { patient: 'Juan Pérez', time: '09:00', service: 'Consulta General' },
  { patient: 'María Gómez', time: '10:30', service: 'Chequeo Completo' },
  { patient: 'Ana Torres', time: '11:15', service: 'Primera vez' }
]
</script>

<template>
  <div class="space-y-6 pb-20 lg:pb-0">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-blue-600">
          Recepción
        </p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Operación del día
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          Control rápido de citas, sala de espera y seguimiento.
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        to="/appointments"
      >
        Nueva cita
      </UButton>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <UCard
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white"
      >
        <div class="flex items-center gap-4">
          <div :class="['rounded-lg p-3', stat.bg, stat.color]">
            <UIcon :name="stat.icon" class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500">
              {{ stat.label }}
            </p>
            <p class="text-3xl font-bold text-slate-950">
              {{ stat.value }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <UCard class="bg-white">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">
              Próximas llegadas
            </h3>
            <p class="text-sm text-slate-500">
              Pacientes agendados para las siguientes horas.
            </p>
          </div>
          <UButton
            color="neutral"
            variant="soft"
            icon="i-heroicons-calendar-days"
            to="/appointments"
          >
            Abrir agenda
          </UButton>
        </div>
      </template>

      <div class="divide-y divide-slate-100">
        <div
          v-for="item in queue"
          :key="`${item.time}-${item.patient}`"
          class="flex items-center gap-4 py-4"
        >
          <div class="w-16 rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-bold text-slate-700">
            {{ item.time }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-slate-950">
              {{ item.patient }}
            </p>
            <p class="text-sm text-slate-500">
              {{ item.service }}
            </p>
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-chevron-right"
            aria-label="Ver cita"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>
