/**
 * Responsive viewport tests for key pages.
 *
 * Renders Storybook stories at Desktop (1280px), Tablet (768px), and Mobile (375px)
 * viewports and verifies no horizontal overflow (content fits viewport).
 *
 * Tables with many columns use scroll containers (section[aria-label] with overflow-x: auto)
 * which allow intentional horizontal scrolling. The test verifies that all overflow
 * is contained within these scroll regions and doesn't cause page-level scrolling.
 *
 * WCAG 2.1 AA checks are handled separately in .storybook/vitest.setup.ts (axe-core
 * runs on every story via the storybook vitest project).
 *
 * Run with: npm run test:responsive
 */

import { composeStories } from '@storybook/react'
import { cleanup, render } from '@testing-library/react'
import type React from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

const VIEWPORTS = [
  { name: 'Desktop', width: 1280, height: 720 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobil', width: 375, height: 667 },
] as const

// Phase 1 stories — component-level stories (without layout sidebar).
const storyModules = {
  Layout: () => import('./layout.stories'),
  Dashboard: () => import('./dashboard/route.stories'),
  Behandling: () => import('./behandling/behandling.$behandlingId.stories'),
  Behandlinger: () => import('./behandlinger/behandlinger._index.stories'),
  Batcher: () => import('./batcher/batcher.stories'),
  Brukere: () => import('./brukere/index.stories'),
  Kalender: () => import('./kalender/route.stories'),
  Behandlingserie: () => import('./behandlingserie/behandlingserie.stories'),
  ManuellBehandling: () => import('./manuell-behandling/index.stories'),
  SearchDialog: () => import('./components/nav-header/SearchDialog.stories'),
  VenstreMeny: () => import('./components/venstre-meny/VenstreMeny.stories'),
}

afterEach(cleanup)

for (const [moduleName, importFn] of Object.entries(storyModules)) {
  describe(`Responsive: ${moduleName}`, async () => {
    const mod = await importFn()
    const stories = composeStories(mod)

    for (const [storyName, StoryComponent] of Object.entries(stories)) {
      if (typeof StoryComponent !== 'function') continue
      const RenderableStory = StoryComponent as React.ComponentType

      for (const vp of VIEWPORTS) {
        it(`${storyName} @ ${vp.name} (${vp.width}px)`, async () => {
          await page.viewport(vp.width, vp.height)

          const { container } = render(<RenderableStory />)
          await new Promise((r) => setTimeout(r, 100))

          const scrollWidth = document.documentElement.scrollWidth
          const clientWidth = document.documentElement.clientWidth

          if (scrollWidth > clientWidth + 1) {
            // Find the nearest horizontal scroll container for an element
            const getHorizontalScrollContainer = (el: HTMLElement) => {
              let current = el.parentElement

              while (current && container.contains(current)) {
                const { overflowX } = window.getComputedStyle(current)
                const isScrollable = overflowX === 'auto' || overflowX === 'scroll'

                if (isScrollable && current.scrollWidth > current.clientWidth + 1) {
                  return current
                }

                current = current.parentElement
              }

              return null
            }

            const overflowingElements = Array.from(container.querySelectorAll<HTMLElement>('*')).filter((el) => {
              const rect = el.getBoundingClientRect()
              return rect.width > 0 && rect.right > clientWidth + 1
            })

            const uncontainedOverflowingElements = overflowingElements.filter(
              (el) => getHorizontalScrollContainer(el) === null,
            )

            expect(
              uncontainedOverflowingElements,
              `Uncontained horizontal overflow at ${vp.width}px: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}. ` +
                `Overflowing elements without a horizontal scroll container: ${
                  uncontainedOverflowingElements
                    .map((el) => {
                      const label = el.getAttribute('aria-label')
                      const testId = el.getAttribute('data-testid')
                      return [
                        el.tagName.toLowerCase(),
                        label ? `[aria-label="${label}"]` : '',
                        testId ? `[data-testid="${testId}"]` : '',
                      ].join('')
                    })
                    .join(', ') || 'unknown'
                }`,
            ).toHaveLength(0)
          }

          await page.viewport(1280, 720)
        })
      }
    }
  })
}
