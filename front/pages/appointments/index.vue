<script setup>
definePageMeta({
  middleware: 'auth'
})

const { $api } = useNuxtApp()
const authStore = useAuthStore()
const toast = useToast()

const CalendarComponent = shallowRef(null)
const isModalOpen = ref(false)
const selectedProfessionalFilter = ref('all')
const appointments = ref([])
const patients = ref([])
const professionals = ref([])
const services = ref([])

const currentProfessional = computed(() => {
  return professionals.value.find(p => Number(p.user_id) === Number(authStore.user?.id))
})

const currentPatient = computed(() => {
  return patients.value.find(p => Number(p.user_id) === Number(authStore.user?.id))
})

const loading = reactive({
  list: false,
  create: false
})

const form = reactive({
  patient_id: null,
  professional_id: null,
  service_id: null,
  appointment_date: '',
  appointment_time: '',
  notes: ''
})

const patientOptions = computed(() => {
  return patients.value.map(patient => ({
    label: patient.full_name,
    value: patient.id
  }))
})

const professionalOptions = computed(() => {
  return professionals.value.map(professional => ({
    label: professional.full_name,
    value: professional.id
  }))
})

const professionalFilterOptions = computed(() => {
  return [
    { label: 'Todos los profesionales', value: 'all' },
    ...professionalOptions.value
  ]
})

const serviceOptions = computed(() => {
  return services.value
    .filter(service => !form.professional_id || service.professional_id === form.professional_id)
    .map(service => ({
      label: `${service.name} · $${Number(service.price).toFixed(2)}`,
      value: service.id
    }))
})

const filteredAppointments = computed(() => {
  if (selectedProfessionalFilter.value === 'all') {
    return appointments.value
  }

  return appointments.value.filter(appointment => Number(appointment.professional_id || appointment.professional?.id) === Number(selectedProfessionalFilter.value))
})

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada'
}

const statusColors = {
  pending: 'warning',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'error'
}

const calendarStatusColors = {
  pending: 'orange',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'red'
}

const calendarAttributes = computed(() => {
  return filteredAppointments.value
    .filter(appointment => appointment.appointment_date)
    .map(appointment => ({
      key: appointment.id,
      dates: new Date(appointment.appointment_date),
      dot: {
        color: calendarStatusColors[appointment.status] || 'gray'
      },
      popover: {
        label: `${appointment.patient?.full_name || 'Paciente'} · ${appointment.service?.name || 'Servicio'} · ${formatAppointmentDate(appointment.appointment_date)}`
      }
    }))
})

const formatAppointmentDate = (value) => {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

const resetForm = () => {
  Object.assign(form, {
    patient_id: authStore.hasRole(['Patient']) && currentPatient.value ? currentPatient.value.id : null,
    professional_id: authStore.hasRole(['Professional']) && currentProfessional.value ? currentProfessional.value.id : null,
    service_id: null,
    appointment_date: '',
    appointment_time: '',
    notes: ''
  })
}

const openCreateModal = () => {
  resetForm()
  isModalOpen.value = true
}

const closeCreateModal = () => {
  isModalOpen.value = false
  resetForm()
}

watch(() => form.professional_id, () => {
  form.service_id = null
})

const loadData = async () => {
  loading.list = true

  try {
    const [appointmentsResponse, patientsResponse, professionalsResponse, servicesResponse] = await Promise.all([
      $api.get('/appointments'),
      $api.get('/patients'),
      $api.get('/professionals'),
      $api.get('/services')
    ])

    appointments.value = appointmentsResponse.data.data || []
    patients.value = patientsResponse.data.data || []
    professionals.value = professionalsResponse.data.data || []
    services.value = servicesResponse.data.data || []
  } catch {
    toast.add({
      title: 'No se pudo cargar la agenda',
      color: 'error'
    })
  } finally {
    loading.list = false
  }
}

const createAppointment = async () => {
  loading.create = true

  try {
    const appointmentDate = new Date(`${form.appointment_date}T${form.appointment_time || '00:00'}`)

    await $api.post('/appointments', {
      patient_id: Number(form.patient_id),
      professional_id: Number(form.professional_id),
      service_id: Number(form.service_id),
      appointment_date: appointmentDate.toISOString(),
      notes: form.notes || null
    })

    toast.add({
      title: 'Cita creada',
      color: 'success'
    })
    closeCreateModal()
    await loadData()
  } catch {
    toast.add({
      title: 'No se pudo crear la cita',
      description: 'Verifica paciente, profesional, servicio y fecha.',
      color: 'error'
    })
  } finally {
    loading.create = false
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

const currentView = ref('weekly')
const selectedDate = ref(new Date())

const startOfWeekDate = computed(() => {
  const d = new Date(selectedDate.value)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(d.setDate(diff))
  start.setHours(0, 0, 0, 0)
  return start
})

const weekDays = computed(() => {
  const days = []
  const start = new Date(startOfWeekDate.value)

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(start)
    dayDate.setDate(start.getDate() + i)

    const weekdayName = new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(dayDate)
    const formattedWeekday = weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)
    const formattedDate = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(dayDate)

    days.push({
      date: dayDate,
      weekday: formattedWeekday,
      dateLabel: formattedDate
    })
  }
  return days
})

const weekRangeLabel = computed(() => {
  const start = startOfWeekDate.value
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const startLabel = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(start)
  const endLabel = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(end)

  return `${startLabel} - ${endLabel}`
})

const prevWeek = () => {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() - 7)
  selectedDate.value = d
}

const nextWeek = () => {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + 7)
  selectedDate.value = d
}

const goToday = () => {
  selectedDate.value = new Date()
}

const getAppointmentsForDay = (dayDate) => {
  const startOfDay = new Date(dayDate)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(dayDate)
  endOfDay.setHours(23, 59, 59, 999)

  return filteredAppointments.value.filter((appointment) => {
    if (!appointment.appointment_date) return false
    const aptDate = new Date(appointment.appointment_date)
    return aptDate >= startOfDay && aptDate <= endOfDay
  }).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
}

const formatAppointmentTime = (value) => {
  if (!value) return ''
  return new Intl.DateTimeFormat('es-MX', {
    timeStyle: 'short'
  }).format(new Date(value))
}

const isToday = (dayDate) => {
  const today = new Date()
  return dayDate.getDate() === today.getDate()
    && dayDate.getMonth() === today.getMonth()
    && dayDate.getFullYear() === today.getFullYear()
}

onMounted(async () => {
  const { Calendar } = await import('v-calendar')
  CalendarComponent.value = Calendar
  await loadData()
})
</script>

<template>
  <div class="space-y-6 pb-20 lg:pb-0">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-blue-600">
          Agenda
        </p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Citas
        </h2>
        <p class="mt-2 max-w-3xl text-sm text-slate-600">
          Programa citas vinculando paciente, profesional y servicio.
        </p>
      </div>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-heroicons-arrow-path"
          :loading="loading.list"
          @click="loadData"
        >
          Actualizar
        </UButton>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          @click="openCreateModal"
        >
          Nueva cita
        </UButton>
      </div>
    </div>

    <UCard class="bg-white">
      <template #header>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 class="font-semibold text-slate-950">
              Agenda registrada
            </h3>
            <p class="text-sm text-slate-500">
              {{ filteredAppointments.length }} citas visibles.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
            <USelect
              v-model="currentView"
              :items="[
                { label: 'Vista Semanal', value: 'weekly' },
                { label: 'Vista Clásica', value: 'classic' }
              ]"
              class="w-full sm:w-44"
            />
            <div class="w-full sm:w-80">
              <USelect
                v-model="selectedProfessionalFilter"
                :items="professionalFilterOptions"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Vista Semanal -->
      <div
        v-if="currentView === 'weekly'"
        class="space-y-6"
      >
        <!-- Barra de Navegación de la Semana -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-chevron-left"
              @click="prevWeek"
            />
            <UButton
              color="neutral"
              variant="subtle"
              size="sm"
              @click="goToday"
            >
              Hoy
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-chevron-right"
              @click="nextWeek"
            />
          </div>
          <h4 class="text-base font-semibold text-slate-800">
            {{ weekRangeLabel }}
          </h4>
          <div class="text-xs text-slate-500">
            Citas de Lunes a Domingo
          </div>
        </div>

        <!-- Cuadrícula Semanal (7 columnas) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          <div
            v-for="day in weekDays"
            :key="day.dateStr"
            class="flex flex-col min-h-[400px] rounded-xl border p-3 transition-all duration-200"
            :class="[
              isToday(day.date)
                ? 'bg-blue-50/75 border-blue-200 ring-2 ring-blue-100 shadow-md'
                : 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300'
            ]"
          >
            <!-- Encabezado del Día -->
            <div class="text-center pb-2.5 mb-3 border-b border-slate-200/60">
              <span
                class="block text-xs font-semibold uppercase tracking-wider"
                :class="isToday(day.date) ? 'text-blue-600' : 'text-slate-500'"
              >
                {{ day.weekday }}
              </span>
              <span
                class="block text-lg font-bold mt-0.5"
                :class="isToday(day.date) ? 'text-blue-700' : 'text-slate-800'"
              >
                {{ day.dateLabel }}
              </span>
            </div>

            <!-- Listado de Citas para el Día -->
            <div class="flex-1 space-y-2.5">
              <div
                v-for="appointment in getAppointmentsForDay(day.date)"
                :key="appointment.id"
                class="group relative flex flex-col rounded-lg border p-3 shadow-xs transition-all duration-200 hover:shadow-md"
                :class="[
                  appointment.status === 'pending' ? 'bg-orange-50/60 border-orange-200 hover:bg-orange-50/90 text-orange-950' : '',
                  appointment.status === 'confirmed' ? 'bg-blue-50/60 border-blue-200 hover:bg-blue-50/90 text-blue-950' : '',
                  appointment.status === 'completed' ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50/90 text-emerald-950' : '',
                  appointment.status === 'cancelled' ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-50/90 text-rose-950' : ''
                ]"
              >
                <!-- Hora de la Cita -->
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-bold font-mono tracking-tight flex items-center gap-1">
                    <UIcon
                      name="i-heroicons-clock"
                      class="h-3.5 w-3.5 opacity-80"
                    />
                    {{ formatAppointmentTime(appointment.appointment_date) }}
                  </span>
                  <!-- Badge del estado en la tarjeta -->
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                    :class="[
                      appointment.status === 'pending' ? 'bg-orange-100 text-orange-800' : '',
                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : '',
                      appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : '',
                      appointment.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : ''
                    ]"
                  >
                    {{ statusLabels[appointment.status] }}
                  </span>
                </div>

                <!-- Detalle de la Cita -->
                <div class="space-y-1 text-xs">
                  <div class="font-semibold line-clamp-1">
                    {{ appointment.patient?.full_name || 'Paciente' }}
                  </div>
                  <div class="text-slate-600 font-medium line-clamp-1 flex items-center gap-1">
                    <UIcon
                      name="i-heroicons-user"
                      class="h-3.5 w-3.5 opacity-75"
                    />
                    {{ appointment.professional?.full_name || 'Médico' }}
                  </div>
                  <div class="text-slate-500 font-medium line-clamp-1 flex items-center gap-1">
                    <UIcon
                      name="i-heroicons-briefcase"
                      class="h-3.5 w-3.5 opacity-75"
                    />
                    {{ appointment.service?.name || 'Servicio' }}
                  </div>
                </div>

                <!-- Botones de Acción Rápidas (al pasar el cursor / hover) -->
                <div
                  v-if="appointment.status === 'pending' || appointment.status === 'confirmed'"
                  class="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <UButton
                    color="primary"
                    variant="soft"
                    size="xs"
                    icon="i-heroicons-calendar"
                    square
                    title="Posponer Cita"
                    @click.stop="openPostponeModal(appointment)"
                  />
                  <UButton
                    color="rose"
                    variant="soft"
                    size="xs"
                    icon="i-heroicons-x-mark"
                    square
                    title="Cancelar Cita"
                    @click.stop="cancelAppointment(appointment.id)"
                  />
                </div>
              </div>

              <!-- Sin citas -->
              <div
                v-if="!getAppointmentsForDay(day.date).length"
                class="flex flex-col items-center justify-center py-8 text-slate-400 text-xs border border-dashed border-slate-200/60 rounded-lg bg-white/50"
              >
                <UIcon
                  name="i-heroicons-calendar"
                  class="h-5 w-5 mb-1 opacity-50 text-slate-300"
                />
                <span>Sin citas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Clásica -->
      <div
        v-else
        class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(360px,520px)_1fr]"
      >
        <div class="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <ClientOnly>
            <component
              :is="CalendarComponent"
              v-if="CalendarComponent"
              expanded
              :attributes="calendarAttributes"
            />
            <template #fallback>
              <div class="flex min-h-[420px] items-center justify-center rounded-lg bg-white text-sm text-slate-500">
                Cargando calendario...
              </div>
            </template>
          </ClientOnly>
          <div class="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4 xl:grid-cols-2">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-orange-400" />
              Pendiente
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Confirmada
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-green-500" />
              Completada
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-red-500" />
              Cancelada
            </div>
          </div>
        </div>

        <div class="min-w-0">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 text-sm">
              <thead>
                <tr class="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th class="py-3 pr-4">
                    Fecha
                  </th>
                  <th class="px-4 py-3">
                    Paciente
                  </th>
                  <th class="px-4 py-3">
                    Profesional
                  </th>
                  <th class="px-4 py-3">
                    Servicio
                  </th>
                  <th class="px-4 py-3">
                    Estado
                  </th>
                  <th class="py-3 pl-4 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="appointment in filteredAppointments"
                  :key="appointment.id"
                >
                  <td class="py-4 pr-4 font-semibold text-slate-950">
                    {{ formatAppointmentDate(appointment.appointment_date) }}
                  </td>
                  <td class="px-4 py-4 text-slate-600">
                    {{ appointment.patient?.full_name || 'Sin paciente' }}
                  </td>
                  <td class="px-4 py-4 text-slate-600">
                    {{ appointment.professional?.full_name || 'Sin profesional' }}
                  </td>
                  <td class="px-4 py-4 text-slate-600">
                    {{ appointment.service?.name || 'Sin servicio' }}
                  </td>
                  <td class="px-4 py-4">
                    <UBadge
                      :color="statusColors[appointment.status] || 'neutral'"
                      variant="soft"
                    >
                      {{ statusLabels[appointment.status] || appointment.status }}
                    </UBadge>
                  </td>
                  <td class="py-4 pl-4 text-right">
                    <div
                      v-if="appointment.status === 'pending' || appointment.status === 'confirmed'"
                      class="flex items-center justify-end gap-1.5"
                    >
                      <UButton
                        color="primary"
                        variant="soft"
                        size="xs"
                        icon="i-heroicons-calendar"
                        @click="openPostponeModal(appointment)"
                      >
                        Posponer
                      </UButton>
                      <UButton
                        color="rose"
                        variant="soft"
                        size="xs"
                        icon="i-heroicons-x-mark"
                        @click="cancelAppointment(appointment.id)"
                      >
                        Cancelar
                      </UButton>
                    </div>
                    <span
                      v-else
                      class="text-xs text-slate-400"
                    >
                      Sin acciones
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              v-if="!filteredAppointments.length"
              class="py-12 text-center text-sm text-slate-500"
            >
              No hay citas para el filtro seleccionado.
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <UModal
      v-model:open="isModalOpen"
      title="Nueva cita"
      description="Selecciona paciente, profesional, servicio y horario."
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #body>
        <UForm
          :state="form"
          class="space-y-4"
          @submit="createAppointment"
        >
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="Paciente">
              <USelectMenu
                v-model="form.patient_id"
                :items="patientOptions"
                placeholder="Selecciona paciente"
                value-key="value"
                label-key="label"
                :disabled="authStore.hasRole(['Patient'])"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Profesional">
              <USelectMenu
                v-model="form.professional_id"
                :items="professionalOptions"
                placeholder="Selecciona profesional"
                value-key="value"
                label-key="label"
                :disabled="authStore.hasRole(['Professional'])"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Servicio">
            <USelect
              v-model="form.service_id"
              :items="serviceOptions"
              placeholder="Selecciona servicio"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="Fecha">
              <UInput
                v-model="form.appointment_date"
                type="date"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Hora">
              <UInput
                v-model="form.appointment_time"
                type="time"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Notas">
            <UTextarea
              v-model="form.notes"
              placeholder="Motivo o información relevante"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeCreateModal"
            >
              Cancelar
            </UButton>
            <UButton
              type="submit"
              color="primary"
              icon="i-heroicons-calendar-days"
              :loading="loading.create"
            >
              Crear cita
            </UButton>
          </div>
        </UForm>
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
