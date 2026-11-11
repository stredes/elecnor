import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: "Dashboard Ejecutivo" },
  { path: "/dashboard", heading: "Panel de inspecciones" },
  { path: "/metricas", heading: "Métricas" },
  { path: "/inspecciones", heading: "Listado de inspecciones" },
  { path: "/hallazgos", heading: "Hallazgos" },
  { path: "/logs", heading: "Registro de importación" },
  { path: "/importar", heading: "Importar documentos" },
  { path: "/procedimientos", heading: "Procedimientos", exact: true },
  { path: "/comparativa-elecnor", heading: "Comparativa Elecnor" },
  { path: "/metricas-sin-clasificar", heading: "Métricas sin clasificar" },
];

test.describe("Frontend route smoke", () => {
  for (const route of routes) {
    test(`${route.path} renders without a visible error`, async ({ page }) => {
      const errors: string[] = [];
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()}`));
      await page.goto(route.path, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: route.heading, exact: route.exact ?? false })).toBeVisible();
      expect(errors, `${route.path} browser errors`).toEqual([]);
      expect(consoleErrors, `${route.path} console errors`).toEqual([]);
      expect(failedRequests, `${route.path} failed requests`).toEqual([]);
    });
  }
});
