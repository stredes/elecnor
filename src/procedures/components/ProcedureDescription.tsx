import type { ProcedureDescriptionBlock, ProcedureDescriptionSection } from "../contracts/procedure-description-contract";

const sectionPattern = /(?:^|\n)[ \t]*(Objetivo|Alcance)[ \t]*:?[ \t]*(?:\n|$)/gi;
const listMarker = /^(?:[•●▪◦*-]\s+|[a-z]\)\s+|\d+[.)]\s+)/i;

export function splitProcedureDescription(description: string): readonly ProcedureDescriptionSection[] {
  const source = description.replace(/\r\n?/g, "\n").trim();
  const matches = [...source.matchAll(sectionPattern)];
  if (!matches.length) return createSections([{ heading: null, content: source }]);
  const sections: { readonly heading: string | null; readonly content: string }[] = [];
  const firstIndex = matches[0].index ?? 0;
  if (firstIndex > 0) sections.push({ heading: null, content: source.slice(0, firstIndex) });
  matches.forEach((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? source.length;
    sections.push({ heading: match[1] ?? null, content: source.slice(start + match[0].length, end) });
  });
  return createSections(sections);
}

export function ProcedureDescription({ description }: { readonly description: string }) {
  const sections = splitProcedureDescription(description);
  return <div className="legacy-procedure-description">{sections.map((section, index) => <article className="legacy-procedure-description-section" key={`${section.heading ?? "description"}-${index}`}>
    {section.heading && <h3><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{section.heading}</h3>}
    <div className="legacy-procedure-description-blocks">{section.blocks.map((block, blockIndex) => block.type === "list" ? <ul key={`list-${blockIndex}`}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul> : <p key={`paragraph-${blockIndex}`}>{block.text}</p>)}</div>
  </article>)}</div>;
}

function createSections(input: readonly { readonly heading: string | null; readonly content: string }[]): readonly ProcedureDescriptionSection[] {
  return input.map(({ heading, content }) => ({ heading, blocks: createBlocks(content) })).filter((section) => section.blocks.length > 0);
}

function createBlocks(content: string): readonly ProcedureDescriptionBlock[] {
  return content.split(/\n\s*\n+/).flatMap((paragraph) => blocksFromLines(paragraph.split("\n").map((line) => line.trim()).filter(Boolean)));
}

function blocksFromLines(lines: readonly string[]): readonly ProcedureDescriptionBlock[] {
  const blocks: ProcedureDescriptionBlock[] = [];
  let prose: string[] = [];
  let items: string[] = [];
  const flushProse = () => { if (prose.length) blocks.push({ type: "paragraph", text: prose.join(" ") }); prose = []; };
  const flushItems = () => { if (items.length) blocks.push({ type: "list", items }); items = []; };
  lines.forEach((line) => { if (listMarker.test(line)) { flushProse(); items.push(line.replace(listMarker, "").trim()); } else { flushItems(); prose.push(line); } });
  flushProse();
  flushItems();
  return blocks;
}
