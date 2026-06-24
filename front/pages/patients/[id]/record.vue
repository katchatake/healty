<script setup>
definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const { $api } = useNuxtApp()
const authStore = useAuthStore()
const toast = useToast()

const patient = ref(null)
const records = ref([])
const professionals = ref([])
const isModalOpen = ref(false)

const loading = reactive({
  patient: false,
  records: false,
  professionals: false,
  create: false
})

const form = reactive({
  professional_id: null,
  record_type: 'general',
  notes: '',
  // Medicina General
  blood_pressure: '',
  weight_kg: '',
  temperature_c: '',
  height_cm: '',
  heart_rate_bpm: '',
  physical_exploration: '',
  treatment: '',
  // Psicología
  consultation_reason: '',
  mood_affect: '',
  anxiety_level: 'Bajo', // Bajo, Medio, Alto
  behavioral_observations: '',
  therapy_plan: '',
  // Nutrición
  fat_percentage: '',
  muscle_percentage: '',
  dietary_habits: '',
  allergies_restrictions: '',
  patient_goal: 'Pérdida de peso', // Pérdida de peso, Ganancia muscular, Mantenimiento, Salud
  // Fisioterapia
  injury_zone: '',
  pain_scale: 5, // 1 to 10
  range_of_motion: '',
  functional_tests: '',
  rehab_plan: ''
})

const recordTypes = [
  { label: 'Medicina General', value: 'general' },
  { label: 'Nutrición', value: 'nutricion' },
  { label: 'Psicología', value: 'psicologia' },
  { label: 'Fisioterapia', value: 'fisioterapia' }
]

const anxietyOptions = [
  { label: 'Bajo', value: 'Bajo' },
  { label: 'Medio', value: 'Medio' },
  { label: 'Alto', value: 'Alto' }
]

const goalOptions = [
  { label: 'Pérdida de peso', value: 'Pérdida de peso' },
  { label: 'Ganancia muscular', value: 'Ganancia muscular' },
  { label: 'Mantenimiento', value: 'Mantenimiento' },
  { label: 'Salud / Rendimiento', value: 'Salud / Rendimiento' }
]

const getVal = (val) => {
  if (typeof val === 'object' && val !== null) {
    return val.value
  }
  return val
}

const formRecordType = computed(() => getVal(form.record_type))

const getRecordTypeFromSpecialty = (specialty) => {
  if (!specialty) return 'general'
  const spec = specialty.toLowerCase()
  if (spec.includes('psico')) return 'psicologia'
  if (spec.includes('nutri')) return 'nutricion'
  if (spec.includes('fisio') || spec.includes('rehab')) return 'fisioterapia'
  return 'general'
}

const resetForm = () => {
  Object.assign(form, {
    professional_id: currentProfessional.value?.id || null,
    record_type: currentProfessional.value ? getRecordTypeFromSpecialty(currentProfessional.value.specialty) : 'general',
    notes: '',
    blood_pressure: '',
    weight_kg: '',
    temperature_c: '',
    height_cm: '',
    heart_rate_bpm: '',
    physical_exploration: '',
    treatment: '',
    consultation_reason: '',
    mood_affect: '',
    anxiety_level: 'Bajo',
    behavioral_observations: '',
    therapy_plan: '',
    fat_percentage: '',
    muscle_percentage: '',
    dietary_habits: '',
    allergies_restrictions: '',
    patient_goal: 'Pérdida de peso',
    injury_zone: '',
    pain_scale: 5,
    range_of_motion: '',
    functional_tests: '',
    rehab_plan: ''
  })
}

const openCreateModal = () => {
  activeAppointmentId.value = null
  resetForm()
  isModalOpen.value = true
}

const closeCreateModal = () => {
  isModalOpen.value = false
  resetForm()
}

const currentProfessional = computed(() => {
  return professionals.value.find(p => p.user_id === authStore.user?.id)
})

const canViewRecords = computed(() => authStore.hasRole(['Admin', 'Root', 'Professional']))

const professionalOptions = computed(() => {
  return professionals.value.map(p => ({
    label: p.full_name,
    value: p.id
  }))
})

const calculateAge = (dobString) => {
  if (!dobString) return 'No especificada'
  const birthDate = new Date(dobString)
  const difference = Date.now() - birthDate.getTime()
  if (difference < 0) return 'No especificada'
  const ageDate = new Date(difference)
  return Math.abs(ageDate.getUTCFullYear() - 1970) + ' años'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getRecordTypeLabel = (type) => {
  return recordTypes.find(t => t.value === type)?.label || type
}

const loadPatient = async () => {
  loading.patient = true
  try {
    const response = await $api.get(`/patients/${route.params.id}`)
    patient.value = response.data.data
  } catch {
    toast.add({
      title: 'Error',
      description: 'No se pudo cargar la información del paciente',
      color: 'error'
    })
  } finally {
    loading.patient = false
  }
}

const loadRecords = async () => {
  loading.records = true
  try {
    const response = await $api.get(`/medical-records/patient/${route.params.id}`)
    records.value = response.data.data || []
  } catch {
    toast.add({
      title: 'Error',
      description: 'No se pudieron cargar los registros médicos del paciente',
      color: 'error'
    })
  } finally {
    loading.records = false
  }
}

const loadProfessionals = async () => {
  loading.professionals = true
  try {
    const response = await $api.get('/professionals')
    professionals.value = response.data.data || []
    if (currentProfessional.value) {
      form.professional_id = currentProfessional.value.id
      form.record_type = getRecordTypeFromSpecialty(currentProfessional.value.specialty)
    }
  } catch {
    toast.add({
      title: 'Error',
      description: 'No se pudo cargar la lista de profesionales',
      color: 'error'
    })
  } finally {
    loading.professionals = false
  }
}

const getImcColor = (imc) => {
  if (!imc) return 'neutral'
  const val = Number(imc)
  if (val < 18.5) return 'warning'
  if (val < 25) return 'success'
  if (val < 30) return 'warning'
  return 'error'
}

const getPainColor = (val) => {
  const pain = Number(val)
  if (pain <= 3) return 'success'
  if (pain <= 7) return 'warning'
  return 'error'
}

const submitRecord = async () => {
  loading.create = true

  const recordType = formRecordType.value
  const professionalId = getVal(form.professional_id)
  const anxietyLevel = getVal(form.anxiety_level)
  const patientGoal = getVal(form.patient_goal)

  let specialtyData = {}

  if (recordType === 'general') {
    specialtyData = {
      blood_pressure: form.blood_pressure || null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      temperature_c: form.temperature_c ? Number(form.temperature_c) : null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      heart_rate_bpm: form.heart_rate_bpm ? Number(form.heart_rate_bpm) : null,
      physical_exploration: form.physical_exploration || null,
      treatment: form.treatment || null
    }
  } else if (recordType === 'psicologia') {
    specialtyData = {
      consultation_reason: form.consultation_reason || null,
      mood_affect: form.mood_affect || null,
      anxiety_level: anxietyLevel || null,
      behavioral_observations: form.behavioral_observations || null,
      therapy_plan: form.therapy_plan || null
    }
  } else if (recordType === 'nutricion') {
    const w = form.weight_kg ? Number(form.weight_kg) : 0
    const h = form.height_cm ? Number(form.height_cm) / 100 : 0
    const imc = w && h ? (w / (h * h)).toFixed(1) : null

    specialtyData = {
      weight_kg: w || null,
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      imc: imc ? Number(imc) : null,
      fat_percentage: form.fat_percentage ? Number(form.fat_percentage) : null,
      muscle_percentage: form.muscle_percentage ? Number(form.muscle_percentage) : null,
      dietary_habits: form.dietary_habits || null,
      allergies_restrictions: form.allergies_restrictions || null,
      patient_goal: patientGoal || null
    }
  } else if (recordType === 'fisioterapia') {
    specialtyData = {
      injury_zone: form.injury_zone || null,
      pain_scale: Number(form.pain_scale),
      range_of_motion: form.range_of_motion || null,
      functional_tests: form.functional_tests || null,
      rehab_plan: form.rehab_plan || null
    }
  }

  const appointmentIdToComplete = activeAppointmentId.value
  const requestData = {
    patient_id: Number(route.params.id),
    professional_id: Number(professionalId || currentProfessional.value?.id),
    appointment_id: appointmentIdToComplete ? Number(appointmentIdToComplete) : null,
    record_type: recordType,
    notes: form.notes,
    data: specialtyData
  }

  try {
    await $api.post('/medical-records', requestData)
    if (appointmentIdToComplete) {
      await $api.patch(`/appointments/${appointmentIdToComplete}`, { status: 'completed' })
      activeAppointmentId.value = null
      await loadPatientAppointments()
    }
    toast.add({
      title: 'Nota agregada',
      description: 'El expediente se actualizó correctamente',
      color: 'success'
    })
    closeCreateModal()
    await loadRecords()
  } catch {
    toast.add({
      title: 'Error',
      description: 'No se pudo guardar la información del expediente',
      color: 'error'
    })
  } finally {
    loading.create = false
  }
}

const patientAppointments = ref([])
const activeAppointmentId = ref(null)

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const loadPatientAppointments = async () => {
  try {
    const response = await $api.get(`/appointments/patient/${route.params.id}`)
    patientAppointments.value = response.data.data || []
  } catch (err) {
    console.error('Error loading patient appointments:', err)
  }
}

const todayPendingAppointments = computed(() => {
  if (!currentProfessional.value) return []
  const todayStr = new Date().toDateString()
  return patientAppointments.value.filter((app) => {
    const isSameDoc = Number(app.professional_id || app.professional?.id) === Number(currentProfessional.value.id)
    const isToday = new Date(app.appointment_date).toDateString() === todayStr
    const isPendingOrConfirmed = app.status === 'pending' || app.status === 'confirmed'
    return isSameDoc && isToday && isPendingOrConfirmed
  })
})

const startSpecificAppointment = (app) => {
  activeAppointmentId.value = app.id
  if (app.professional_id || app.professional?.id) {
    form.professional_id = app.professional_id || app.professional?.id
  }

  const serviceName = (app.service?.name || '').toLowerCase()
  if (serviceName.includes('psico')) {
    form.record_type = 'psicologia'
  } else if (serviceName.includes('nutri')) {
    form.record_type = 'nutricion'
  } else if (serviceName.includes('fisio') || serviceName.includes('rehab')) {
    form.record_type = 'fisioterapia'
  } else {
    form.record_type = 'general'
  }

  isModalOpen.value = true
}

onMounted(async () => {
  const promises = [
    loadPatient(),
    loadProfessionals()
  ]

  if (canViewRecords.value) {
    promises.push(loadRecords())
    promises.push(loadPatientAppointments())
  }

  await Promise.all(promises)

  if (route.query.appointment_id && canViewRecords.value) {
    activeAppointmentId.value = Number(route.query.appointment_id)
    const app = patientAppointments.value.find(a => Number(a.id) === Number(activeAppointmentId.value))
    if (app) {
      const serviceName = (app.service?.name || '').toLowerCase()
      if (serviceName.includes('psico')) {
        form.record_type = 'psicologia'
      } else if (serviceName.includes('nutri')) {
        form.record_type = 'nutricion'
      } else if (serviceName.includes('fisio') || serviceName.includes('rehab')) {
        form.record_type = 'fisioterapia'
      } else {
        form.record_type = 'general'
      }
    }
    isModalOpen.value = true
  }
})
</script>

<template>
  <div class="space-y-6 pb-20 lg:pb-0">
    <div class="flex items-center gap-3">
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-heroicons-arrow-left"
        to="/patients"
      >
        Volver a pacientes
      </UButton>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-blue-600">
          Expediente Clínico
        </p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Historial Médico del Paciente
        </h2>
      </div>
      <UButton
        v-if="authStore.hasRole(['Admin', 'Root', 'Professional'])"
        color="primary"
        icon="i-heroicons-plus"
        @click="openCreateModal"
      >
        Nueva Consulta
      </UButton>
    </div>

    <!-- Alert / Banner for pending appointment today -->
    <div
      v-if="todayPendingAppointments.length > 0 && authStore.hasRole(['Professional'])"
      class="rounded-lg bg-blue-50 border border-blue-200 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm"
    >
      <div class="flex items-start gap-3">
        <UIcon
          name="i-heroicons-information-circle"
          class="h-6 w-6 text-blue-600 shrink-0 mt-0.5"
        />
        <div>
          <p class="font-semibold text-blue-900">
            Cita programada para hoy
          </p>
          <p class="text-sm text-blue-700">
            El paciente tiene una consulta pendiente de iniciar hoy a las {{ formatTime(todayPendingAppointments[0].appointment_date) }} con {{ todayPendingAppointments[0].service?.name || 'Servicio' }}.
          </p>
        </div>
      </div>
      <UButton
        color="primary"
        icon="i-heroicons-play"
        size="sm"
        class="w-fit shrink-0"
        @click="startSpecificAppointment(todayPendingAppointments[0])"
      >
        Iniciar consulta de cita
      </UButton>
    </div>

    <div
      v-if="patient"
      class="grid grid-cols-1 gap-6 lg:grid-cols-[0.35fr_0.65fr]"
    >
      <!-- Perfil del Paciente -->
      <UCard class="h-fit bg-white">
        <template #header>
          <div class="flex flex-col items-center text-center">
            <UAvatar
              :text="patient.full_name.charAt(0).toUpperCase()"
              size="lg"
              class="mb-3"
            />
            <h3 class="font-bold text-slate-950">
              {{ patient.full_name }}
            </h3>
            <p class="text-sm text-slate-500">
              {{ patient.user?.email || 'Sin cuenta asociada' }}
            </p>
          </div>
        </template>

        <div class="space-y-4 text-sm text-slate-700">
          <div>
            <span class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Edad
            </span>
            <p class="mt-0.5 font-medium text-slate-900">
              {{ calculateAge(patient.date_of_birth) }} ({{ patient.date_of_birth || 'Fecha no registrada' }})
            </p>
          </div>
          <div>
            <span class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Género
            </span>
            <p class="mt-0.5 font-medium text-slate-900 capitalize">
              {{ patient.gender || 'No especificado' }}
            </p>
          </div>
          <div>
            <span class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Teléfono
            </span>
            <p class="mt-0.5 font-medium text-slate-900">
              {{ patient.phone || 'No registrado' }}
            </p>
          </div>
          <div>
            <span class="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contacto de Emergencia
            </span>
            <p class="mt-0.5 font-medium text-slate-900">
              {{ patient.emergency_contact || 'No registrado' }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Historial de Expedientes -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-slate-950">
          Notas de Evolución y Consultas
        </h3>

        <div
          v-if="!canViewRecords"
          class="rounded-lg border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-500 shadow-sm"
        >
          <UIcon
            name="i-heroicons-lock-closed"
            class="mx-auto h-8 w-8 text-slate-400 mb-2"
          />
          Solo el personal médico tiene permisos para consultar el expediente clínico.
        </div>

        <div
          v-else-if="loading.records"
          class="flex justify-center py-12"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="h-8 w-8 animate-spin text-blue-500"
          />
        </div>

        <template v-else-if="records.length > 0">
          <UCard
            v-for="record in records"
            :key="record.id"
            class="bg-white shadow-lg"
          >
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <UBadge
                    color="primary"
                    variant="soft"
                  >
                    {{ getRecordTypeLabel(record.record_type) }}
                  </UBadge>
                </div>
                <span class="text-xs text-slate-400">
                  {{ formatDate(record.created_date) }}
                </span>
              </div>
            </template>

            <div class="space-y-4">
              <!-- Notas / Observaciones generales -->
              <div v-if="record.notes">
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Notas de Consulta
                </span>
                <p class="mt-1 whitespace-pre-line text-sm text-slate-800">
                  {{ record.notes }}
                </p>
              </div>

              <!-- FORMATO DINÁMICO: Medicina General -->
              <div
                v-if="record.record_type === 'general' && record.data"
                class="space-y-3 rounded-lg bg-slate-50 p-4"
              >
                <span class="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Detalles de Medicina General
                </span>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div v-if="record.data.blood_pressure">
                    <p class="text-xs text-slate-400">
                      Presión Arterial
                    </p>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ record.data.blood_pressure }} mmHg
                    </p>
                  </div>
                  <div v-if="record.data.weight_kg">
                    <p class="text-xs text-slate-400">
                      Peso
                    </p>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ record.data.weight_kg }} kg
                    </p>
                  </div>
                  <div v-if="record.data.temperature_c">
                    <p class="text-xs text-slate-400">
                      Temperatura
                    </p>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ record.data.temperature_c }} °C
                    </p>
                  </div>
                  <div v-if="record.data.heart_rate_bpm">
                    <p class="text-xs text-slate-400">
                      Frecuencia Cardíaca
                    </p>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ record.data.heart_rate_bpm }} lpm
                    </p>
                  </div>
                </div>
                <div
                  v-if="record.data.physical_exploration"
                  class="mt-2 border-t border-slate-200/60 pt-2"
                >
                  <p class="text-xs text-slate-400">
                    Exploración Física
                  </p>
                  <p class="text-sm text-slate-800">
                    {{ record.data.physical_exploration }}
                  </p>
                </div>
                <div
                  v-if="record.data.treatment"
                  class="mt-2 border-t border-slate-200/60 pt-2"
                >
                  <p class="text-xs text-slate-400">
                    Receta / Tratamiento
                  </p>
                  <p class="text-sm font-medium text-blue-700 bg-blue-50/50 p-2 rounded border border-blue-100/50">
                    {{ record.data.treatment }}
                  </p>
                </div>
              </div>

              <!-- FORMATO DINÁMICO: Psicología -->
              <div
                v-if="record.record_type === 'psicologia' && record.data"
                class="space-y-3 rounded-lg bg-blue-50/30 p-4 border border-blue-100/50"
              >
                <span class="block text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Expediente Psicológico
                </span>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div v-if="record.data.consultation_reason">
                    <p class="text-xs text-slate-400">
                      Motivo de consulta
                    </p>
                    <p class="text-sm text-slate-800">
                      {{ record.data.consultation_reason }}
                    </p>
                  </div>
                  <div v-if="record.data.mood_affect">
                    <p class="text-xs text-slate-400">
                      Estado de Ánimo / Afecto
                    </p>
                    <p class="text-sm text-slate-800">
                      {{ record.data.mood_affect }}
                    </p>
                  </div>
                </div>
                <div
                  v-if="record.data.anxiety_level"
                  class="mt-2"
                >
                  <p class="text-xs text-slate-400">
                    Nivel de Ansiedad
                  </p>
                  <UBadge
                    :color="record.data.anxiety_level === 'Bajo' ? 'success' : (record.data.anxiety_level === 'Medio' ? 'warning' : 'error')"
                    variant="soft"
                    size="sm"
                    class="mt-1"
                  >
                    {{ record.data.anxiety_level }}
                  </UBadge>
                </div>
                <div
                  v-if="record.data.behavioral_observations"
                  class="mt-2 border-t border-slate-100 pt-2"
                >
                  <p class="text-xs text-slate-400">
                    Observaciones Conductuales
                  </p>
                  <p class="text-sm text-slate-800">
                    {{ record.data.behavioral_observations }}
                  </p>
                </div>
                <div
                  v-if="record.data.therapy_plan"
                  class="mt-2 border-t border-blue-100 pt-2"
                >
                  <p class="text-xs text-blue-500 font-semibold">
                    Plan de Terapia
                  </p>
                  <p class="text-sm text-slate-800 bg-white p-2.5 rounded border border-slate-100 mt-1">
                    {{ record.data.therapy_plan }}
                  </p>
                </div>
              </div>

              <!-- FORMATO DINÁMICO: Nutrición -->
              <div
                v-if="record.record_type === 'nutricion' && record.data"
                class="space-y-3 rounded-lg bg-emerald-50/20 p-4 border border-emerald-100/50"
              >
                <span class="block text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Evaluación Nutricional
                </span>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div v-if="record.data.weight_kg">
                    <p class="text-xs text-slate-400">
                      Peso
                    </p>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ record.data.weight_kg }} kg
                    </p>
                  </div>
                  <div v-if="record.data.height_cm">
                    <p class="text-xs text-slate-400">
                      Estatura
                    </p>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ record.data.height_cm }} cm
                    </p>
                  </div>
                  <div v-if="record.data.imc">
                    <p class="text-xs text-slate-400">
                      IMC
                    </p>
                    <UBadge
                      :color="getImcColor(record.data.imc)"
                      variant="soft"
                      size="sm"
                      class="mt-0.5"
                    >
                      {{ record.data.imc }}
                    </UBadge>
                  </div>
                  <div v-if="record.data.fat_percentage">
                    <p class="text-xs text-slate-400">
                      % Grasa
                    </p>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ record.data.fat_percentage }}%
                    </p>
                  </div>
                  <div v-if="record.data.muscle_percentage">
                    <p class="text-xs text-slate-400">
                      % Músculo
                    </p>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ record.data.muscle_percentage }}%
                    </p>
                  </div>
                </div>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 mt-2 pt-2 border-t border-slate-100">
                  <div v-if="record.data.dietary_habits">
                    <p class="text-xs text-slate-400">
                      Hábitos Alimenticios
                    </p>
                    <p class="text-sm text-slate-700">
                      {{ record.data.dietary_habits }}
                    </p>
                  </div>
                  <div v-if="record.data.allergies_restrictions">
                    <p class="text-xs text-slate-400">
                      Alergias o Restricciones
                    </p>
                    <p class="text-sm text-red-600 font-semibold">
                      {{ record.data.allergies_restrictions }}
                    </p>
                  </div>
                </div>
                <div
                  v-if="record.data.patient_goal"
                  class="mt-2 pt-2 border-t border-slate-100"
                >
                  <p class="text-xs text-slate-400">
                    Objetivo del Paciente
                  </p>
                  <UBadge
                    color="emerald"
                    variant="subtle"
                    class="mt-1"
                  >
                    {{ record.data.patient_goal }}
                  </UBadge>
                </div>
              </div>

              <!-- FORMATO DINÁMICO: Fisioterapia -->
              <div
                v-if="record.record_type === 'fisioterapia' && record.data"
                class="space-y-3 rounded-lg bg-purple-50/30 p-4 border border-purple-100/50"
              >
                <span class="block text-xs font-semibold text-purple-600 uppercase tracking-wider">
                  Valoración Fisioterapéutica
                </span>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div v-if="record.data.injury_zone">
                    <p class="text-xs text-slate-400">
                      Zona de lesión / Molestia
                    </p>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ record.data.injury_zone }}
                    </p>
                  </div>
                  <div v-if="record.data.pain_scale">
                    <p class="text-xs text-slate-400">
                      Nivel de Dolor (EVA)
                    </p>
                    <UBadge
                      :color="getPainColor(record.data.pain_scale)"
                      variant="soft"
                      class="mt-1"
                    >
                      {{ record.data.pain_scale }} / 10
                    </UBadge>
                  </div>
                  <div v-if="record.data.range_of_motion">
                    <p class="text-xs text-slate-400">
                      Rango de Movimiento (ROM)
                    </p>
                    <p class="text-sm text-slate-800">
                      {{ record.data.range_of_motion }}
                    </p>
                  </div>
                </div>
                <div
                  v-if="record.data.functional_tests"
                  class="mt-2 pt-2 border-t border-slate-100"
                >
                  <p class="text-xs text-slate-400">
                    Pruebas Funcionales
                  </p>
                  <p class="text-sm text-slate-800">
                    {{ record.data.functional_tests }}
                  </p>
                </div>
                <div
                  v-if="record.data.rehab_plan"
                  class="mt-2 pt-2 border-t border-purple-100"
                >
                  <p class="text-xs text-purple-500 font-semibold">
                    Plan de Rehabilitación y Ejercicios
                  </p>
                  <p class="text-sm text-slate-800 bg-white p-2.5 rounded border border-slate-100 mt-1">
                    {{ record.data.rehab_plan }}
                  </p>
                </div>
              </div>

              <!-- Firma del profesional -->
              <div class="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <UIcon
                  name="i-heroicons-user"
                  class="h-4 w-4 text-slate-400"
                />
                <span>Atendido por: <strong>{{ record.professional?.full_name || 'Especialista clínico' }}</strong></span>
              </div>
            </div>
          </UCard>
        </template>

        <div
          v-else
          class="rounded-lg border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-center"
        >
          <UIcon
            name="i-heroicons-document-text"
            class="mx-auto h-12 w-12 text-slate-300"
          />
          <h4 class="mt-4 font-semibold text-slate-900">
            Sin historial registrado
          </h4>
          <p class="mt-1 text-sm text-slate-500">
            Este paciente no cuenta con registros clínicos registrados.
          </p>
          <UButton
            v-if="authStore.hasRole(['Admin', 'Root', 'Professional'])"
            color="primary"
            variant="soft"
            size="sm"
            class="mt-4"
            icon="i-heroicons-plus"
            @click="openCreateModal"
          >
            Abrir Expediente (Primera Consulta)
          </UButton>
        </div>
      </div>
    </div>

    <!-- Modal para agregar nota de consulta -->
    <UModal
      v-model:open="isModalOpen"
      :title="activeAppointmentId ? 'Iniciar Consulta (Cita Vinculada)' : 'Nuevo Registro Clínico'"
      :description="activeAppointmentId ? 'Completa la nota clínica para finalizar la cita de hoy.' : 'Completa la nota de evolución según la especialidad.'"
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #body>
        <UForm
          :state="form"
          class="space-y-5"
          @submit="submitRecord"
        >
          <!-- Si es admin/root puede seleccionar médico, si es professional se bloquea -->
          <UFormField
            v-if="!currentProfessional && authStore.hasRole(['Admin', 'Root'])"
            label="Profesional a cargo"
          >
            <USelect
              v-model="form.professional_id"
              :items="professionalOptions"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Especialidad / Tipo de expediente">
            <USelect
              v-model="form.record_type"
              :items="recordTypes"
              class="w-full"
            />
          </UFormField>

          <!-- SECCIÓN: Medicina General -->
          <div
            v-if="formRecordType === 'general'"
            class="space-y-4"
          >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormField label="Presión Arterial (mmHg)">
                <UInput
                  v-model="form.blood_pressure"
                  placeholder="120/80"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Temperatura (°C)">
                <UInput
                  v-model="form.temperature_c"
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <UFormField label="Peso (kg)">
                <UInput
                  v-model="form.weight_kg"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Estatura (cm)">
                <UInput
                  v-model="form.height_cm"
                  type="number"
                  placeholder="170"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Frecuencia Cardíaca (lpm)">
                <UInput
                  v-model="form.heart_rate_bpm"
                  type="number"
                  placeholder="80"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField label="Exploración Física">
              <UInput
                v-model="form.physical_exploration"
                placeholder="Resultados de auscultación, revisión, etc."
                class="w-full"
              />
            </UFormField>
            <UFormField label="Receta médica / Tratamiento sugerido">
              <UInput
                v-model="form.treatment"
                placeholder="Medicamentos, dosis y duración"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- SECCIÓN: Psicología -->
          <div
            v-if="formRecordType === 'psicologia'"
            class="space-y-4"
          >
            <UFormField label="Motivo de la consulta">
              <UInput
                v-model="form.consultation_reason"
                placeholder="Por qué asiste hoy a terapia..."
                class="w-full"
              />
            </UFormField>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormField label="Estado de Ánimo / Afecto">
                <UInput
                  v-model="form.mood_affect"
                  placeholder="Eutímico, ansioso, deprimido..."
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Nivel de Ansiedad">
                <USelect
                  v-model="form.anxiety_level"
                  :items="anxietyOptions"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField label="Observaciones conductuales">
              <UTextarea
                v-model="form.behavioral_observations"
                placeholder="Contacto visual, lenguaje corporal, discurso..."
                class="w-full"
              />
            </UFormField>
            <UFormField label="Plan de terapia / Acuerdos">
              <UTextarea
                v-model="form.therapy_plan"
                placeholder="Tareas clínicas, metas de la sesión o plan de acción..."
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- SECCIÓN: Nutrición -->
          <div
            v-if="formRecordType === 'nutricion'"
            class="space-y-4"
          >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormField label="Peso (kg)">
                <UInput
                  v-model="form.weight_kg"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Estatura (cm)">
                <UInput
                  v-model="form.height_cm"
                  type="number"
                  placeholder="170"
                  class="w-full"
                />
              </UFormField>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormField label="Porcentaje de Grasa (%)">
                <UInput
                  v-model="form.fat_percentage"
                  type="number"
                  step="0.1"
                  placeholder="20.5"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Porcentaje de Músculo (%)">
                <UInput
                  v-model="form.muscle_percentage"
                  type="number"
                  step="0.1"
                  placeholder="40.2"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField label="Objetivo de consulta">
              <USelect
                v-model="form.patient_goal"
                :items="goalOptions"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Hábitos alimentarios / Dieta actual">
              <UTextarea
                v-model="form.dietary_habits"
                placeholder="Consumo de agua, comidas al día, alimentos preferidos..."
                class="w-full"
              />
            </UFormField>
            <UFormField label="Alergias o restricciones alimentarias">
              <UInput
                v-model="form.allergies_restrictions"
                placeholder="Ej: intolerancia lactosa, alergia a frutos secos..."
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- SECCIÓN: Fisioterapia -->
          <div
            v-if="formRecordType === 'fisioterapia'"
            class="space-y-4"
          >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormField label="Zona de Lesión / Molestia">
                <UInput
                  v-model="form.injury_zone"
                  placeholder="Ej: hombro derecho, rodilla izquierda..."
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Escala de Dolor (EVA 1-10)">
                <UInput
                  v-model="form.pain_scale"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Nivel de dolor del 1 al 10"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField label="Rango de Movimiento (ROM)">
              <UInput
                v-model="form.range_of_motion"
                placeholder="Ej: limitación en abducción a 90 grados..."
                class="w-full"
              />
            </UFormField>
            <UFormField label="Pruebas funcionales realizadas">
              <UTextarea
                v-model="form.functional_tests"
                placeholder="Resultados de pruebas ortopédicas o musculares..."
                class="w-full"
              />
            </UFormField>
            <UFormField label="Plan de Rehabilitación / Ejercicios sugeridos">
              <UTextarea
                v-model="form.rehab_plan"
                placeholder="Ultrasonido, calor, ejercicios específicos de estiramiento..."
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Notas generales de evolución (común para todas) -->
          <UFormField label="Comentarios generales de la sesión">
            <UTextarea
              v-model="form.notes"
              placeholder="Escriba comentarios, evolución general del tratamiento o apuntes extras..."
              rows="4"
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
              icon="i-heroicons-check"
              :loading="loading.create"
            >
              Guardar Nota
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
