import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 30000, // 30 seconds
    hookTimeout: 30000,
    globals: true,
    setupFiles: ['dotenv/config'],
  },
}) 