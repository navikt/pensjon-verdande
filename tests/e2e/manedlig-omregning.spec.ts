import { test, expect } from '@playwright/test'

/**
 * E2E test for månedlig omregning av opptjening
 * 
 * Tests the behavior (what), not implementation (how):
 * - User can access the page
 * - User can select a month
 * - User can start an omregning
 * - System shows confirmation
 * 
 * These tests should remain stable even when we refactor component internals.
 */

test.describe('Månedlig omregning av opptjening', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Mock authentication when we set up auth helpers
    await page.goto('/opptjening/manedlig')
  })

  test('skal vise siden for månedlig omregning', async ({ page }) => {
    // GITT bruker er på siden
    // NÅR siden laster
    // DÅ skal vi se heading
    await expect(page.getByRole('heading', { name: /månedlig/i })).toBeVisible()
  })

  test('skal kunne velge måned fra dropdown', async ({ page }) => {
    // GITT bruker er på siden
    const monthSelect = page.locator('select').first()
    
    // NÅR bruker åpner måned-dropdown
    await expect(monthSelect).toBeVisible()
    
    // DÅ skal det finnes minst én måned å velge
    const options = await monthSelect.locator('option').count()
    expect(options).toBeGreaterThan(0)
  })

  test.skip('skal kunne starte omregning for valgt måned', async ({ page }) => {
    // GITT bruker har valgt en måned
    const monthSelect = page.locator('select').first()
    await monthSelect.selectOption({ index: 0 })
    
    // NÅR bruker klikker på start-knappen
    const startButton = page.getByRole('button', { name: /start|opprett/i })
    await startButton.click()
    
    // DÅ skal systemet vise bekreftelse (eller navigere til ny side)
    // TODO: Implementer når vi har mock handlers for API-kall
    await expect(page.locator('[role="alert"]')).toBeVisible()
  })

  test.skip('skal vise feilmelding hvis backend feiler', async ({ page }) => {
    // GITT bruker har valgt en måned
    const monthSelect = page.locator('select').first()
    await monthSelect.selectOption({ index: 0 })
    
    // OG backend vil returnere feil
    // TODO: Sett opp MSW mock for å simulere feil
    
    // NÅR bruker klikker på start-knappen
    const startButton = page.getByRole('button', { name: /start|opprett/i })
    await startButton.click()
    
    // DÅ skal systemet vise feilmelding
    await expect(page.locator('[role="alert"]')).toContainText(/feil/i)
  })
})
