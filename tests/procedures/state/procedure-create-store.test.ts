import { describe, expect, it } from "vitest";
import { createProcedureCreateStore } from "@/procedures/state/procedure-create-store";

const draft = { title: "Trabajo en altura", code: "PTS-05", area: "ATC", description: "Sintético", youtube: "", pdfName: "procedure.pdf" };

describe("NP-0043/AC-02/TEST-02 procedure create store", () => {
  it("preserves the draft and accepts only the current success", () => {
    const store = createProcedureCreateStore(draft);
    const oldRequest = store.submit();
    const currentRequest = store.submit();
    store.resolve(oldRequest, "PROC-OLD");
    expect(store.getState()).toMatchObject({ status: "submitting", requestId: currentRequest, procedureId: null, draft });
    store.resolve(currentRequest, "PROC-01");
    store.resolve(currentRequest, "PROC-LATE");
    expect(store.getState()).toMatchObject({ status: "success", procedureId: "PROC-01", fileReleased: true, draft });
  });

  it("keeps all backend errors, does not report false success and releases the file", () => {
    const store = createProcedureCreateStore(draft);
    const request = store.submit();
    store.reject(request, ["El almacenamiento de PDFs no está disponible.", "No se guardó el procedimiento."]);
    expect(store.getState()).toMatchObject({ status: "error", errors: ["El almacenamiento de PDFs no está disponible.", "No se guardó el procedimiento."], procedureId: null, fileReleased: true, draft });
  });
});
