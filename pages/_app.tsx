import type { AppProps } from "next/app";
import { Bebas_Neue, IBM_Plex_Mono, Inter } from "next/font/google";
import "../src/dashboard/styles/globals.css";
import "../src/dashboard/styles/legacy-shell.css";
import "../src/dashboard/styles/legacy-report.css";
import "../src/dashboard/styles/legacy-data.css";
import "../src/dashboard/styles/legacy-routes.css";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-hc-bebas", display: "swap" });
const inter = Inter({ weight: ["300", "400", "600"], subsets: ["latin"], variable: "--font-hc-inter", display: "swap" });
const plexMono = IBM_Plex_Mono({ weight: ["400", "600"], subsets: ["latin"], variable: "--font-hc-plex-mono", display: "swap" });

export default function App({ Component, pageProps }: AppProps) {
  return <div className={`${bebas.variable} ${inter.variable} ${plexMono.variable} app-root`}><Component {...pageProps} /></div>;
}
