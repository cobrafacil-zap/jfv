"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "password" | "magic-link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("password");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verifica se é admin ou aluno
      const { data: admin } = await supabase
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", data.user.id)
        .single();

      if (redirect) {
        router.push(redirect);
      } else if (admin) {
        router.push("/admin");
      } else {
        router.push("/membros");
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao fazer login."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setSuccess("Enviamos um link de acesso para o seu e-mail!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} />
        Voltar ao site
      </Link>

      <div className="rounded-2xl border border-border bg-bg-card/50 p-8 backdrop-blur-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {mode === "password" ? "Entrar" : "Acessar via link"}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {mode === "password"
              ? "Entre com seu e-mail e senha"
              : "Receba um link mágico no seu e-mail"}
          </p>
        </div>

        {reason === "inactive" && (
          <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
            Sua conta ainda não está ativa. Conclua o pagamento para acessar.
          </div>
        )}

        {reason === "not_admin" && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            Você não tem permissão de administrador.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300">
            {success}
          </div>
        )}

        <form
          onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="email">E-mail</Label>
            <div className="relative mt-1.5">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <Input
                id="email"
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {mode === "password" && (
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/recuperar-senha"
                  className="text-xs text-accent hover:underline"
                >
                  Esqueci a senha
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : mode === "password" ? (
              "Entrar"
            ) : (
              "Enviar link de acesso"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "password" ? "magic-link" : "password");
              setError(null);
              setSuccess(null);
            }}
            className="text-sm text-text-secondary transition-colors hover:text-accent"
          >
            {mode === "password"
              ? "Entrar com link mágico por e-mail"
              : "Entrar com senha"}
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-text-muted">
        <ShieldCheck size={12} className="inline" /> Acesso protegido e
        criptografado
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center text-text-muted">
            <Loader2 size={24} className="animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
