import { validateImportFiles, type ImportFile } from "../domain/import-files";
import type { ImportSummary } from "../domain/import-summary";
import type { DocumentProcessor } from "../ports/document-processor";
import type { ImportInterpreter } from "../ports/import-interpreter";
import type { ImportExecutionContext } from "../ports/import-operation";
import type { ImportRepository } from "../ports/import-repository";

export class ImportInspection {
  public constructor(
    private readonly processor: DocumentProcessor,
    private readonly interpreter: ImportInterpreter,
    private readonly repository: ImportRepository,
  ) {}

  public async execute(
    files: readonly ImportFile[],
    context: ImportExecutionContext,
  ): Promise<ImportSummary> {
    validateImportFiles(files);
    let summary = emptySummary(files.length);
    for (const file of files) {
      const facts = await this.processor.process(file, context);
      const draft = this.interpreter.execute(facts);
      const result = await this.repository.persist(draft, file, context);
      summary = applyResult(summary, result.status, result.metricsInserted, result.unknownMetrics);
    }
    return summary;
  }
}

function emptySummary(selected: number): ImportSummary {
  return {
    seleccionados: selected, procesados: 0, duplicados: 0, errores: 0,
    inspecciones_nuevas: 0, metricas_insertadas: 0, metricas_sin_clasificar: 0,
  };
}

function applyResult(
  summary: ImportSummary,
  status: "CREATED" | "DUPLICATE",
  metricsInserted: number,
  unknownMetrics: number,
): ImportSummary {
  if (status === "DUPLICATE") {
    return { ...summary, duplicados: summary.duplicados + 1 };
  }
  return {
    ...summary,
    procesados: summary.procesados + 1,
    inspecciones_nuevas: summary.inspecciones_nuevas + 1,
    metricas_insertadas: summary.metricas_insertadas + metricsInserted,
    metricas_sin_clasificar: summary.metricas_sin_clasificar + unknownMetrics,
  };
}
