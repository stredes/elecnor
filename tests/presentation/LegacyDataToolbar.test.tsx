// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LegacyDataToolbar } from "@/dashboard/components/LegacyDataToolbar";

const router = vi.hoisted(() => ({ asPath: "/", replace: vi.fn() }));
vi.mock("next/router", () => ({ useRouter: () => router }));

afterEach(() => { cleanup(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe("LegacyDataToolbar", () => {
  it("habilita importación y exportación reales", () => {
    render(<LegacyDataToolbar />);
    expect(screen.getByRole("button", { name: "Importar PDF" })).not.toBeDisabled();
    expect(screen.getByRole("link", { name: "Exportar Excel" })).toHaveAttribute("href", "/api/export/excel");
  });

  it("abre el menú móvil y el selector de archivos", async () => {
    render(<LegacyDataToolbar />);
    const input = screen.getByLabelText("Seleccionar PDFs para importar") as HTMLInputElement;
    const click = vi.spyOn(input, "click");
    fireEvent.click(screen.getByRole("button", { name: /Herramientas/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Importar PDF" }));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("importa, informa y refresca cuando hay inspecciones nuevas", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ inspecciones_nuevas: 1, duplicados: 0, errores: 0 }))));
    render(<LegacyDataToolbar />);
    fireEvent.change(screen.getByLabelText("Seleccionar PDFs para importar"), { target: { files: [new File(["pdf"], "informe.pdf", { type: "application/pdf" })] } });
    expect(await screen.findByRole("status")).toHaveTextContent("1 inspección nueva");
    expect(router.replace).toHaveBeenCalledWith("/");
  });

  it("rechaza extensiones no PDF sin llamar al BFF", async () => {
    vi.stubGlobal("fetch", vi.fn());
    render(<LegacyDataToolbar />);
    fireEvent.change(screen.getByLabelText("Seleccionar PDFs para importar"), { target: { files: [new File(["x"], "informe.docx")] } });
    expect(await screen.findByRole("alert")).toHaveTextContent("Solo se permiten archivos PDF");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("muestra la zona de drop y procesa el archivo soltado", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ inspecciones_nuevas: 0, duplicados: 1, errores: 0 }))));
    render(<LegacyDataToolbar />);
    const file = new File(["pdf"], "informe.pdf", { type: "application/pdf" });
    fireEvent.dragOver(window, { dataTransfer: { types: ["Files"] } });
    expect(screen.getByText("Suelta los PDFs")).toBeInTheDocument();
    fireEvent.drop(window, { dataTransfer: { files: [file] } });
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/import", expect.anything()));
    await act(async () => undefined);
  });
});
