"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { validateLegacyPdfSelection, describeLegacyImport, type LegacyImportFeedback } from "./legacy-import-feedback";

export function LegacyDataToolbar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<LegacyImportFeedback | null>(null);

  const importFiles = (files: File[]) => {
    const error = validateLegacyPdfSelection(files);
    if (error) return setStatus({ kind: "error", text: error, refresh: false });
    const form = new FormData();
    files.forEach((file) => form.append("files", file, file.name));
    setStatus(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/import", { method: "POST", body: form });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload) throw new Error(payload?.error ?? "No se pudo importar.");
        const result = describeLegacyImport(payload);
        setStatus(result);
        if (result.refresh) void router.replace(router.asPath);
      } catch (error) {
        setStatus({ kind: "error", text: error instanceof TypeError ? "No pudimos importar los PDFs. Revisa tu conexión y vuelve a intentarlo." : error instanceof Error ? error.message : "No se pudo importar.", refresh: false });
      }
    });
  };

  useEffect(() => {
    const outside = (event: PointerEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    if (open) { document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape); }
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  useEffect(() => {
    const over = (event: DragEvent) => { if (event.dataTransfer?.types.includes("Files")) { event.preventDefault(); setDragging(true); } };
    const leave = (event: DragEvent) => { if (!event.relatedTarget) setDragging(false); };
    const drop = (event: DragEvent) => { if (!event.dataTransfer?.files.length) return; event.preventDefault(); setDragging(false); importFiles(Array.from(event.dataTransfer.files)); };
    window.addEventListener("dragover", over); window.addEventListener("dragleave", leave); window.addEventListener("drop", drop);
    return () => { window.removeEventListener("dragover", over); window.removeEventListener("dragleave", leave); window.removeEventListener("drop", drop); };
  });

  const choose = () => { setOpen(false); inputRef.current?.click(); };
  const selected = (event: React.ChangeEvent<HTMLInputElement>) => { const files = event.target.files; event.currentTarget.value = ""; if (files?.length) importFiles(Array.from(files)); };
  const button = (mobile = false) => <button type="button" role={mobile ? "menuitem" : undefined} disabled={pending} onClick={choose}>{pending ? "Importando…" : "Importar PDF"}</button>;
  return <><div className="legacy-data-toolbar"><span>Herramientas</span><div ref={menuRef} className="legacy-toolbar-mobile"><button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>Herramientas⌄</button>{open && <div className="legacy-toolbar-menu" role="menu">{button(true)}<Link role="menuitem" href="/api/export/excel" prefetch={false} onClick={() => setOpen(false)}>Exportar Excel</Link></div>}</div><div className="legacy-toolbar-actions">{button()}<i aria-hidden="true" /><Link href="/api/export/excel" prefetch={false}>Exportar Excel</Link><small>Arrastra PDFs a la página para importar</small></div><input ref={inputRef} type="file" name="files" accept="application/pdf,.pdf" multiple className="visually-hidden" aria-label="Seleccionar PDFs para importar" onChange={selected} /></div>{status && <p className={`legacy-toolbar-status is-${status.kind}`} role={status.kind === "ok" ? "status" : "alert"}>{status.text}</p>}{dragging && <div className="legacy-dropzone" aria-hidden="true"><strong>Suelta los PDFs</strong><span>Se importarán automáticamente. Máximo 20 archivos · 15 MB c/u.</span></div>}</>;
}
