import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Procedure, ProcedureFamily, ProcedureDetail } from "@/backend/domain/procedures/procedure-contract";
import { ProcedureDetailView } from "@/procedures/views/ProcedureDetailView";
import { ProceduresView } from "@/procedures/views/ProceduresView";

const procedure = (overrides: Partial<Procedure> & Pick<Procedure, "id" | "title">): Procedure => ({
  code: null, area: null, description: null, youtubeVideoId: null, pdfUrl: "/synthetic.pdf", filename: `${overrides.id}.pdf`, createdAt: "2026-10-05T00:00:00Z", updatedAt: "2026-10-05T00:00:00Z", ...overrides,
});
const first = procedure({ id: "05-ATC", title: "Trabajo en Altura", code: "PTS-05", area: "ATC", description: "Medidas sintéticas." });
const second = procedure({ id: "05-PEX", title: "Trabajo en Altura", code: "PTS-05", area: "PEX", youtubeVideoId: "synthetic-video" });
const family: ProcedureFamily = { code: "PTS-05", title: "Trabajo en Altura", procedures: [first, second], total: 2, conVideo: 1 };
const detail: ProcedureDetail = { procedure: first, pdfUrl: "/synthetic/procedures/05-ATC.pdf" };

afterEach(cleanup);

describe("NP-0043/AC-01/TEST-01 procedure presentation", () => {
  it("renders families, form and detail without an empty external player", () => {
    render(<ProceduresView families={[family]} total={2} filters={{ q: "", area: "" }} />);
    expect(screen.getByRole("heading", { name: "Procedimientos" })).toBeVisible();
    const toggle = screen.getByRole("button", { name: /Trabajo en Altura/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveTextContent("1 de 2 con video");
    fireEvent.click(toggle);
    expect(screen.getAllByRole("link", { name: /Ver ficha/ })).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Registrar procedimiento" })).toBeVisible();
    cleanup();

    render(<ProcedureDetailView detail={detail} />);
    expect(screen.getByText(/Video no disponible/i)).toBeVisible();
    expect(screen.queryByTitle(/video del procedimiento/i)).not.toBeInTheDocument();
  });
});
