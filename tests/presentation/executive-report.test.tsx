import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExecutiveReportView } from "@/dashboard/views/ExecutiveReportView";

describe("executive report module", () => {
  it("renders the report as navigable web content instead of a PDF viewer", () => {
    render(<ExecutiveReportView />);
    expect(screen.getByRole("heading", { name: "Tres hallazgos clave de seguridad en terreno" })).toBeVisible();
    expect(screen.getByText("939 auditorías — resultado final")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Diagnóstico preventivo" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Decisiones para los próximos 90 días" })).toBeVisible();
    expect(document.querySelector("iframe, object, embed")).toBeNull();
  });
});
