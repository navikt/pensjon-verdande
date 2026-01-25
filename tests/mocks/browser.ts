import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * MSW browser worker for client-side mocking
 * Used in Storybook and optionally in dev mode
 */
export const worker = setupWorker(...handlers)
