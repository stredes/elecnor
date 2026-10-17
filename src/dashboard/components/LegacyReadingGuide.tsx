import type { LegacyReadingGuideProps } from "../contracts/legacy-layout-contract";

export function LegacyReadingGuide({ title, how, reveals }: LegacyReadingGuideProps) {
  return (
    <aside className="legacy-reading-guide">
      <span className="legacy-guide-icon" aria-hidden="true">✦</span>
      <div><p>{title}</p><p><b>Cómo leerla: </b>{how}</p><p><b>Qué revela: </b>{reveals}</p></div>
    </aside>
  );
}
