<script setup>
definePageMeta({
  middleware: ['auth', 'admin']
})

const { $api } = useNuxtApp()
const toast = useToast()

const roleOptions = [
  { label: 'Todos los tipos', value: 'all' },
  { label: 'Administradores', value: 'Admin' },
  { label: 'Profesionales', value: 'Professional' },
  { label: 'Recepcionistas', value: 'Receptionist' },
  { label: 'Pacientes', value: 'Patient' }
]

const creatableRoleOptions = roleOptions.filter(option => option.value !== 'all')

const isModalOpen = ref(false)
const selectedRoleFilter = ref('all')
const users = ref([])
const professionals = ref([])
const receptionists = ref([])
const patients = ref([])

const loading = reactive({
  list: false,
  create: false
})

const form = reactive({
  role_name: 'Professional',
  email: '',
  password: '',
  full_name: '',
  specialty: '',
  license_number: '',
  phone: '',
  bio: '',
  assigned_to_professional_id: null,
  date_of_birth: '',
  gender: '',
  emergency_contact: ''
})

const roleLabels = {
  Admin: 'Administrador',
  Root: 'Root',
  Professional: 'Profesional',
  Receptionist: 'Recepcionista',
  Patient: 'Paciente'
}

const roleColors = {
  Admin: 'primary',
  Root: 'primary',
  Professional: 'success',
  Receptionist: 'warning',
  Patient: 'neutral'
}

const professionalOptions = computed(() => {
  return professionals.value.map(professional => ({
    label: professional.full_name,
    value: professional.id
  }))
})

const selectedRoleLabel = computed(() => {
  return roleLabels[form.role_name] || form.role_name
})

const profileByUserId = computed(() => {
  const profiles = new Map()

  professionals.value.forEach((professional) => {
    profiles.set(professional.user_id, {
      full_name: professional.full_name,
      detail: professional.specialty,
      phone: professional.phone
    })
  })

  receptionists.value.forEach((receptionist) => {
    profiles.set(receptionist.user_id, {
      full_name: receptionist.full_name,
      detail: receptionist.assigned_to_professional?.full_name || 'Sin profesional asignado',
      phone: receptionist.phone
    })
  })

  patients.value.forEach((patient) => {
    profiles.set(patient.user_id, {
      full_name: patient.full_name,
      detail: patient.emergency_contact || 'Paciente',
      phone: patient.phone
    })
  })

  return profiles
})

const tableRows = computed(() => {
  return users.value
    .map((user) => {
      const role = user.role?.name || user.roles?.[0] || 'Sin rol'
      const profile = profileByUserId.value.get(user.id)

      return {
        id: user.id,
        email: user.email,
        role,
        roleLabel: roleLabels[role] || role,
        is_active: user.is_active,
        full_name: profile?.full_name || 'Sin perfil',
        detail: profile?.detail || 'Cuenta de acceso',
        phone: profile?.phone || 'Sin teléfono'
      }
    })
    .filter(user => selectedRoleFilter.value === 'all' || user.role === selectedRoleFilter.value)
})

const resetForm = () => {
  Object.assign(form, {
    role_name: 'Professional',
    email: '',
    password: '',
    full_name: '',
    specialty: '',
    license_number: '',
    phone: '',
    bio: '',
    assigned_to_professional_id: null,
    date_of_birth: '',
    gender: '',
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
    const [usersResponse, professionalsResponse, receptionistsResponse, patientsResponse] = await Promise.all([
      $api.get('/users'),
      $api.get('/professionals'),
      $api.get('/receptionists'),
      $api.get('/patients')
    ])

    users.value = usersResponse.data.data || []
    professionals.value = professionalsResponse.data.data || []
    receptionists.value = receptionistsResponse.data.data || []
    patients.value = patientsResponse.data.data || []
  } catch {
    toast.add({
      title: 'No se pudieron cargar los usuarios',
      color: 'error'
    })
  } finally {
    loading.list = false
  }
}

const createBaseUser = async () => {
  const response = await $api.post('/users', {
    email: form.email,
    password: form.password,
    role_name: form.role_name,
    is_active: true
  })

  return response.data.data
}

const createProfile = async (userId) => {
  if (form.role_name === 'Professional') {
    await $api.post('/professionals', {
      user_id: userId,
      full_name: form.full_name,
      specialty: form.specialty,
      license_number: form.license_number || null,
      phone: form.phone || null,
      bio: form.bio || null
    })
  }

  if (form.role_name === 'Receptionist') {
    await $api.post('/receptionists', {
      user_id: userId,
      full_name: form.full_name,
      phone: form.phone || null,
      assigned_to_professional_id: form.assigned_to_professional_id || null
    })
  }

  if (form.role_name === 'Patient') {
    await $api.post('/patients', {
      user_id: userId,
      full_name: form.full_name,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      phone: form.phone || null,
      emergency_contact: form.emergency_contact || null
    })
  }
}

const createUser = async () => {
  loading.create = true

  try {
    const user = await createBaseUser()
    await createProfile(user.id)

    toast.add({
      title: `${selectedRoleLabel.value} creado`,
      color: 'success'
    })

    closeCreateModal()
    await loadData()
  } catch {
    toast.add({
      title: 'No se pudo crear el usuario',
      description: 'Verifica los datos y que el correo no exista.',
      color: 'error'
    })
  } finally {
    loading.create = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="space-y-6 pb-20 lg:pb-0">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-blue-600">
          Administración
        </p>
        <h2 class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Usuarios
        </h2>
        <p class="mt-2 max-w-3xl text-sm text-slate-600">
          Registra usuarios desde un solo flujo y consulta la lista filtrando por tipo de perfil.
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
          icon="i-heroicons-user-plus"
          @click="openCreateModal"
        >
          Nuevo usuario
        </UButton>
      </div>
    </div>

    <UCard class="bg-white">
      <template #header>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 class="font-semibold text-slate-950">
              Usuarios registrados
            </h3>
            <p class="text-sm text-slate-500">
              {{ tableRows.length }} resultados visibles
            </p>
          </div>
          <div class="w-full lg:w-72">
            <USelect
              v-model="selectedRoleFilter"
              :items="roleOptions"
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
                Usuario
              </th>
              <th class="px-4 py-3">
                Tipo
              </th>
              <th class="px-4 py-3">
                Detalle
              </th>
              <th class="px-4 py-3">
                Contacto
              </th>
              <th class="py-3 pl-4">
                Estado
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="user in tableRows"
              :key="user.id"
            >
              <td class="py-4 pr-4">
                <p class="font-semibold text-slate-950">
                  {{ user.full_name }}
                </p>
                <p class="text-slate-500">
                  {{ user.email }}
                </p>
              </td>
              <td class="px-4 py-4">
                <UBadge
                  :color="roleColors[user.role] || 'neutral'"
                  variant="soft"
                >
                  {{ user.roleLabel }}
                </UBadge>
              </td>
              <td class="px-4 py-4 text-slate-600">
                {{ user.detail }}
              </td>
              <td class="px-4 py-4 text-slate-600">
                {{ user.phone }}
              </td>
              <td class="py-4 pl-4">
                <UBadge
                  :color="user.is_active ? 'success' : 'neutral'"
                  variant="soft"
                >
                  {{ user.is_active ? 'Activo' : 'Inactivo' }}
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="!tableRows.length"
          class="py-12 text-center text-sm text-slate-500"
        >
          No hay usuarios para el filtro seleccionado.
        </div>
      </div>
    </UCard>

    <UModal
      v-model:open="isModalOpen"
      title="Nuevo usuario"
      description="El formulario cambia según el tipo de usuario seleccionado."
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #body>
        <UForm
          :state="form"
          class="space-y-5"
          @submit="createUser"
        >
          <UFormField label="Tipo de usuario">
            <USelect
              v-model="form.role_name"
              :items="creatableRoleOptions"
              class="w-full"
            />
          </UFormField>

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

          <template v-if="form.role_name !== 'Admin'">
            <UFormField label="Nombre completo">
              <UInput
                v-model="form.full_name"
                class="w-full"
              />
            </UFormField>

            <div
              v-if="form.role_name === 'Professional'"
              class="space-y-4"
            >
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <UFormField label="Especialidad">
                  <UInput
                    v-model="form.specialty"
                    placeholder="Medicina General"
                    class="w-full"
                  />
                </UFormField>
                <UFormField label="Cédula">
                  <UInput
                    v-model="form.license_number"
                    class="w-full"
                  />
                </UFormField>
              </div>
              <UFormField label="Teléfono">
                <UInput
                  v-model="form.phone"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Bio">
                <UTextarea
                  v-model="form.bio"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div
              v-if="form.role_name === 'Receptionist'"
              class="space-y-4"
            >
              <UFormField label="Teléfono">
                <UInput
                  v-model="form.phone"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Profesional asignado">
                <USelect
                  v-model="form.assigned_to_professional_id"
                  :items="professionalOptions"
                  placeholder="Sin asignar"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div
              v-if="form.role_name === 'Patient'"
              class="space-y-4"
            >
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
                    placeholder="male, female, other"
                    class="w-full"
                  />
                </UFormField>
              </div>
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
          </template>

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
              Crear {{ selectedRoleLabel.toLowerCase() }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
