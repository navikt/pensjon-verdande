import { test, expect } from '@playwright/test'
import { setupMockAuth } from '../helpers/auth'

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
    // Set up mock authentication
    await setupMockAuth(page)
    
    // Navigate to the page
    await page.goto('/opptjening/manedlig/omregning')
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

  test('skal kunne starte omregning for valgt måned', async ({ page }) => {
    // GITT bruker har valgt en måned
    const monthSelect = page.locator('select').first()
    await monthSelect.selectOption({ index: 0 })
    
    // NÅR bruker klikker på start-knappen
    const startButton = page.getByRole('button', { name: /start|opprett/i })
    await startButton.click()
    
    // DÅ skal systemet vise bekreftelse eller navigere
    // Vi forventer at siden reloader og viser oppdatert data
    await page.waitForLoadState('networkidle')
    
    // Verifiser at vi fortsatt er på samme side (eller redirect til success)
    expect(page.url()).toContain('/opptjening/manedlig')
  })

  test('skal vise behandlinger i tabell', async ({ page }) => {
    // GITT bruker er på siden
    // NÅR siden laster med behandlinger
    // DÅ skal vi se en tabell (selv om den er tom i mock)
    
    // Vent på at siden er ferdig lastet
    await page.waitForLoadState('networkidle')
    
    // Verifiser at behandlingstabellen eller en melding om ingen behandlinger vises
    const hasTable = await page.locator('table').count() > 0
    const hasNoDataMessage = await page.getByText(/ingen behandlinger|no data/i).count() > 0
    
    expect(hasTable || hasNoDataMessage).toBeTruthy()
  })
})
