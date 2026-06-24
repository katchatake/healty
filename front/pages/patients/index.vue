<script setup>
definePageMeta({
  middleware: ['auth']
})

const { $api } = useNuxtApp()
const authStore = useAuthStore()
const toast = useToast()

const isModalOpen = ref(false)
const patients = ref([])
const professionals = ref([])
const appointments = ref([])

const loading = reactive({
  list: false,
  create: false
})

const form = reactive({
  email: '',
  password: '',
  full_name: '',
  date_of_birth: '',
  gender: '',
  phone: '',
  emergency_contact: ''
})

const resetForm = () => {
  Object.assign(form, {
    email: '',
    password: '',
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    emergency_contact: ''
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

const loadData = async () => {
  loading.list = true

  try {
    const [patRes, profRes, appRes] = await Promise.all([
      $api.get('/patients'),
      $api.get('/professionals'),
      $api.get('/appointments')
    ])
    patients.value = patRes.data.data || []
    professionals.value = profRes.data.data || []
    appointments.value = appRes.data.data || []
  } catch {
    toast.add({
      title: 'No se pudieron cargar los pacientes',
      color: 'error'
    })
  } finally {
    loading.list = false
  }
}

const getTodayPendingAppointment = (patientId) => {
  if (!authStore.hasRole(['Professional'])) return null
  const todayStr = new Date().toDateString()
  const currentProfessional = professionals.value.find(p => Number(p.user_id) === Number(authStore.user?.id))
  if (!currentProfessional) return null

  return appointments.value.find((app) => {
    const isSamePatient = Number(app.patient_id || app.patient?.id) === Number(patientId)
    const isSameDoc = Number(app.professional_id || app.professional?.id) === Number(currentProfessional.id)
    const isToday = new Date(app.appointment_date).toDateString() === todayStr
    const isPendingOrConfirmed = app.status === 'pending' || app.status === 'confirmed'
    return isSamePatient && isSameDoc && isToday && isPendingOrConfirmed
  })
}

const createBaseUser = async () => {
  const response = await $api.post('/users', {
    email: form.email,
    password: form.password,
    role_name: 'Patient',
    is_active: true
  })

  return response.data.data
}

const createPatientProfile = async (userId) => {
  await $api.post('/patients', {
    user_id: userId,
    full_name: form.full_name,
    date_of_birth: form.date_of_birth || null,
    gender: form.gender || null,
    phone: form.phone || null,
    emergency_contact: form.emergency_contact || null
  })
}

const createPatient = async () => {
  loading.create = true

  try {
    const user = await createBaseUser()
    await createPatientProfile(user.id)

    toast.add({
      title: 'Paciente creado',
      color: 'success'
    })

    closeCreateModal()
    await loadData()
  } catch {
    toast.add({
      title: 'No se pudo crear el paciente',
      description: 'Verifica los datos y que el correo no exista.',
      color: 'error'
    })
  } finally {
    loading.create = false
  }
}

const searchQuery = ref('')

const filteredPatients = computed(() => {
  if (!searchQuery.value) {
    return patients.value
  }

  const query = searchQuery.value.toLowerCase().trim()

  return patients.value.filter((patient) => {
    const fullName = (patient.full_name || '').toLowerCase()
    const email = (patient.user?.email || '').toLowerCase()
    const phone = (patient.phone || '').toLowerCase()
    const dob = (patient.date_of_birth || '').toLowerCase()

    return fullName.includes(query)
      || email.includes(query)
      || phone.includes(query)
      || dob.includes(query)
  })
})

onMounted(loadData)
</script>

<template>
  <div class="space-y-6 pb-20 lg:pb-0">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-blue-600">
          Gestión de Clínica
        </p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Pacientes
        </h2>
        <p class="mt-2 max-w-3xl text-sm text-slate-600">
          Consulta y registra la lista de pacientes de la clínica desde un panel unificado.
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
          v-if="authStore.hasRole(['Admin', 'Root', 'Receptionist', 'Professional'])"
          color="primary"
          icon="i-heroicons-user-plus"
          @click="openCreateModal"
        >
          Nuevo paciente
        </UButton>
      </div>
    </div>

    <UCard class="bg-white shadow-lg">
      <template #header>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="font-semibold text-slate-950">
              Pacientes registrados
            </h3>
            <p class="text-sm text-slate-500">
              {{ filteredPatients.length }} resultados visibles
            </p>
          </div>
          <div class="w-full sm:w-80">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Buscar por nombre, teléfono, correo o fecha..."
              class="w-full"
            />
          </div>
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-sm">
          <thead>
            <tr class="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th class="py-3 pr-4">
                Paciente
              </th>
              <th class="px-4 py-3">
                Fecha Nacimiento
              </th>
              <th class="px-4 py-3">
                Género
              </th>
              <th class="px-4 py-3">
                Contacto
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
              v-for="patient in filteredPatients"
              :key="patient.id"
            >
              <td class="py-4 pr-4">
                <p class="font-semibold text-slate-950">
                  {{ patient.full_name }}
                </p>
                <p class="text-slate-500">
                  {{ patient.user?.email || 'Sin usuario' }}
                </p>
              </td>
              <td class="px-4 py-4 text-slate-600">
                {{ patient.date_of_birth || 'No especificada' }}
              </td>
              <td class="px-4 py-4 text-slate-600 capitalize">
                {{ patient.gender || 'No especificado' }}
              </td>
              <td class="px-4 py-4 text-slate-600">
                <p v-if="patient.phone">
                  Tel: {{ patient.phone }}
                </p>
                <p
                  v-if="patient.emergency_contact"
                  class="text-xs text-slate-500"
                >
                  Contacto: {{ patient.emergency_contact }}
                </p>
                <p v-if="!patient.phone && !patient.emergency_contact">
                  Sin contacto
                </p>
              </td>
              <td class="px-4 py-4">
                <UBadge
                  :color="patient.user?.is_active ? 'success' : 'neutral'"
                  variant="soft"
                >
                  {{ patient.user?.is_active ? 'Activo' : 'Inactivo' }}
                </UBadge>
              </td>
              <td class="py-4 pl-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <UButton
                    v-if="getTodayPendingAppointment(patient.id)"
                    color="primary"
                    variant="soft"
                    icon="i-heroicons-play"
                    size="sm"
                    :to="`/patients/${patient.id}/record?appointment_id=${getTodayPendingAppointment(patient.id).id}`"
                  >
                    Iniciar consulta
                  </UButton>
                  <UButton
                    color="primary"
                    variant="ghost"
                    icon="i-heroicons-document-text"
                    size="sm"
                    :to="`/patients/${patient.id}/record`"
                  >
                    Expediente
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="!filteredPatients.length"
          class="py-12 text-center text-sm text-slate-500"
        >
          No se encontraron pacientes.
        </div>
      </div>
    </UCard>

    <UModal
      v-model:open="isModalOpen"
      title="Nuevo paciente"
      description="Registra la información del paciente y su cuenta de acceso."
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #body>
        <UForm
          :state="form"
          class="space-y-5"
          @submit="createPatient"
        >
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="Correo">
              <UInput
                v-model="form.email"
                type="email"
                autocomplete="email"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Contraseña">
              <UInput
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Nombre completo">
            <UInput
              v-model="form.full_name"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="Fecha de nacimiento">
              <UInput
                v-model="form.date_of_birth"
                type="date"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Género">
              <UInput
                v-model="form.gender"
                placeholder="masculino, femenino, otro"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="Teléfono">
              <UInput
                v-model="form.phone"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Contacto de emergencia">
              <UInput
                v-model="form.emergency_contact"
                class="w-full"
              />
            </UFormField>
          </div>

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
              icon="i-heroicons-user-plus"
              :loading="loading.create"
            >
              Crear paciente
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
