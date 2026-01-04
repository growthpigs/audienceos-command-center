import { test, expect } from '@playwright/test'

test.describe('Pipeline View', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"], input[placeholder*="email" i]', 'test@audienceos.com')
    await page.fill('input[type="password"]', 'TestPassword123!')
    await page.click('button[type="submit"], button:has-text("Sign in")')
    await expect(page).toHaveURL('/', { timeout: 10000 })
  })

  test('displays pipeline stages', async ({ page }) => {
    // Check for pipeline columns
    await expect(page.locator('text=Onboarding')).toBeVisible()
    await expect(page.locator('text=Installation')).toBeVisible()
    await expect(page.locator('text=Audit')).toBeVisible()
    await expect(page.locator('text=Live')).toBeVisible()
  })

  test('displays client cards', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000)

    // Should have at least one client card
    const clientCards = page.locator('[data-testid="client-card"], .client-card, [class*="card"]').filter({
      has: page.locator('text=/Core|Enterprise/i'),
    })

    await expect(clientCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('sidebar navigation works', async ({ page }) => {
    // Click on Dashboard
    await page.click('text=Dashboard')
    await expect(page.locator('h1, h2').filter({ hasText: /Dashboard/i })).toBeVisible({ timeout: 5000 })

    // Click on Pipeline
    await page.click('text=Pipeline')
    await expect(page.locator('text=Onboarding')).toBeVisible({ timeout: 5000 })

    // Click on Intelligence
    await page.click('text=Intelligence')
    await expect(page.locator('h1, h2').filter({ hasText: /Intelligence Center/i })).toBeVisible({ timeout: 5000 })
  })
})
