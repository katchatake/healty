<script setup>
definePageMeta({
  middleware: 'auth'
})

const { $api } = useNuxtApp()
const toast = useToast()

const CalendarComponent = shallowRef(null)
const isModalOpen = ref(false)
const selectedProfessionalFilter = ref('all')
const appointments = ref([])
const patients = ref([])
const professionals = ref([])
const services = ref([])

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

  return appointments.value.filter(appointment => appointment.professional_id === selectedProfessionalFilter.value)
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
    patient_id: null,
    professional_id: null,
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
      patient_id: form.patient_id,
      professional_id: form.professional_id,
      service_id: form.service_id,
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
          <div class="w-full lg:w-80">
            <USelect
              v-model="selectedProfessionalFilter"
              :items="professionalFilterOptions"
              class="w-full"
            />
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(360px,520px)_1fr]">
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
                  <th class="py-3 pl-4">
                    Estado
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
                  <td class="py-4 pl-4">
                    <UBadge
                      :color="statusColors[appointment.status] || 'neutral'"
                      variant="soft"
                    >
                      {{ statusLabels[appointment.status] || appointment.status }}
                    </UBadge>
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
              <USelect
                v-model="form.patient_id"
                :items="patientOptions"
                placeholder="Selecciona paciente"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Profesional">
              <USelect
                v-model="form.professional_id"
                :items="professionalOptions"
                placeholder="Selecciona profesional"
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
  </div>
</template>
