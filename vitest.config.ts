import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    // Use happy-dom for unit tests to avoid Nuxt plugin initialization issues
    environment: 'happy-dom',
    // Minimum 100 iterations per property test
    testTimeout: 30000,
    hookTimeout: 30000,
    // Include test files
    include: ['test/**/*.{test,spec}.{js,ts}'],
    // Exclude e2e tests that need full Nuxt environment
    exclude: ['test/**/*.e2e.{test,spec}.{js,ts}', 'node_modules/**'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['components/**/*.vue', 'composables/**/*.ts', 'lib/**/*.ts'],
    },
    // Global test utilities
    globals: true,
  },
})
