import { test, expect } from '@playwright/test'

test.describe('Intelligence Center', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"], input[placeholder*="email" i]', 'test@audienceos.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"], button:has-text("Sign in")')
    await expect(page).toHaveURL('/', { timeout: 10000 })

    // Navigate to Intelligence Center
    await page.click('text=Intelligence')
    await expect(page.locator('h1, h2').filter({ hasText: /Intelligence Center/i })).toBeVisible({ timeout: 5000 })
  })

  test('displays overview with AI capabilities', async ({ page }) => {
    // Check for AI capability cards
    await expect(page.locator('text=Client Communication')).toBeVisible()
    await expect(page.locator('text=Knowledge Search')).toBeVisible()
    await expect(page.locator('text=At-Risk Detection')).toBeVisible()
  })

  test('Chat section displays chat interface', async ({ page }) => {
    // Click on Chat in sub-nav
    await page.click('nav >> text=Chat')

    // Wait for section to load
    await page.waitForTimeout(1000)

    // Should show chat interface with input
    await expect(
      page.locator('textarea[placeholder*="Ask"], input[placeholder*="Ask"]')
    ).toBeVisible({ timeout: 5000 })
  })

  test('Chat History section displays conversation logs', async ({ page }) => {
    // Click on Chat History in sub-nav
    await page.click('nav >> text=Chat History')

    // Should show filter tabs
    await expect(page.locator('text=All')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Your Messages')).toBeVisible()
    await expect(page.locator('text=AI Responses')).toBeVisible()
  })

  test('Cartridges section displays training cartridges', async ({ page }) => {
    // Click on Training Cartridges
    await page.click('text=Training Cartridges')

    // Should show cartridge tabs (Voice, Style, etc.)
    await expect(page.locator('text=Voice').first()).toBeVisible({ timeout: 5000 })
  })
})
