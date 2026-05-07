import { test, expect } from '@playwright/test';

// Define target screen sizes
const viewports = [
	{ name: 'Mobile (iPhone 14)', width: 390, height: 844 },
	{ name: 'Tablet (iPad Air)', width: 820, height: 1180 },
	{ name: 'Desktop (1080p)', width: 1920, height: 1080 },
];

const targetUrl = 'http://localhost:3000';

for (const vp of viewports) {
	test(`Homepage should be responsive on ${vp.name}`, async ({ page }) => {
		// 1. Set the screen size
		await page.setViewportSize({ width: vp.width, height: vp.height });

		// 2. Navigate to the page
		await page.goto(targetUrl);

		// 3. Check for horizontal scrolling (A good responsive site should not have horizontal scroll)
		const isResponsive = await page.evaluate(() => {
			return document.documentElement.scrollWidth <= window.innerWidth;
		});

		// Assert that the page does not overflow horizontally
		expect(isResponsive).toBe(true);
	});
}