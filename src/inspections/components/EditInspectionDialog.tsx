import { useEffect, useRef } from "react";
import type { EditInspectionDialogProps } from "../contracts/edit-inspection-dialog-contract";

export function EditInspectionDialog({ inspection, onCancel }: EditInspectionDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => cancelRef.current?.focus(), []);
  return (
    <div className="dialog-backdrop">
      <section role="dialog" aria-modal="true" aria-labelledby="edit-title" className="dialog-card">
        <h2 id="edit-title">Editar inspección</h2>
        <p>Edición local preparada para una mutación autorizada.</p>
        <label htmlFor="observation">Observación</label>
        <textarea id="observation" defaultValue={inspection.observation ?? ""} readOnly />
        <button ref={cancelRef} type="button" onClick={onCancel}>Cancelar</button>
      </section>
    </div>
  );
}
