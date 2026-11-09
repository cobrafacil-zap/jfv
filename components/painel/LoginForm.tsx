"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";

function safeNext(value: string | null): string {
  if (!value) return "/painel";
  if (!value.startsWith("/painel")) return "/painel";
  if (value.startsWith("/painel/login")) return "/painel";
  return value;
}

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(
    () => safeNext(searchParams.get("next")),
    [searchParams]
  );

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    setError(null);

    if (!password.trim()) {
      setError("Informe a senha de acesso.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/painel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error || "Não foi possível entrar agora.");
        setLoading(false);
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      {error && (
        <div className="pnl-login-error" role="alert">
          <LockKeyhole size={15} style={{ flex: "0 0 auto", marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="pnl-field">
        <label htmlFor="painel-password">Senha de acesso</label>
        <div className="pnl-input-wrap">
          <input
            id="painel-password"
            type={show ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            autoFocus
            disabled={loading}
            aria-invalid={Boolean(error)}
          />
          <button
            type="button"
            className="pnl-input-toggle"
            onClick={() => setShow((current) => !current)}
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            tabIndex={-1}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="pnl-login-submit"
        disabled={loading || !configured}
      >
        {loading ? "Entrando…" : "Entrar no painel"}
        {!loading && <ArrowRight size={17} />}
      </button>

      {!configured && (
        <div className="pnl-login-warning">
          O painel ainda não está configurado neste ambiente. Defina
          <code> PAINEL_ADMIN_PASSWORD_HASH </code>e
          <code> PAINEL_SESSION_SECRET </code>no Vercel.
        </div>
      )}
    </form>
  );
}
