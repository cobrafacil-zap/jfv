"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = getSupabaseBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/cadastro`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar e-mail de recuperação."
      );
    } finally {
      setLoading(false);
    }
  };

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
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold text-text-primary">
              Recuperar senha
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Vamos enviar um link para você redefinir sua senha
            </p>
          </div>

          {success ? (
            <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-300">
              Enviamos um link de recuperação para o seu e-mail. Verifique a
              caixa de entrada (e o spam).
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Enviar link"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}