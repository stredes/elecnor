import { expect, test } from "@playwright/test";

test(
  "renders the guarded inspection list through the BFF and exposes legacy filters",
  async ({ page }) => {
    const response = await page.request.get("/api/inspections?limit=1&offset=1&sort=date_asc");
    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.data.map((row: { id: string }) => row.id)).toEqual(["synthetic-inspection-2"]);
    expect(payload.dates).toEqual(["2026-03-01", "2026-02-15", "2026-01-10"]);

    await page.goto("/inspecciones?sort=date_asc");
    await expect(page.getByRole("heading", { name: "Listado de inspecciones" })).toBeVisible();
    await expect(page.getByTestId("inspection-total")).toHaveText("3 registros indexados.");
    await expect(page.getByTestId("inspection-row")).toHaveCount(3);
    await expect(page.getByLabel("Auditor")).toBeVisible();
    await expect(page.getByLabel("Orden")).toBeVisible();
  },
);

test("opens an inspection detail from the action link", async ({ page }) => {
  await page.goto("/inspecciones");
  await page.getByRole("link", { name: "Ver inspección synthetic-inspection-1" }).click();
  await expect(page).toHaveURL(/\/inspecciones\/synthetic-inspection-1$/);
  await expect(page.getByRole("heading", { name: "Detalle de inspección" })).toBeVisible();
});
