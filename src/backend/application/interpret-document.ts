import type { CatalogReader } from "../ports/catalog-reader";
import type { HashPort } from "../ports/import-dependencies";
import type { ExtractedInspectionFacts, ExtractedMetricFact } from "../domain/import-facts-contract";
import type { ImportDraft, MetricDraft } from "../domain/import-draft-contract";
import { ImportInterpretationError } from "../domain/import-errors";
import { determineImportStatus } from "../domain/determine-import-status";
import { buildLogicalKey } from "../domain/logical-key";
import { classifyAnswer, normalizeText } from "../domain/import-normalization";
import { detectRubric } from "../domain/import-rubric";
import { extractCity, resolveRegion } from "../domain/geography/resolve-location";
import { matchMetric } from "../domain/catalog/catalog-match";

export class InterpretDocument {
  public constructor(
    private readonly catalog: CatalogReader,
    private readonly hash: HashPort,
  ) {}

  public execute(facts: ExtractedInspectionFacts): ImportDraft {
    if (!facts.metrics.length) throw new ImportInterpretationError("El documento no contiene métricas.");
    const city = facts.city ?? extractCity(facts.address);
    return {
      status: determineImportStatus(facts),
      technician: facts.technician, auditor: facts.auditor, auditorRole: facts.auditorRole,
      inspectionDate: facts.inspectionDate, inspectionTime: facts.inspectionTime, timezone: facts.timezone,
      address: facts.address, city, region: facts.region ?? resolveRegion(city, facts.address),
      latitude: facts.latitude, longitude: facts.longitude, score: facts.score,
      flaggedItems: facts.flaggedItems, actions: facts.actions, rubricVersion: detectRubric(facts),
      logicalKey: buildLogicalKey(facts, (value) => this.hash.digest(value)),
      metrics: facts.metrics.map((metric) => this.mapMetric(metric)),
      unknownMetrics: facts.metrics.flatMap((metric) => this.unknownMetric(metric)),
    };
  }

  private mapMetric(metric: ExtractedMetricFact): MetricDraft {
    const normalizedLabel = normalizeText(metric.label);
    const match = matchMetric(metric.label, this.catalog.list());
    const answer = classifyAnswer(metric.answer);
    return {
      section: metric.section, sectionOrder: metric.sectionOrder, label: metric.label,
      normalizedLabel, code: match?.code ?? null, canonicalName: match?.name ?? null,
      catalogSection: match?.section ?? null, confidence: match?.confidence ?? null,
      ...answer, observation: metric.observation, page: metric.page,
    };
  }

  private unknownMetric(metric: ExtractedMetricFact) {
    const match = matchMetric(metric.label, this.catalog.list());
    if (match || !metric.label) return [];
    return [{
      label: metric.label, normalizedLabel: normalizeText(metric.label), section: metric.section,
      sectionOrder: metric.sectionOrder, status: "PENDIENTE" as const,
    }];
  }
}
