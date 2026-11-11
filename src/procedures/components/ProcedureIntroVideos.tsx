import { ProcedureVideo } from "./ProcedureVideo";

const INTRO_VIDEOS = [
  { id: "POH042GE0z0", title: "Elecnor: Global 2026" },
] as const;

export function ProcedureIntroVideos() {
  return <section className="procedure-intro-videos" aria-labelledby="procedure-intro-title"><div className="procedure-intro-heading"><span>Orientación inicial</span><h2 id="procedure-intro-title">Introducción a los procedimientos</h2><p>Revisa estos videos antes de consultar el catálogo. Funcionan como una guía general para comprender el propósito y la aplicación preventiva de los procedimientos de trabajo seguro.</p></div><div className={`procedure-intro-grid${INTRO_VIDEOS.length === 1 ? " procedure-intro-grid-single" : ""}`}>{INTRO_VIDEOS.map((video) => <article className="procedure-intro-card" key={video.id}><header><h3>{video.title}</h3></header><ProcedureVideo videoId={video.id} title={video.title} /></article>)}</div></section>;
}
