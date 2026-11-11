"use client";

import { useState } from "react";
import type { LegacyDashboardModel } from "../contracts/legacy-dashboard-contract";
import type { LegacyCoverageRegion } from "../contracts/legacy-layout-contract";

const MAP_CENTER_X = 520;
const MAP_SCALE_X = 3;

const regions: readonly LegacyCoverageRegion[] = [
  { key: "arica", name: "Arica y Parinacota", aliases: ["arica"], x: 526, y: 61, labelY: 62 },
  { key: "tarapaca", name: "Tarapacá", aliases: ["tarapaca"], x: 531, y: 98, labelY: 99 },
  { key: "antofagasta", name: "Antofagasta", aliases: ["antofagasta"], x: 540, y: 162, labelY: 158 },
  { key: "atacama", name: "Atacama", aliases: ["atacama"], x: 522, y: 244, labelY: 244 },
  { key: "coquimbo", name: "Coquimbo", aliases: ["coquimbo"], x: 506, y: 308, labelY: 308 },
  { key: "valparaiso", name: "Valparaíso", aliases: ["valparaiso"], x: 502, y: 357, labelY: 342 },
  { key: "metropolitana", name: "Región Metropolitana", aliases: ["metropolitana", "santiago"], x: 507, y: 372, labelY: 370 },
  { key: "ohiggins", name: "O'Higgins", aliases: ["ohiggins", "bernardo"], x: 501, y: 391, labelY: 397 },
  { key: "maule", name: "Maule", aliases: ["maule"], x: 491, y: 417, labelY: 423 },
  { key: "nuble", name: "Ñuble", aliases: ["nuble"], x: 484, y: 439, labelY: 445 },
  { key: "biobio", name: "Biobío", aliases: ["biobio", "bío bío", "bio bio"], x: 478, y: 458, labelY: 466 },
  { key: "araucania", name: "La Araucanía", aliases: ["araucania"], x: 476, y: 486, labelY: 490 },
  { key: "los-rios", name: "Los Ríos", aliases: ["los rios"], x: 471, y: 519, labelY: 520 },
  { key: "los-lagos", name: "Los Lagos", aliases: ["los lagos"], x: 465, y: 570, labelY: 570 },
  { key: "aisen", name: "Aysén", aliases: ["aisen", "aysen"], x: 458, y: 681, labelY: 665 },
  { key: "magallanes", name: "Magallanes", aliases: ["magallanes"], x: 501, y: 846, labelY: 850 },
];

type Geolocation = LegacyDashboardModel["geolocalizacion"];

export function LegacyCoverageMap({ data }: { readonly data: Geolocation }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const values = regions.map((region) => ({ ...region, total: findTotal(region, data.por_region) }));
  const maxTotal = Math.max(1, ...values.map((region) => region.total));
  const selectedRegion = values.find((region) => region.key === selectedKey);
  const previewRegion = selectedRegion ?? values.find((region) => region.key === hoveredKey);

  function selectRegion(key: string) {
    setSelectedKey((current) => current === key ? null : key);
  }

  return <div className="legacy-coverage-grid">
    <div className="legacy-map-wrap">
      <div className="legacy-map-stage-header">
        <div><p>Mapa interactivo</p><span>{previewRegion ? `${previewRegion.name}: ${previewRegion.total.toLocaleString("es-CL")} inspecciones` : "Pasa el cursor o selecciona una región"}</span></div>
        <span className="legacy-map-legend"><i /> Inspecciones</span>
      </div>
      <svg viewBox="180 20 680 900" role="img" aria-labelledby="legacy-map-title legacy-map-description">
        <title id="legacy-map-title">Inspecciones por región de Chile</title>
        <desc id="legacy-map-description">Mapa interactivo de Chile. Selecciona una región para consultar sus inspecciones.</desc>
        <g transform={`translate(${MAP_CENTER_X} 0) scale(${MAP_SCALE_X} 1) translate(-${MAP_CENTER_X} 0)`}>
          <image aria-hidden="true" href="/chile-regions-cropped.svg" x="425" y="20" width="205" height="900" preserveAspectRatio="none" />
          {values.map((region) => {
          const radius = markerRadius(region.total, maxTotal);
          const isActive = region.key === selectedKey;
          const isPreview = region.key === hoveredKey && !isActive;
          return <g
            key={region.key}
            className={`legacy-map-region${isActive ? " is-active" : ""}${isPreview ? " is-preview" : ""}`}
            transform={`translate(${region.x} ${region.y}) scale(${1 / MAP_SCALE_X} 1) translate(-${region.x} ${-region.y})`}
            role="button"
            tabIndex={0}
            aria-label={`${region.name}: ${region.total} inspecciones. Seleccionar región`}
            aria-pressed={isActive}
            onClick={() => selectRegion(region.key)}
            onMouseEnter={() => setHoveredKey(region.key)}
            onMouseLeave={() => setHoveredKey(null)}
            onFocus={() => setHoveredKey(region.key)}
            onBlur={() => setHoveredKey(null)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectRegion(region.key);
              }
            }}
          >
            <circle className="legacy-map-hit" cx={region.x} cy={region.y} r={Math.max(17, radius + 8)} />
            <circle className="legacy-map-pulse" cx={region.x} cy={region.y} r={radius + 7} />
            <circle className="legacy-map-marker-shadow" cx={region.x + 2} cy={region.y + 3} r={radius} />
            <circle className="legacy-map-marker" cx={region.x} cy={region.y} r={radius} />
            <text x={region.x} y={region.y + 2.5} textAnchor="middle">{region.total}</text>
            <title>{`${region.name}: ${region.total} inspecciones`}</title>
          </g>;
          })}
        </g>
      </svg>
      <p className="legacy-map-help">Cada marcador representa una región. Usa Tab y Enter para explorar sin mouse.</p>
    </div>
    <aside className="legacy-region-list" aria-label="Detalle de cobertura regional">
      <div className="legacy-region-list-header"><div><p>Cobertura regional</p><span>{data.con_geolocalizacion.toLocaleString("es-CL")} de {data.total.toLocaleString("es-CL")} inspecciones geolocalizadas</span></div><b>{values.filter((region) => region.total > 0).length}/{values.length}</b></div>
      <div className={`legacy-region-selection${previewRegion ? " has-region" : ""}`} aria-live="polite">
        {previewRegion ? <>
          <small>{selectedRegion ? "Región seleccionada" : "Vista previa"}</small>
          <strong>{previewRegion.name}</strong>
          <span>{previewRegion.total.toLocaleString("es-CL")} inspecciones registradas</span>
          <a href={`/inspecciones?region=${encodeURIComponent(previewRegion.name)}`}>Ver inspecciones de esta región <span aria-hidden="true">→</span></a>
        </> : <>
          <small>Explora el mapa</small>
          <strong>Selecciona una región</strong>
          <span>Conoce el volumen de inspecciones y abre su detalle.</span>
        </>}
      </div>
      <ul>{values.map((region) => <li key={region.key} className={region.key === selectedKey ? "is-active" : undefined}>
        <button type="button" aria-pressed={region.key === selectedKey} onClick={() => selectRegion(region.key)}>
          <span>{region.name}</span><b>{region.total.toLocaleString("es-CL")}</b>
        </button>
      </li>)}</ul>
      <small className="legacy-region-source">Cartografía regional: SimpleMaps, adaptada para esta visualización.{data.sin_geolocalizacion > 0 ? ` ${data.sin_geolocalizacion.toLocaleString("es-CL")} inspecciones aún no tienen región clasificada.` : ""}</small>
    </aside>
  </div>;
}

function markerRadius(total: number, maxTotal: number): number {
  return 10 + Math.sqrt(total / maxTotal) * 8;
}

function findTotal(region: LegacyCoverageRegion, source: readonly { readonly region: string; readonly total: number }[]): number {
  return source
    .filter((item) => region.aliases.some((alias) => normalize(item.region).includes(normalize(alias))))
    .reduce((total, item) => total + item.total, 0);
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
