import Head from "next/head";
import { useEffect } from "react";
import type { AppProps } from "next/app";
import "../src/dashboard/styles/globals.css";
import "../src/dashboard/styles/legacy-shell.css";
import "../src/dashboard/styles/legacy-report.css";
import "../src/dashboard/styles/legacy-data.css";
import "../src/dashboard/styles/metrics-polish.css";
import "../src/dashboard/styles/legacy-routes.css";
import "../src/dashboard/styles/procedure-detail.css";
import "../src/dashboard/styles/loading.css";
import "../src/dashboard/styles/ui-polish.css";
import "../src/dashboard/styles/exigency-colors.css";
import "../src/dashboard/styles/executive-report.css";
import "../src/dashboard/styles/executive-dashboard.css";
import "../src/dashboard/styles/executive-portal.css";
import "../src/elecnor/elecnor-comparison.css";
import "../src/auth/auth.css";
import "../src/inspections/inspections-list.css";
import { RouteLoadingIndicator } from "../src/dashboard/components/RouteLoadingIndicator";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
  }, []);

  return <><Head><link rel="icon" href="/favicon.svg" type="image/svg+xml" /></Head><div className="app-root"><Component {...pageProps} /><RouteLoadingIndicator /></div></>;
}
