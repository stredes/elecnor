import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

const routes = ["/", "/metricas", "/inspecciones", "/procedimientos", "/comparativa-elecnor"];

test.describe("Responsive frontend smoke", () => {
  for (const route of routes) {
    test(`${route} does not overflow the mobile viewport`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      const dimensions = await page.evaluate(() => ({
        viewport: window.innerWidth,
        scrollWidth: document.body.scrollWidth,
        bodyWidth: document.body.getBoundingClientRect().width,

      }));
      expect(dimensions.scrollWidth, `${route} horizontal overflow`).toBeLessThanOrEqual(dimensions.viewport + 1);
      expect(dimensions.bodyWidth, `${route} body width`).toBeLessThanOrEqual(dimensions.viewport + 1);
    });
  }
});
