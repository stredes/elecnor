import { expect, test } from "@playwright/test";

test("renders the dashboard and its health link", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Panel de inspecciones" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Comprobar API" })).toHaveAttribute(
    "href",
    "/api/health",
  );
});
