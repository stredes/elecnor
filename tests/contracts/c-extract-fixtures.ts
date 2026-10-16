export const validCExtractDocument = {
  contract_version: "1.0.0",
  document_type: "inspection",
  extraction_status: "partial",
  document_id: "synthetic-inspection-1",
  date: { year: 2026, month: 3, day: null },
  time: null,
  timezone: null,
  location: {
    city: "Ciudad sintética", region: "Norte", latitude: null, longitude: null, source: null,
  },
  rubric: { name: "Mitti", version: null, source: "synthetic" },
  source: { filename: "synthetic.pdf", sha256: "synthetic-hash", pages: 2 },
  sections: [{
    index: 0,
    name: "Preparación",
    items: [{
      index: 0, label: "EPP", response: null, observation: null, page: 1,
      source_text: "EPP sintético",
    }],
  }],
  metadata: { fixture: "synthetic" },
} as const;
