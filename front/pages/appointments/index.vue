<script setup>
import { ref } from 'vue'

const isModalOpen = ref(false)
const selectedDate = ref(new Date())

const professional = ref('Dr. Carlos Médico')
const professionals = ['Dr. Carlos Médico', 'Lic. Nutrición']
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Agenda de Citas</h1>
      <UButton color="primary" icon="i-heroicons-plus" @click="isModalOpen = true">Nueva Cita</UButton>
    </div>

    <!-- Filtros de Recepción -->
    <UCard class="bg-white">
      <div class="flex gap-4 items-center">
        <span class="text-sm font-medium text-gray-700">Agenda de:</span>
        <USelect v-model="professional" :options="professionals" class="w-64" />
      </div>
    </UCard>

    <!-- Calendario -->
    <UCard class="bg-white overflow-hidden min-h-[600px]">
      <div class="flex justify-center p-4">
        <!-- V-Calendar Component -->
        <VCalendar expanded />
      </div>
    </UCard>

    <!-- Modal de Nueva Cita -->
    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900">
              Agendar Nueva Cita
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isModalOpen = false" />
          </div>
        </template>
        
        <div class="space-y-4">
          <UFormField label="Paciente">
            <UInput placeholder="Buscar paciente..." icon="i-heroicons-magnifying-glass" />
          </UFormField>
          <UFormField label="Servicio">
            <USelect :options="['Consulta General', 'Chequeo']" />
          </UFormField>
          <UFormField label="Fecha">
            <DatePicker v-model="selectedDate" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="white" @click="isModalOpen = false">Cancelar</UButton>
            <UButton color="primary">Guardar Cita</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
