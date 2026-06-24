<script setup>
definePageMeta({
  middleware: [
    'auth',
    function () {
      const authStore = useAuthStore()
      if (!authStore.hasRole(['Admin', 'Root', 'Professional'])) {
        return navigateTo('/dashboard/receptionist')
      }
    }
  ]
})

const { $api } = useNuxtApp()
const authStore = useAuthStore()

const loading = ref(false)
const professionals = ref([])
const appointments = ref([])
const patients = ref([])

const currentProfessional = computed(() => {
  return professionals.value.find(p => Number(p.user_id) === Number(authStore.user?.id))
})

const todayAppointments = computed(() => {
  if (!currentProfessional.value) return []
  const todayStr = new Date().toDateString()
  return appointments.value
    .filter((app) => {
      const isSameDoc = Number(app.professional_id || app.professional?.id) === Number(currentProfessional.value.id)
      const isToday = new Date(app.appointment_date).toDateString() === todayStr
      const isNotCancelled = app.status !== 'cancelled'
      return isSameDoc && isToday && isNotCancelled
    })
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
})

const nextAppointment = computed(() => {
  return todayAppointments.value.find(app => app.status === 'confirmed' || app.status === 'pending')
})

const kpiStats = computed(() => {
  const totalToday = todayAppointments.value.length
  const pendingConfirm = todayAppointments.value.filter(app => app.status === 'pending').length
  const completedToday = todayAppointments.value.filter(app => app.status === 'completed').length

  return [
    {
      title: 'Mis citas hoy',
      value: String(totalToday),
      detail: `${pendingConfirm} pendientes por confirmar`,
      icon: 'i-heroicons-calendar-days',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Pacientes registrados',
      value: String(patients.value.length),
      detail: 'En el sistema clínico',
      icon: 'i-heroicons-user-plus',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Consultas atendidas hoy',
      value: String(completedToday),
      detail: 'Listas para cobro en caja',
      icon: 'i-heroicons-check-circle',
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ]
})

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada'
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    const [profResponse, appResponse, patResponse] = await Promise.all([
      $api.get('/professionals'),
      $api.get('/appointments'),
      $api.get('/patients')
    ])
    professionals.value = profResponse.data.data || []
    appointments.value = appResponse.data.data || []
    patients.value = patResponse.data.data || []
  } catch (err) {
    console.error('Error loading professional dashboard:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboardData)
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
      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-heroicons-arrow-path"
          :loading="loading"
          @click="loadDashboardData"
        >
          Actualizar
        </UButton>
        <UButton
          color="primary"
          icon="i-heroicons-play"
          to="/patients"
        >
          Iniciar Consulta
        </UButton>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <UCard
        v-for="kpi in kpiStats"
        :key="kpi.title"
        class="bg-white shadow-lg"
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
            <UIcon
              :name="kpi.icon"
              class="h-6 w-6"
            />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Agenda y Paciente Destacado -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <UCard class="bg-white shadow-lg">
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
            v-for="item in todayAppointments"
            :key="item.id"
            class="flex items-center gap-4 py-4"
          >
            <div class="w-20 rounded-lg bg-slate-100 px-2 py-2 text-center text-xs font-bold text-slate-700">
              {{ formatTime(item.appointment_date) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-slate-950">
                {{ item.patient?.full_name || 'Paciente' }}
              </p>
              <p class="text-sm text-slate-500">
                {{ item.service?.name || 'Servicio' }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <UBadge
                :color="item.status === 'completed' ? 'success' : (item.status === 'confirmed' ? 'primary' : 'warning')"
                variant="soft"
              >
                {{ statusLabels[item.status] || item.status }}
              </UBadge>
              <UButton
                v-if="item.status === 'confirmed' || item.status === 'pending'"
                color="primary"
                variant="soft"
                size="sm"
                icon="i-heroicons-play"
                :to="`/patients/${item.patient_id || item.patient?.id}/record?appointment_id=${item.id}`"
              >
                Iniciar
              </UButton>
            </div>
          </div>
          <div
            v-if="!todayAppointments.length"
            class="py-8 text-center text-sm text-slate-500"
          >
            No tienes consultas programadas para hoy.
          </div>
        </div>
      </UCard>

      <UCard class="bg-blue-600 text-white shadow-lg">
        <div class="flex h-full flex-col justify-between gap-8">
          <div v-if="nextAppointment">
            <p class="text-sm font-semibold text-blue-100">
              Siguiente paciente
            </p>
            <h3 class="mt-2 text-3xl font-bold truncate">
              {{ nextAppointment.patient?.full_name || 'Paciente' }}
            </h3>
            <p class="mt-2 text-blue-100 truncate">
              {{ nextAppointment.service?.name || 'Servicio' }}
            </p>
            <div class="mt-4 flex items-center gap-2 text-sm text-blue-50">
              <UIcon
                name="i-heroicons-clock"
                class="h-5 w-5"
              />
              <span>{{ formatTime(nextAppointment.appointment_date) }}</span>
            </div>
          </div>
          <div v-else>
            <p class="text-sm font-semibold text-blue-100">
              Sin pacientes en cola
            </p>
            <h3 class="mt-2 text-2xl font-bold">
              Excelente jornada
            </h3>
            <p class="mt-2 text-blue-100">
              No tienes más consultas pendientes de inicio hoy.
            </p>
          </div>
          <UButton
            v-if="nextAppointment"
            color="neutral"
            icon="i-heroicons-document-text"
            block
            :to="`/patients/${nextAppointment.patient_id || nextAppointment.patient?.id}/record?appointment_id=${nextAppointment.id}`"
          >
            Atender ahora
          </UButton>
          <UButton
            v-else
            color="neutral"
            icon="i-heroicons-users"
            block
            to="/patients"
          >
            Ver pacientes
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
