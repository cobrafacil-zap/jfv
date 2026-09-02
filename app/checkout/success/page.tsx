import Link from "next/link";
import { CheckCircle2, ArrowRight, Mail, AlertCircle, Inbox, Shield } from "lucide-react";

export default function SuccessPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Hero - sucesso */}
        <div className="text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-gradient shadow-accent-glow md:h-16 md:w-16">
            <CheckCircle2 size={32} className="text-white md:size-9" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold leading-tight text-text-primary md:text-2xl">
            Pagamento confirmado!
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Bem-vinda ao curso{" "}
            <strong className="text-text-primary">
              Como gravar bons vídeos pelo celular
            </strong>
          </p>
        </div>

        {/* Alerta email */}
        <div className="mt-5 rounded-xl border-2 border-amber-500/60 bg-amber-500/10 p-3 md:mt-6">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 md:h-9 md:w-9">
              <Mail size={16} className="text-amber-300 md:size-[18px]" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-semibold text-amber-100">
                📬 Confira seu e-mail
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-amber-200/90">
                O link de acesso pode demorar alguns minutos e cair em{" "}
                <strong>Spam</strong> ou <strong>Promoções</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* CTA principal */}
        <div className="mt-4 rounded-xl border-2 border-accent bg-accent/5 p-4">
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gradient px-5 py-3 text-sm font-semibold text-white shadow-accent-glow-sm transition-all hover:shadow-accent-glow"
          >
            <Mail size={16} />
            Entrar com seu e-mail
            <ArrowRight size={16} />
          </Link>
          <p className="mt-2 text-center text-[11px] text-text-muted">
            Primeiro acesso? Defina sua senha. Já tem conta? É só entrar.
          </p>
        </div>

        {/* Como achar o email */}
        <details className="mt-3 rounded-lg border border-border bg-bg-card/40 backdrop-blur-sm">
          <summary className="flex cursor-pointer items-center gap-2 p-3 text-xs font-semibold text-text-primary">
            <Inbox size={14} className="text-accent" />
            Não encontrou o e-mail? Veja onde procurar
          </summary>
          <ol className="space-y-1.5 border-t border-border p-3 text-[11px] text-text-secondary">
            <li>
              <strong>1.</strong> Verifique as pastas{" "}
              <strong>Spam</strong> e <strong>Promoções</strong>
            </li>
            <li>
              <strong>2.</strong> Pesquise por{" "}
              <strong className="text-text-primary">jeitofacildevender.online</strong>
            </li>
            <li>
              <strong>3.</strong> Se achar, marque como{" "}
              <strong>&ldquo;Não é spam&rdquo;</strong>
            </li>
            <li>
              <strong>4.</strong> Clique em{" "}
              <strong>&ldquo;Entrar com seu e-mail&rdquo;</strong> e peça um novo
            </li>
          </ol>
        </details>

        {/* Dica anti-spam */}
        <details className="mt-2 rounded-lg border border-border bg-bg-card/40 backdrop-blur-sm">
          <summary className="flex cursor-pointer items-center gap-2 p-3 text-xs font-semibold text-text-primary">
            <Shield size={14} className="text-accent" />
            Pra não cair mais em spam
          </summary>
          <p className="border-t border-border p-3 text-[11px] leading-relaxed text-text-secondary">
            Adicione{" "}
            <strong className="text-text-primary">
              contato@jeitofacildevender.online
            </strong>{" "}
            aos contatos. Assim os próximos e-mails chegam certinho.
          </p>
        </details>

        <div className="mt-5 text-center md:mt-6">
          <Link
            href="/"
            className="text-xs text-text-muted transition-colors hover:text-accent"
          >
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </main>
  );
}
