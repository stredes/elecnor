import { describe, expect, it } from "vitest";
import { ImportSelectionError } from "@/backend/domain/import-files";
import { ImportGatewayError } from "@/backend/ports/import-gateway";
import type { ImportGatewayFailureCode } from "@/backend/ports/import-gateway";
import { mapImportError } from "@/backend/adapters/inbound/import-errors";

describe("NP-0028/AC-02/TEST-05 import error boundary", () => {
  it("maps validation errors to a public 400 response", () => {
    const error = new ImportSelectionError("EMPTY_SELECTION", "Selecciona al menos un PDF.");
    expect(mapImportError(error)).toEqual({
      status: 400,
      body: { error: "Selecciona al menos un PDF." },
    });
  });

  it.each([
    ["REJECTED", 502, "El servicio de importación rechazó la solicitud."],
    ["UNAVAILABLE", 503, "El servicio de importación no está disponible."],
  ] as const)("maps gateway %s to HTTP %s", (code, status, message) => {
    const error = new ImportGatewayError(code as ImportGatewayFailureCode, "internal detail");
    expect(mapImportError(error)).toEqual({ status, body: { error: message } });
  });

  it("does not expose unknown error details", () => {
    expect(mapImportError(new Error("secret upstream detail"))).toEqual({
      status: 503,
      body: { error: "El servicio de importación no está disponible." },
    });
  });
});
