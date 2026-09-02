"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CadastroPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(true);

  const supabase = getSupabaseBrowserClient();

  // Verifica se o usuário tá logado ao chegar na página
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Não tá logado - manda pro login
        router.push("/login");
        return;
      }

      setChecking(false);
    };

    checkSession();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (password.length < 6) {
        throw new Error("A senha deve ter no mínimo 6 caracteres.");
      }
      if (password !== confirm) {
        throw new Error("As senhas não coincidem.");
      }

      // 1) Define a senha (mantém o usuário logado)
      const { data: { user }, error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;
      if (!user) throw new Error("Usuário não encontrado.");

      // 2) Atualiza o aluno via API (NUNCA usar supabaseAdmin no client)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/auth/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });

      if (!response.ok) {
        console.warn("Aviso: não conseguiu marcar senha como definida");
      }

      setSuccess(true);
      setTimeout(() => router.push("/membros"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao definir senha.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <Loader2 size={32} className="animate-spin text-accent" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          <ArrowLeft size={16} />
          Voltar para o login
        </Link>

        <div className="rounded-2xl border border-border bg-bg-card/50 p-8 backdrop-blur-sm">
          {success ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent-gradient shadow-accent-glow">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-text-primary">
                Senha definida!
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Redirecionando para a área de membros...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-bold text-text-primary">
                  Defina sua senha
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                  Crie uma senha para acessar a área de membros
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Nova senha</Label>
                  <div className="relative mt-1.5">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm">Confirme a senha</Label>
                  <div className="relative mt-1.5">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                    <Input
                      id="confirm"
                      type="password"
                      required
                      placeholder="Digite a senha novamente"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Definir senha e entrar"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}