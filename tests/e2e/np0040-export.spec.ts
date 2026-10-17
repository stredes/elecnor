import { expect, test } from "@playwright/test";

test("NP-0040/AC-02/TEST-04 keeps renderer cells as data through the synthetic Next consumer", async ({ page }) => {
  await page.goto("/test-report-export");

  await expect(page.getByRole("region", { name: "Vista sintética de exportación" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "=SUM(A1)" })).toHaveAttribute("data-cell-type", "text");
});
