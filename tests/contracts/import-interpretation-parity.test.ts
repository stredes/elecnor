import { describe, expect, it } from "vitest";
import { InterpretDocument } from "@/backend/application/interpret-document";
import { catalogDefinitions } from "@/backend/domain/catalog/catalog-data";
import { matchMetric } from "@/backend/domain/catalog/catalog-match";
import { normalizeText } from "@/backend/domain/import-normalization";
import { validImportFacts } from "./import-fixtures";

describe("NP-0032/AC-01/TEST-01 import interpretation parity", () => {
  it("preserves answer semantics, geography, rubric, key and printed score", () => {
    const interpreter = new InterpretDocument(
      { list: () => catalogDefinitions },
      { digest: (value) => `hash:${value}` },
    );
    const draft = interpreter.execute(validImportFacts);

    expect(draft.status).toBe("COMPLETA");
    expect(draft.metrics[0]).toMatchObject({ code: "EPP_LENTES", conforming: 1 });
    expect(draft.metrics[1]).toMatchObject({ state: "NA", applicable: 0, notApplicable: 1 });
    expect(draft.unknownMetrics[0].label).toBe("Pregunta sin catálogo");
    expect(draft.city).toBe("Talca");
    expect(draft.region).toBe("Maule");
    expect(draft.rubricVersion).toBe("RUBRICA_24_4");
    expect(draft.score?.percentage).toBe(83.33);
    expect(draft.logicalKey).toBe("hash:ana soto|2026 09 09|08 05|1469 talca maule chile|eva rios");
    expect(normalizeText("Protección ß")).toBe("proteccion ss");
  });

  it("keeps fuzzy threshold and stable tie order explicit", () => {
    const definitions = [
      { code: "A", name: "A", section: "s", keywords: [], variants: ["control de acceso"] },
      { code: "B", name: "B", section: "s", keywords: [], variants: ["control de aceso"] },
    ];
    expect(matchMetric("control de aceso", definitions)?.code).toBe("B");
    expect(matchMetric("control de axeso", definitions)?.confidence).toBeGreaterThanOrEqual(0.88);
    expect(matchMetric("zzzz", definitions)).toBeNull();
  });
});
