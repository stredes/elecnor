/** Invalida las secciones persistidas por el Service Worker después de una mutación. */
export function invalidateSectionCache(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.ready
    .then((registration) => registration.active?.postMessage({ type: "CLEAR_ELECNOR_SECTION_CACHE" }))
    .catch(() => undefined);
}
