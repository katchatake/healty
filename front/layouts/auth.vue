<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <div class="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section class="hidden bg-slate-950 px-10 py-8 text-white lg:flex lg:flex-col">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500">
            <UIcon name="i-heroicons-heart" class="h-6 w-6" />
          </div>
          <div>
            <p class="text-lg font-bold leading-5">
              Healty
            </p>
            <p class="text-xs text-slate-300">
              Clinic OS
            </p>
          </div>
        </div>

        <div class="flex flex-1 items-center">
          <div class="max-w-xl">
            <p class="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-300">
              Gestión clínica
            </p>
            <h1 class="text-5xl font-bold leading-tight">
              Agenda, pacientes y pagos en un flujo claro.
            </h1>
            <p class="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              Accede al panel operativo para coordinar citas, revisar pacientes y mantener el seguimiento de cada consulta.
            </p>

            <div class="mt-10 grid grid-cols-3 gap-3">
              <div class="rounded-lg border border-white/10 bg-white/5 p-4">
                <p class="text-2xl font-bold">
                  24
                </p>
                <p class="mt-1 text-xs text-slate-300">
                  citas hoy
                </p>
              </div>
              <div class="rounded-lg border border-white/10 bg-white/5 p-4">
                <p class="text-2xl font-bold">
                  12
                </p>
                <p class="mt-1 text-xs text-slate-300">
                  completadas
                </p>
              </div>
              <div class="rounded-lg border border-white/10 bg-white/5 p-4">
                <p class="text-2xl font-bold">
                  3
                </p>
                <p class="mt-1 text-xs text-slate-300">
                  por cobrar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
        <div class="w-full max-w-md">
          <div class="mb-8 flex items-center gap-3 lg:hidden">
            <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white">
              <UIcon name="i-heroicons-heart" class="h-6 w-6" />
            </div>
            <div>
              <p class="text-lg font-bold leading-5 text-slate-950">
                Healty
              </p>
              <p class="text-xs text-slate-500">
                Clinic OS
              </p>
            </div>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <slot />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
