<template>
  <div class="min-h-screen flex bg-slate-50">
    <!-- Left side: Image/Illustration -->
    <div class="hidden lg:flex lg:w-1/2 bg-blue-500 items-center justify-center relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-emerald-400 opacity-90"></div>
      <div class="relative z-10 text-center text-white px-12">
        <h1 class="text-4xl font-bold mb-4">Healty Clinic</h1>
        <p class="text-xl text-blue-50">Tu ecosistema integral de salud y bienestar.</p>
      </div>
    </div>
    
    <!-- Right side: Content/Form -->
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <slot />
      </div>
    </div>
  </div>
</template>
