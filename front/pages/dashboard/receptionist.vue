<script setup>
definePageMeta({
  middleware: [
    'auth',
    function () {
      const authStore = useAuthStore()
      if (!authStore.hasRole(['Admin', 'Root', 'Receptionist'])) {
        return navigateTo('/dashboard/professional')
      }
    }
  ]
})

const { $api } = useNuxtApp()
const toast = useToast()

const loading = ref(false)
const appointments = ref([])
const payments = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const [appResponse, payResponse] = await Promise.all([
      $api.get('/appointments'),
      $api.get('/payments')
    ])
    appointments.value = appResponse.data.data || []
    payments.value = payResponse.data.data || []
  } catch (err) {
    console.error('Error loading receptionist dashboard:', err)
  } finally {
    loading.value = false
  }
}

const todayAppointments = computed(() => {
  const todayStr = new Date().toDateString()
  return appointments.value
    .filter((app) => {
      const isToday = new Date(app.appointment_date).toDateString() === todayStr
      const isNotCancelled = app.status !== 'cancelled'
      return isToday && isNotCancelled
    })
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
})

const hasPayment = (appointmentId) => {
  return payments.value.some(p => p.appointment_id === appointmentId && p.status === 'completed')
}

const stats = computed(() => {
  const total = todayAppointments.value.length
  const waiting = todayAppointments.value.filter(app => app.status === 'pending' || app.status === 'confirmed').length
  const completed = todayAppointments.value.filter(app => app.status === 'completed').length
  const pendingPayment = todayAppointments.value.filter(app => app.status === 'completed' && !hasPayment(app.id)).length

  return [
    { label: 'Citas de hoy', value: String(total), icon: 'i-heroicons-calendar-days', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'En espera', value: String(waiting), icon: 'i-heroicons-clock', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Atendidas', value: String(completed), icon: 'i-heroicons-check-circle', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pagos pendientes', value: String(pendingPayment), icon: 'i-heroicons-banknotes', color: 'text-rose-600', bg: 'bg-rose-50' }
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

// Payment Modal State
const isPaymentModalOpen = ref(false)
const processingPayment = ref(false)
const selectedAppointment = ref(null)

const paymentForm = reactive({
  amount: 0,
  payment_method: 'cash'
})

const methodOptions = [
  { label: 'Efectivo', value: 'cash' },
  { label: 'Tarjeta de Crédito/Débito', value: 'card' },
  { label: 'Transferencia Bancaria', value: 'transfer' }
]

const openPaymentModal = (appointment) => {
  selectedAppointment.value = appointment
  paymentForm.amount = Number(appointment.service?.price || 0)
  paymentForm.payment_method = 'cash'
  isPaymentModalOpen.value = true
}

const closePaymentModal = () => {
  isPaymentModalOpen.value = false
  selectedAppointment.value = null
}

const registerPayment = async () => {
  if (!selectedAppointment.value) return
  processingPayment.value = true
  try {
    await $api.post('/payments', {
      appointment_id: selectedAppointment.value.id,
      amount: Number(paymentForm.amount),
      payment_method: paymentForm.payment_method,
      status: 'completed'
    })
    toast.add({
      title: 'Pago registrado',
      description: 'El cobro de la consulta se guardó exitosamente.',
      color: 'success'
    })
    closePaymentModal()
    await loadData()
  } catch {
    toast.add({
      title: 'Error de cobro',
      description: 'No se pudo registrar el pago. Inténtalo de nuevo.',
      color: 'error'
    })
  } finally {
    processingPayment.value = false
  }
}

const isPostponeModalOpen = ref(false)
const selectedAppointmentToPostpone = ref(null)
const postponeForm = reactive({
  date: '',
  time: ''
})

const openPostponeModal = (appointment) => {
  selectedAppointmentToPostpone.value = appointment
  const dateObj = new Date(appointment.appointment_date)
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  postponeForm.date = `${year}-${month}-${day}`
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  postponeForm.time = `${hours}:${minutes}`
  isPostponeModalOpen.value = true
}

const savePostpone = async () => {
  if (!selectedAppointmentToPostpone.value) return
  try {
    const newDate = new Date(`${postponeForm.date}T${postponeForm.time || '00:00'}`)
    await $api.patch(`/appointments/${selectedAppointmentToPostpone.value.id}`, {
      appointment_date: newDate.toISOString()
    })
    toast.add({
      title: 'Cita pospuesta',
      description: 'La fecha y hora de la cita se actualizaron con éxito.',
      color: 'success'
    })
    isPostponeModalOpen.value = false
    await loadData()
  } catch {
    toast.add({
      title: 'Error al posponer',
      description: 'No se pudo actualizar la cita. Verifica el formato.',
      color: 'error'
    })
  }
}

const cancelAppointment = async (appointmentId) => {
  if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return
  try {
    await $api.patch(`/appointments/${appointmentId}`, {
      status: 'cancelled'
    })
    toast.add({
      title: 'Cita cancelada',
      color: 'success'
    })
    await loadData()
  } catch {
    toast.add({
      title: 'Error al cancelar',
      color: 'error'
    })
  }
}

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Atendido',
  cancelled: 'Cancelada'
}

onMounted(loadData)
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
          Control rápido de citas, sala de espera y seguimiento de caja.
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-heroicons-arrow-path"
          :loading="loading"
          @click="loadData"
        >
          Actualizar
        </UButton>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          to="/appointments"
        >
          Nueva cita
        </UButton>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <UCard
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white shadow-lg"
      >
        <div class="flex items-center gap-4">
          <div :class="['rounded-lg p-3', stat.bg, stat.color]">
            <UIcon
              :name="stat.icon"
              class="h-6 w-6"
            />
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

    <!-- Lista de llegadas del día -->
    <UCard class="bg-white shadow-lg">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-950">
              Próximas consultas y seguimiento de cobro
            </h3>
            <p class="text-sm text-slate-500">
              Pacientes agendados para hoy y estado financiero de su sesión.
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
          v-for="item in todayAppointments"
          :key="item.id"
          class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4"
        >
          <div class="w-20 rounded-lg bg-slate-100 px-2 py-2 text-center text-xs font-bold text-slate-700">
            {{ formatTime(item.appointment_date) }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-slate-950">
              {{ item.patient?.full_name || 'Paciente' }}
            </p>
            <p class="text-sm text-slate-500 truncate">
              {{ item.service?.name || 'Servicio' }} · Dr(a). {{ item.professional?.full_name || 'Médico' }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <!-- Estado Cita -->
            <UBadge
              :color="item.status === 'completed' ? 'success' : (item.status === 'confirmed' ? 'primary' : 'warning')"
              variant="soft"
            >
              {{ statusLabels[item.status] || item.status }}
            </UBadge>

            <!-- Posponer / Cancelar if pending/confirmed -->
            <template v-if="item.status === 'pending' || item.status === 'confirmed'">
              <UButton
                color="neutral"
                variant="soft"
                size="sm"
                icon="i-heroicons-calendar"
                @click="openPostponeModal(item)"
              >
                Posponer
              </UButton>
              <UButton
                color="rose"
                variant="soft"
                size="sm"
                icon="i-heroicons-x-mark"
                @click="cancelAppointment(item.id)"
              >
                Cancelar
              </UButton>
            </template>

            <!-- Estado de Pago -->
            <template v-if="item.status === 'completed'">
              <UBadge
                v-if="hasPayment(item.id)"
                color="success"
                variant="subtle"
                icon="i-heroicons-check"
              >
                Pagada
              </UBadge>
              <div
                v-else
                class="flex items-center gap-2"
              >
                <UBadge
                  color="rose"
                  variant="subtle"
                  icon="i-heroicons-exclamation-triangle"
                >
                  Cobro pendiente
                </UBadge>
                <UButton
                  color="success"
                  variant="soft"
                  size="sm"
                  icon="i-heroicons-banknotes"
                  @click="openPaymentModal(item)"
                >
                  Cobrar
                </UButton>
              </div>
            </template>
          </div>
        </div>
        <div
          v-if="!todayAppointments.length"
          class="py-12 text-center text-sm text-slate-500"
        >
          No hay consultas registradas para el día de hoy.
        </div>
      </div>
    </UCard>

    <!-- Modal de Registro de Pago -->
    <UModal
      v-model:open="isPaymentModalOpen"
      title="Registrar Cobro de Consulta"
      description="Registra el cobro de la consulta finalizada de forma segura."
      :ui="{ content: 'max-w-md' }"
    >
      <template #body>
        <div
          v-if="selectedAppointment"
          class="space-y-4"
        >
          <div class="rounded-lg bg-slate-50 p-3.5 space-y-2 text-sm text-slate-700 border border-slate-100">
            <p><strong>Paciente:</strong> {{ selectedAppointment.patient?.full_name }}</p>
            <p><strong>Servicio:</strong> {{ selectedAppointment.service?.name }}</p>
            <p><strong>Especialista:</strong> {{ selectedAppointment.professional?.full_name }}</p>
          </div>

          <UForm
            :state="paymentForm"
            class="space-y-4"
            @submit="registerPayment"
          >
            <UFormField label="Monto a Cobrar ($ MXN)">
              <UInput
                v-model="paymentForm.amount"
                type="number"
                step="0.01"
                min="0"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Método de Pago">
              <USelect
                v-model="paymentForm.payment_method"
                :items="methodOptions"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <UButton
                color="neutral"
                variant="ghost"
                @click="closePaymentModal"
              >
                Cancelar
              </UButton>
              <UButton
                type="submit"
                color="success"
                icon="i-heroicons-check"
                :loading="processingPayment"
              >
                Confirmar Pago
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>

    <!-- Modal de Posponer Cita -->
    <UModal
      v-model:open="isPostponeModalOpen"
      title="Posponer Cita"
      description="Modifica la fecha y hora de la cita programada."
      :ui="{ content: 'max-w-md' }"
    >
      <template #body>
        <div
          v-if="selectedAppointmentToPostpone"
          class="space-y-4"
        >
          <div class="rounded-lg bg-slate-50 p-3.5 space-y-1.5 text-sm text-slate-700 border border-slate-100">
            <p><strong>Paciente:</strong> {{ selectedAppointmentToPostpone.patient?.full_name || 'Paciente' }}</p>
            <p><strong>Servicio:</strong> {{ selectedAppointmentToPostpone.service?.name || 'Servicio' }}</p>
            <p><strong>Profesional:</strong> {{ selectedAppointmentToPostpone.professional?.full_name || 'Médico' }}</p>
          </div>

          <UForm
            :state="postponeForm"
            class="space-y-4"
            @submit="savePostpone"
          >
            <UFormField label="Nueva Fecha">
              <UInput
                v-model="postponeForm.date"
                type="date"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Nueva Hora">
              <UInput
                v-model="postponeForm.time"
                type="time"
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <UButton
                color="neutral"
                variant="ghost"
                @click="isPostponeModalOpen = false"
              >
                Cancelar
              </UButton>
              <UButton
                type="submit"
                color="primary"
                icon="i-heroicons-calendar"
              >
                Actualizar Horario
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </UModal>
  </div>
</template>
