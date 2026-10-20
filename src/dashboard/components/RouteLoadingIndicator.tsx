"use client";

import Router from "next/router";
import { useEffect, useState } from "react";

export function RouteLoadingIndicator() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = () => setLoading(true);
    const stop = () => setLoading(false);
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", stop);
    Router.events.on("routeChangeError", stop);
    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", stop);
      Router.events.off("routeChangeError", stop);
    };
  }, []);

  if (!loading) return null;
  return <div className="route-loading" role="status" aria-live="polite"><span className="route-loading-bar" /><span>Cargando la sección…</span></div>;
}
