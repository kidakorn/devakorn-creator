import { test, expect } from '@playwright/test';

// Define all critical paths in your application
const pagesToTest = [
    '/',
    '/login',
    '/register',
    '/pricing',
    '/gallery'
];

for (const path of pagesToTest) {
    test(`Page ${path} should load successfully with status 200`, async ({ page }) => {
        const response = await page.goto(`http://localhost:3000${path}`);
        
        // Assert that the page returns a 200 OK status
        expect(response?.status()).toBe(200);
    });
}

test('External links should not be broken', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Find all links on the homepage
    const links = await page.locator('a').evaluateAll(elements => 
        elements.map(el => (el as HTMLAnchorElement).href)
    );

    // Filter out empty links or local anchor links
    const validLinks = links.filter(link => link.startsWith('http'));

    // You can print them to verify what links are found
    console.log(`Found ${validLinks.length} links to check.`);
});