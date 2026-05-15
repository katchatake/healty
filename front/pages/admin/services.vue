<script setup>
definePageMeta({
  middleware: ['auth', 'admin']
})

const { $api } = useNuxtApp()
const toast = useToast()

const isModalOpen = ref(false)
const selectedProfessionalFilter = ref('all')
const services = ref([])
const professionals = ref([])
const loading = reactive({
  list: false,
  create: false
})

const form = reactive({
  professional_id: null,
  name: '',
  description: '',
  price: null,
  duration_minutes: 30,
  is_visible: true
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

const filteredServices = computed(() => {
  if (selectedProfessionalFilter.value === 'all') {
    return services.value
  }

  return services.value.filter(service => service.professional_id === selectedProfessionalFilter.value)
})

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN'
})

const resetForm = () => {
  Object.assign(form, {
    professional_id: null,
    name: '',
    description: '',
    price: null,
    duration_minutes: 30,
    is_visible: true
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
    const [servicesResponse, professionalsResponse] = await Promise.all([
      $api.get('/services'),
      $api.get('/professionals')
    ])

    services.value = servicesResponse.data.data || []
    professionals.value = professionalsResponse.data.data || []
  } catch {
    toast.add({
      title: 'No se pudieron cargar los servicios',
      color: 'error'
    })
  } finally {
    loading.list = false
  }
}

const createService = async () => {
  loading.create = true

  try {
    await $api.post('/services', {
      professional_id: form.professional_id,
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      duration_minutes: Number(form.duration_minutes),
      is_visible: form.is_visible
    })

    toast.add({
      title: 'Servicio creado',
      color: 'success'
    })
    closeCreateModal()
    await loadData()
  } catch {
    toast.add({
      title: 'No se pudo crear el servicio',
      description: 'Verifica profesional, precio y duración.',
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
          Servicios
        </h2>
        <p class="mt-2 max-w-3xl text-sm text-slate-600">
          Configura el catálogo de servicios que cada profesional puede ofrecer en agenda.
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
          Nuevo servicio
        </UButton>
      </div>
    </div>

    <div>
      <UCard class="bg-white">
        <template #header>
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 class="font-semibold text-slate-950">
                Catálogo actual
              </h3>
              <p class="text-sm text-slate-500">
                {{ filteredServices.length }} servicios visibles.
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

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-sm">
            <thead>
              <tr class="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th class="py-3 pr-4">
                  Servicio
                </th>
                <th class="px-4 py-3">
                  Profesional
                </th>
                <th class="px-4 py-3">
                  Duración
                </th>
                <th class="px-4 py-3">
                  Precio
                </th>
                <th class="py-3 pl-4">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="service in filteredServices"
                :key="service.id"
              >
                <td class="py-4 pr-4">
                  <p class="font-semibold text-slate-950">
                    {{ service.name }}
                  </p>
                  <p class="max-w-sm truncate text-slate-500">
                    {{ service.description || 'Sin descripción' }}
                  </p>
                </td>
                <td class="px-4 py-4 text-slate-600">
                  {{ service.professional?.full_name || 'Sin profesional' }}
                </td>
                <td class="px-4 py-4 text-slate-600">
                  {{ service.duration_minutes }} min
                </td>
                <td class="px-4 py-4 font-semibold text-slate-950">
                  {{ money.format(Number(service.price)) }}
                </td>
                <td class="py-4 pl-4">
                  <UBadge
                    :color="service.is_visible ? 'success' : 'neutral'"
                    variant="soft"
                  >
                    {{ service.is_visible ? 'Visible' : 'Oculto' }}
                  </UBadge>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            v-if="!filteredServices.length"
            class="py-12 text-center text-sm text-slate-500"
          >
            No hay servicios para el filtro seleccionado.
          </div>
        </div>
      </UCard>
    </div>

    <UModal
      v-model:open="isModalOpen"
      title="Nuevo servicio"
      description="Asigna precio, duración y profesional responsable."
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #body>
        <UForm
          :state="form"
          class="space-y-4"
          @submit="createService"
        >
          <UFormField label="Profesional">
            <USelect
              v-model="form.professional_id"
              :items="professionalOptions"
              placeholder="Selecciona un profesional"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Nombre del servicio">
            <UInput
              v-model="form.name"
              placeholder="Consulta general"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Descripción">
            <UTextarea
              v-model="form.description"
              placeholder="Describe qué incluye el servicio"
              class="w-full"
            />
          </UFormField>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="Precio">
              <UInput
                v-model="form.price"
                type="number"
                min="0"
                step="0.01"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Duración">
              <UInput
                v-model="form.duration_minutes"
                type="number"
                min="1"
                class="w-full"
              />
            </UFormField>
          </div>
          <UCheckbox
            v-model="form.is_visible"
            label="Visible para agendar"
          />

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
              icon="i-heroicons-plus"
              :loading="loading.create"
            >
              Crear servicio
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
