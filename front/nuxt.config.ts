// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({


  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  ui: {
    // We can configure custom colors here if needed
  },

  devtools: {
    enabled: true
  },



  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
