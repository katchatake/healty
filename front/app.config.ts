export default defineAppConfig({
  ui: {
    primary: 'blue',
    gray: 'slate',
    input: {
      default: {
        size: 'xl',
      },
      rounded: 'rounded-xl',
      variant: {
        outline: 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-400 shadow-sm'
      }
    },
    button: {
      default: {
        size: 'lg'
      },
      rounded: 'rounded-xl',
      variant: {
        solid: 'shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'
      }
    },
    card: {
      rounded: 'rounded-2xl',
      shadow: 'shadow-lg shadow-gray-200/50'
    }
  }
})
