<script setup>
definePageMeta({
  middleware: 'auth'
})

const kpis = [
  {
    title: 'Citas hoy',
    value: '8',
    detail: '2 pendientes por confirmar',
    icon: 'i-heroicons-calendar-days',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    title: 'Nuevos pacientes',
    value: '12',
    detail: 'Esta semana',
    icon: 'i-heroicons-user-plus',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  {
    title: 'Pendientes de cobro',
    value: '3',
    detail: 'Requieren seguimiento',
    icon: 'i-heroicons-banknotes',
    color: 'text-amber-600',
    bg: 'bg-amber-50'
  }
]

const agenda = [
  { time: '09:00', patient: 'Juan Pérez', service: 'Consulta General', status: 'Confirmada' },
  { time: '10:30', patient: 'María Gómez', service: 'Chequeo Completo', status: 'Pendiente' },
  { time: '12:00', patient: 'Luis Ramos', service: 'Seguimiento', status: 'Confirmada' }
]
</script>

<template>
  <div class="space-y-6 pb-20 lg:pb-0">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-blue-600">
          Panel profesional
        </p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Resumen de atención
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          Revisa tus citas, próximos pacientes y pendientes del día.
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-heroicons-document-text"
      >
        Iniciar consulta
      </UButton>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <UCard
        v-for="kpi in kpis"
        :key="kpi.title"
        class="bg-white"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-500">
              {{ kpi.title }}
            </p>
            <p class="mt-2 text-3xl font-bold text-slate-950">
              {{ kpi.value }}
            </p>
            <p class="mt-1 text-sm text-slate-500">
              {{ kpi.detail }}
            </p>
          </div>
          <div :class="['rounded-lg p-3', kpi.bg, kpi.color]">
            <UIcon :name="kpi.icon" class="h-6 w-6" />
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <UCard class="bg-white">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="font-semibold text-slate-950">
                Agenda de hoy
              </h3>
              <p class="text-sm text-slate-500">
                Próximas consultas programadas.
              </p>
            </div>
            <UButton
              color="neutral"
              variant="soft"
              icon="i-heroicons-calendar"
              to="/appointments"
            >
              Ver agenda
            </UButton>
          </div>
        </template>

        <div class="divide-y divide-slate-100">
          <div
            v-for="item in agenda"
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
            <UBadge
              :color="item.status === 'Confirmada' ? 'success' : 'warning'"
              variant="soft"
            >
              {{ item.status }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <UCard class="bg-blue-600 text-white">
        <div class="flex h-full flex-col justify-between gap-8">
          <div>
            <p class="text-sm font-semibold text-blue-100">
              Siguiente paciente
            </p>
            <h3 class="mt-2 text-3xl font-bold">
              María Gómez
            </h3>
            <p class="mt-2 text-blue-100">
              Chequeo de rutina
            </p>
            <div class="mt-4 flex items-center gap-2 text-sm text-blue-50">
              <UIcon name="i-heroicons-clock" class="h-5 w-5" />
              <span>10:30 AM - 11:30 AM</span>
            </div>
          </div>
          <UButton
            color="neutral"
            icon="i-heroicons-document-text"
            block
          >
            Abrir expediente
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
