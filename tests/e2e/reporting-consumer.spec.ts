import { expect, test } from "@playwright/test";

test("NP-0035/AC-03/TEST-04 renders reporting output through Next", async ({ page }) => {
  await page.goto("/test-reporting");
  await expect(page.getByRole("region", { name: "Síntesis de reporting" })).toBeVisible();
  await expect(page.getByText("Preparacion: 70%", { exact: true })).toBeVisible();
  await expect(page.getByText("Protección visual: 70%", { exact: true })).toBeVisible();
});
