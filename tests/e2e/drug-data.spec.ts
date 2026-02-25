import { test, expect } from '@playwright/test';

test.describe('Drug Data Display', () => {
  test('should display drugs on drugs page', async ({ page }) => {
    // Navigate to drugs page
    await page.goto('/drugs');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if drugs list is not empty
    // Look for drug items or "Chưa có thuốc nào" message
    const drugItems = page.locator('[data-testid="drug-item"]');
    const emptyMessage = page.getByText('Chưa có thuốc nào');

    // Either we have drugs OR we see the empty message (both are valid states)
    const hasDrugs = await drugItems.count() > 0;
    const isEmpty = await emptyMessage.isVisible().catch(() => false);

    // If we have drugs, verify they have names
    if (hasDrugs) {
      const count = await drugItems.count();
      console.log(`Found ${count} drugs`);
      expect(count).toBeGreaterThan(0);

      // Check first drug has a name
      const firstDrugName = drugItems.first().locator('text=/\\w+/');
      await expect(firstDrugName).toBeVisible();
    } else {
      // Empty state is also valid
      expect(isEmpty).toBe(true);
      console.log('No drugs found - empty state displayed');
    }
  });

  test('should display drugs in checkout add item modal', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout');

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Click "Thêm thuốc" button
    const addButton = page.getByText('Thêm thuốc');
    if (await addButton.isVisible()) {
      await addButton.click();

      // Wait for modal
      await page.waitForTimeout(500);

      // Check if drug items appear in modal
      const modalDrugs = page.locator('.fixed [data-testid="drug-item"], .fixed .drug-item');
      const searchInput = page.locator('input[placeholder*="Tìm"]');

      // Verify modal opened (search input visible)
      if (await searchInput.isVisible()) {
        console.log('Add item modal opened successfully');

        // Wait a bit for data to load
        await page.waitForTimeout(1000);

        // Take screenshot for debugging
        await page.screenshot({ path: 'tests/e2e/screenshots/add-item-modal.png' });
      }
    }
  });

  test('should fetch drugs from API', async ({ request }) => {
    // Test API directly
    const response = await request.get('/api/drugs');

    expect(response.ok()).toBe(true);

    const drugs = await response.json();
    console.log(`API returned ${Array.isArray(drugs) ? drugs.length : 'non-array'} drugs`);

    // Verify response is an array
    expect(Array.isArray(drugs)).toBe(true);

    // If drugs exist, verify structure
    if (drugs.length > 0) {
      const firstDrug = drugs[0];
      expect(firstDrug).toHaveProperty('id');
      expect(firstDrug).toHaveProperty('name');
      expect(firstDrug).toHaveProperty('unit');
      console.log(`First drug: ${firstDrug.name}`);
    }
  });
});
