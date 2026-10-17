import type { FormEvent } from "react";
import type { ProcedureDraft, ProcedureFormProps } from "../contracts/procedure-form-contract";

export function ProcedureForm({ status = "idle", message = null, onSubmit }: ProcedureFormProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const draft: ProcedureDraft = { title: String(form.get("title") ?? ""), code: String(form.get("code") ?? ""), area: String(form.get("area") ?? ""), description: String(form.get("description") ?? ""), youtube: String(form.get("youtube") ?? ""), pdfName: String(form.get("pdfName") ?? "") };
    onSubmit?.(draft);
  };
  return <section aria-label="Alta de procedimiento"><h2>Registrar procedimiento</h2><form onSubmit={submit}><label>Título<input name="title" required /></label><label>Código<input name="code" /></label><label>Área<input name="area" /></label><label>Descripción<textarea name="description" /></label><label>Video de YouTube<input name="youtube" /></label><label>PDF sintético<input name="pdfName" /></label><button type="submit">Guardar procedimiento</button>{message && <p role={status === "error" ? "alert" : "status"}>{message}</p>}</form></section>;
}
