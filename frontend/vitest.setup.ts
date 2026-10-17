import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// RTL's auto-cleanup relies on a global `afterEach`, which this project
// doesn't enable (vitest.config.ts has globals: false) — register it
// explicitly so each test starts with a clean DOM.
afterEach(() => {
  cleanup()
})
