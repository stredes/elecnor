import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { InspectionDetail } from "@/backend/domain/inspections/detail-contract";
import type { InspectionListQuery, InspectionListResult } from "@/backend/domain/inspection-list-contract";
import type { TechnicianProfile } from "@/backend/domain/technicians/profile-contract";
import { InspectionDetailView } from "@/inspections/views/InspectionDetailView";
import { InspectionsView } from "@/inspections/views/InspectionsView";
import { TechnicianView } from "@/technicians/views/TechnicianView";

const row = { id: "synthetic-1", date: "2026-01-10", time: "09:00", technician: "Técnico A", auditor: "Auditor A", address: "Calle 1", city: "Ciudad", region: "Norte", percentage: 80, score: 8, maxScore: 10, actions: 0, rubric: "SYN", status: "COMPLETA" as const, filename: "synthetic-1.pdf" };
const list: InspectionListResult = { data: [row], total: 1, limit: 25, offset: 0, dates: [row.date], auditors: [row.auditor], regions: [row.region] };
const query: InspectionListQuery = { filters: { q: "", date: "", from: "", to: "", technician: "", auditor: "", region: "", status: "", score: "", month: "", sort: "date_desc" }, limit: 25, offset: 0 };
const detail: InspectionDetail = { inspection: { ...row, auditorRole: "Auditor", observation: "Sintética" }, metrics: [{ id: "metric-1", section: "EPP", metric: "Casco", code: "EPP-01", status: "OK", applicable: 1, conforming: 1, nonConforming: 0, notApplicable: 0, observation: "Nota del control" }] };
const technician: TechnicianProfile = { technician: "Técnico A", inspections: [{ id: row.id, date: row.date, technician: row.technician, auditor: row.auditor, percentage: 0.8, actions: row.actions }], promedio: 80, bajo70: 0, auditores: 1, fechas: 1 };

afterEach(cleanup);

describe("NP-0042/AC-01/TEST-01 inspection presentation composition", () => {
  it("offers sortable data headers while preserving filters and resetting pagination", () => {
    const filteredQuery: InspectionListQuery = {
      ...query,
      filters: { ...query.filters, q: "casco", auditor: "Auditor A", workContext: "ALTURA" },
      offset: 50,
    };
    render(<InspectionsView list={list} query={filteredQuery} page={3} scope="all" />);

    expect(screen.getAllByRole("link", { name: /^Ordenar/ })).toHaveLength(6);
    expect(screen.getByRole("link", { name: "Ordenar Contexto A–Z" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Ordenar Puntaje ascendente" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Ordenar Fecha ascendente" }).closest("th"))
      .toHaveAttribute("aria-sort", "descending");
    expect(within(screen.getByRole("columnheader", { name: "Acción" })).queryByRole("link"))
      .not.toBeInTheDocument();

    const href = screen.getByRole("link", { name: "Ordenar Técnico A–Z" }).getAttribute("href");
    const params = new URL(href ?? "", "https://example.test").searchParams;
    expect(params.get("sort")).toBe("technician_asc");
    expect(params.get("q")).toBe("casco");
    expect(params.get("auditor")).toBe("Auditor A");
    expect(params.get("work_context")).toBe("ALTURA");
    expect(params.get("scope")).toBe("all");
    expect(params.get("offset")).toBe("0");
    expect(params.has("page")).toBe(false);
  });

  it("presents the inspection list with an operational reading hierarchy", () => {
    render(<InspectionsView list={list} query={query} page={1} />);

    expect(screen.getByRole("region", { name: "Resumen de inspecciones" })).toBeVisible();
    expect(screen.getByText("Cumplimiento medio")).toBeVisible();
    expect(screen.getByRole("progressbar", { name: "Puntaje 80.00%" })).toBeVisible();
    expect(screen.getByText("09:00 h")).toBeVisible();
    expect(screen.getByRole("link", { name: "Ver inspección synthetic-1" })).toHaveTextContent("Abrir detalle");
  });

  it("labels a missing source hour instead of leaving the date cell blank", () => {
    render(<InspectionsView list={{ ...list, data: [{ ...row, time: null }] }} query={query} page={1} />);
    expect(screen.queryByText("Fecha no informada")).not.toBeInTheDocument();
    expect(screen.getByText("Hora no informada")).toBeVisible();
  });

  it("normalizes partial dates and identifies missing auditors", () => {
    render(<InspectionsView list={{ ...list, data: [{ ...row, date: "20.06", auditor: null, percentage: 0 }] }} query={query} page={1} />);
    expect(screen.getByText("20/06/2026")).toBeVisible();
    expect(screen.getByText("Año inferido: 2026")).toBeVisible();
    expect(screen.getByText("Auditor no informado")).toBeVisible();
    expect(screen.getByText("Dato pendiente")).toBeVisible();
    expect(screen.queryByText("Calidad de datos:")).not.toBeInTheDocument();
    expect(screen.getAllByText("0.00%")).toHaveLength(2);
    expect(screen.getByText("Registro completo")).toBeVisible();
    expect(screen.getByText("Revisión por cumplimiento bajo")).toBeVisible();
  });

  it("shows the executive floor-level observation only for the floor context", () => {
    render(<InspectionsView list={list} query={{ ...query, filters: { ...query.filters, workContext: "PISO" } }} page={1} />);
    expect(screen.getByRole("complementary", { name: "Observación preventiva" })).toHaveTextContent("no fue posible observar directamente el procedimiento de trabajo en altura");
    cleanup();

    render(<InspectionsView list={list} query={{ ...query, filters: { ...query.filters, workContext: "ALTURA" } }} page={1} />);
    expect(screen.queryByRole("complementary", { name: "Observación preventiva" })).not.toBeInTheDocument();
  });

  it("composes list, detail and technician views with explicit surfaces", () => {
    render(<InspectionsView list={list} query={query} page={1} />);
    expect(screen.getByRole("heading", { name: "Listado de inspecciones" })).toBeVisible();
    expect(screen.getByRole("table", { name: "Lista de inspecciones" })).toBeVisible();
    expect(screen.getByLabelText("Contexto")).toBeVisible();
    expect(screen.getByRole("option", { name: "Nivel de piso" })).toBeVisible();
    expect(screen.getByRole("option", { name: "Trabajo en altura" })).toBeVisible();
    expect(screen.queryByRole("option", { name: "En preparación" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Sin clasificar" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver inspección synthetic-1" })).toHaveAttribute("href", "/inspecciones/synthetic-1");
    cleanup();

    render(<InspectionDetailView detail={detail} downloadHref="/api/inspections/synthetic-1/download" />);
    expect(screen.getByText("Sintética")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Editar inspección" }));
    expect(screen.getByRole("dialog", { name: "Editar inspección" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByRole("button", { name: "Editar inspección" })).toHaveFocus();
    cleanup();

    render(<TechnicianView profile={technician} />);
    expect(screen.getByRole("heading", { name: "Técnico A" })).toBeVisible();
    expect(screen.getByRole("table", { name: "Inspecciones del técnico" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Ver detalle →" })).toHaveAttribute("href", "/inspecciones/synthetic-1");
    expect(screen.getAllByText("80.00%")).toHaveLength(2);
    expect(screen.getByRole("columnheader", { name: "Puntaje (%)" })).toBeVisible();
  });
});
