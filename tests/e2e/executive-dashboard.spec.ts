import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 900 } });

test("home renders the executive dashboard locally", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Dashboard Ejecutivo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Regiones que requieren atención" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Maule 2 auditorías · 4 incumplimientos/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Personas en trabajo en altura/ })).toContainText("2");
  await expect(page.getByRole("link", { name: /Personas en trabajo en piso/ })).toContainText("1");
});

test("region focus changes without losing the global dashboard", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByLabel("Región").selectOption("Maule");
  await expect(page.getByText("Región seleccionada")).toBeVisible();
  await expect(page.getByRole("link", { name: /Abrir inspecciones filtradas/i })).toHaveAttribute("href", "/inspecciones?region=Maule");
});
