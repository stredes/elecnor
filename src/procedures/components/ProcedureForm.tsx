import type { FormEvent } from "react";
import type { ProcedureDraft, ProcedureFormProps } from "../contracts/procedure-form-contract";

export function ProcedureForm({ status = "idle", message = null, onSubmit }: ProcedureFormProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const draft: ProcedureDraft = { title: String(form.get("title") ?? ""), code: String(form.get("code") ?? ""), area: String(form.get("area") ?? ""), description: String(form.get("description") ?? ""), youtube: String(form.get("youtube") ?? ""), pdfName: String(form.get("pdfName") ?? "") };
    onSubmit?.(draft);
  };
  return <section className="legacy-procedure-form" aria-label="Alta de procedimiento"><h2>Registrar procedimiento</h2><p>La creación queda preparada para el flujo sintético; no activa almacenamiento ni medios externos.</p><form onSubmit={submit}><label><span>Título</span><input name="title" required /></label><label><span>Código</span><input name="code" /></label><label><span>Área</span><input name="area" /></label><label><span>Descripción</span><textarea name="description" /></label><label><span>Video de YouTube</span><input name="youtube" /></label><label><span>PDF sintético</span><input name="pdfName" /></label><button type="submit">Guardar procedimiento</button>{message && <p role={status === "error" ? "alert" : "status"}>{message}</p>}</form></section>;
}
