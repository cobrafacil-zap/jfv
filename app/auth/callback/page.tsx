"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verificando seu link de acesso...");
  const processedRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (processedRef.current) return;
      processedRef.current = true;

      try {
        const { getSupabaseBrowserClient } = await import("@/lib/supabase-client");
        const supabase = getSupabaseBrowserClient();

        // O Supabase Auth coloca tokens no HASH (#access_token=...)
        // depois de processar o verify
        const hash = window.location.hash; // ex: "#access_token=xxx&type=magiclink"
        const query = window.location.search; // ex: "?access_token=xxx"

        const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : hash);
        const queryParams = new URLSearchParams(query);

        const accessToken =
          hashParams.get("access_token") || queryParams.get("access_token");
        const refreshToken =
          hashParams.get("refresh_token") || queryParams.get("refresh_token");
        const type =
          hashParams.get("type") || queryParams.get("type") || "magiclink";
        const errorDescription =
          hashParams.get("error_description") ||
          queryParams.get("error_description");

        if (errorDescription) {
          console.error("Auth error from URL:", errorDescription);
          setStatus("error");
          setMessage(decodeURIComponent(errorDescription));
          return;
        }

        if (accessToken) {
          // Tem token: define a sessão
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (error) {
            console.error("Set session error:", error);
            setStatus("error");
            setMessage("Link inválido ou expirado. Solicite um novo na página de login.");
            return;
          }

          if (data.user) {
            // Limpa o hash da URL pra evitar re-processamento
            try {
              window.history.replaceState(null, "", window.location.pathname);
            } catch (e) {
              // ignore
            }

            setStatus("success");
            // Se for magiclink (primeiro acesso ou login), vai pra /cadastro
            // Senão, vai pra /membros
            const target = type === "magiclink" ? "/cadastro" : "/membros";
            const msg =
              type === "magiclink"
                ? "Login realizado! Redirecionando para definir sua senha..."
                : "Login realizado com sucesso!";

            setMessage(msg);
            setTimeout(() => {
              router.push(target);
              router.refresh();
            }, 800);
            return;
          }
        }

        // Sem token na URL: pode ser que o Supabase ainda esteja processando
        // Escuta o evento de sign-in
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === "SIGNED_IN" && session) {
              setStatus("success");
              setMessage("Login realizado! Redirecionando...");
              setTimeout(() => {
                router.push("/cadastro");
                router.refresh();
              }, 800);
              subscription.unsubscribe();
            }
          }
        );

        // Verifica se já existe sessão
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus("success");
          setMessage("Login realizado! Redirecionando...");
          setTimeout(() => {
            router.push("/cadastro");
            router.refresh();
          }, 800);
          subscription.unsubscribe();
          return;
        }

        // Timeout de segurança: se nada acontecer em 5s, mostra erro
        setTimeout(() => {
          subscription.unsubscribe();
          setStatus("error");
          setMessage(
            "Link inválido ou expirado. Solicite um novo na página de login."
          );
        }, 5000);
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("error");
        setMessage("Erro ao processar link. Tente novamente.");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="w-full max-w-sm text-center">
        <div className="rounded-2xl border border-border bg-bg-card/50 p-6 backdrop-blur-sm md:p-8">
          {status === "loading" && (
            <>
              <Loader2 size={40} className="mx-auto animate-spin text-accent" />
              <p className="mt-4 text-sm text-text-secondary">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-gradient shadow-accent-glow">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <h1 className="mt-3 font-display text-lg font-bold text-text-primary">
                {message}
              </h1>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
                <AlertCircle size={28} className="text-red-400" />
              </div>
              <h1 className="mt-3 font-display text-lg font-bold text-text-primary">
                Não foi possível entrar
              </h1>
              <p className="mt-2 text-xs text-text-secondary">{message}</p>
              <Link
                href="/login"
                className="mt-5 inline-block rounded-lg bg-accent-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:shadow-accent-glow"
              >
                Solicitar novo link
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}