import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
const detail: InspectionDetail = { inspection: { ...row, auditorRole: "Auditor", observation: "Sintética" }, metrics: [{ id: "metric-1", section: "EPP", metric: "Casco", code: "EPP-01", status: "OK", applicable: 1, conforming: 1, nonConforming: 0, notApplicable: 0, observation: null }] };
const technician: TechnicianProfile = { technician: "Técnico A", inspections: [{ id: row.id, date: row.date, technician: row.technician, auditor: row.auditor, percentage: row.percentage, actions: row.actions }], promedio: 80, bajo70: 0, auditores: 1, fechas: 1 };

afterEach(cleanup);

describe("NP-0042/AC-01/TEST-01 inspection presentation composition", () => {
  it("composes list, detail and technician views with explicit surfaces", () => {
    render(<InspectionsView list={list} query={query} page={1} />);
    expect(screen.getByRole("heading", { name: "Listado de inspecciones" })).toBeVisible();
    expect(screen.getByRole("table", { name: "Lista de inspecciones" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Ver inspección synthetic-1" })).toHaveAttribute("href", "/inspecciones/synthetic-1");
    cleanup();

    render(<InspectionDetailView detail={detail} />);
    fireEvent.click(screen.getByRole("button", { name: "Editar inspección" }));
    expect(screen.getByRole("dialog", { name: "Editar inspección" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByRole("button", { name: "Editar inspección" })).toHaveFocus();
    cleanup();

    render(<TechnicianView profile={technician} />);
    expect(screen.getByRole("heading", { name: "Técnico A" })).toBeVisible();
    expect(screen.getByRole("table", { name: "Inspecciones del técnico" })).toBeVisible();
    expect(screen.getByText("Promedio: 80%")).toBeVisible();
  });
});
