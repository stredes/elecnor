import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { Procedure, ProcedureDetail } from "@/backend/domain/procedures/procedure-contract";
import { ProcedureDetailView } from "@/procedures/views/ProcedureDetailView";
import { ProceduresView } from "@/procedures/views/ProceduresView";

const procedure: Procedure = { id: "05-ATC", title: "Trabajo en Altura", code: "PTS-05", area: "ATC", description: null, youtubeVideoId: null, pdfUrl: "/synthetic.pdf", filename: "05-ATC.pdf", createdAt: "2026-10-05T00:00:00Z", updatedAt: "2026-10-05T00:00:00Z" };
const detail: ProcedureDetail = { procedure, pdfUrl: "/synthetic/procedures/05-ATC.pdf" };

afterEach(cleanup);

describe("NP-0043/AC-03/TEST-04 procedure availability", () => {
  it("does not offer a broken PDF link or inactive create submission", () => {
    render(<ProcedureDetailView detail={detail} />);
    expect(screen.getByText(/PDF no disponible en este entorno sintético/i)).toBeVisible();
    expect(screen.queryByRole("link", { name: /abrir pdf/i })).not.toBeInTheDocument();
    cleanup();

    render(<ProceduresView families={[]} total={0} filters={{ q: "", area: "" }} />);
    expect(screen.getByRole("button", { name: /guardar procedimiento/i })).toBeDisabled();
    expect(screen.getByText(/alta no disponible en este entorno sintético/i)).toBeVisible();
  });
});
