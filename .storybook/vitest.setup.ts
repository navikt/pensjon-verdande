import { setProjectAnnotations } from '@storybook/react'
import * as previewAnnotations from './preview'

setProjectAnnotations([
  previewAnnotations,
  {
    beforeEach(context: { tags?: string[] }) {
      if (context.tags?.includes('error-expected')) return

      const errors: string[] = []
      const original = console.error.bind(console)

      console.error = (...args: unknown[]) => {
        errors.push(args.map(String).join(' '))
        original(...args)
      }

      return () => {
        console.error = original

        const crash = errors.find(
          (e) =>
            e.includes('Error handled by React Router default ErrorBoundary') ||
            e.includes('React Router caught the following error during render'),
        )
        if (crash) {
          throw new Error(`Story rendered an error boundary instead of the expected UI:\n${crash}`)
        }
      }
    },
  },
])
