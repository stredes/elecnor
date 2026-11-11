import Head from "next/head";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) { setError(payload.error ?? "No fue posible iniciar sesión."); return; }
      const next = typeof router.query.next === "string" && router.query.next.startsWith("/") && !router.query.next.startsWith("//") ? router.query.next : "/";
      await router.replace(next);
    } catch { setError("No fue posible conectar con el portal."); } finally { setLoading(false); }
  }
  return <><Head><title>Acceso · Elecnor</title></Head><main className="auth-page"><section className="auth-card" aria-labelledby="login-title"><div className="auth-brand"><span className="auth-mark" aria-hidden="true" /><span>HC Soluciones · Elecnor</span></div><div className="auth-copy"><span className="auth-kicker">Portal seguro</span><h1 id="login-title">Iniciar sesión</h1><p>Accede al tablero de inspecciones, métricas y comparativa de trabajadores.</p></div><form className="auth-form" onSubmit={submit}><div><label htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></div><div><label htmlFor="password">Clave</label><input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></div>{error && <p className="auth-error" role="alert">{error}</p>}<button type="submit" disabled={loading}>{loading ? "Validando…" : "Entrar al portal"}</button></form><p className="auth-help">Sesión protegida · Cierre automático por inactividad.</p></section></main></>;
}
