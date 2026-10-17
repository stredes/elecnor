import { expect, test } from "@playwright/test";

test("NP-0038/AC-03/TEST-04 exposes only the synthetic read catalog", async ({ page }) => {
  const list = await page.request.get("/api/procedures?q=altura");
  expect(list.status()).toBe(200);
  const payload = await list.json();
  expect(payload).toMatchObject({ total: 1, data: [{ id: "synthetic-procedure-1", title: "Trabajo en altura" }] });
  expect(payload.data[0]).not.toHaveProperty("stored_path");

  const detail = await page.request.get("/api/procedures/synthetic-procedure-1");
  expect(detail.status()).toBe(200);
  expect(await detail.json()).toMatchObject({ filename: "synthetic-altura.pdf" });

  const mutation = await page.request.post("/api/procedures", { data: { title: "No debe crear" } });
  expect(mutation.status()).toBe(405);
});
