import { expect, test } from "@playwright/test";

test("NP-0041/AC-01/TEST-04 renders metrics with the active navigation state", async ({ page }) => {
  await page.goto("/metricas");

  await expect(page.getByRole("heading", { name: "Métricas" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Métricas" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Inspecciones")).toBeVisible();
});
