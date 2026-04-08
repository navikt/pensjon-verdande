import { setProjectAnnotations } from '@storybook/react'
import axe from 'axe-core'
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

    async afterEach(context: { tags?: string[] }) {
      if (context.tags?.includes('a11y-skip')) return

      const storyRoot = document.getElementById('storybook-root')
      if (!storyRoot || storyRoot.childElementCount === 0) return

      const { violations } = await axe.run(storyRoot, {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      })

      if (violations.length > 0) {
        const summary = violations
          .map((v) => {
            const nodes = v.nodes.map((n) => `  - ${n.html.slice(0, 120)}`).join('\n')
            return `[${v.impact}] ${v.id}: ${v.help}\n${nodes}`
          })
          .join('\n\n')

        throw new Error(`WCAG 2.1 AA violations found:\n\n${summary}`)
      }
    },
  },
])
