"use client";

import { useEffect, useState } from "react";
import { Loader2, Clock } from "lucide-react";

export default function CheckoutPendingPage() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("id");
    if (!paymentId) return;

    const interval = setInterval(async () => {
      try {
        const r = await fetch(`/api/checkout/check-payment/${paymentId}`);
        const data = await r.json();
        if (data.status === "approved") {
          setStatus("approved");
          clearInterval(interval);
          setTimeout(() => {
            window.location.href = "/checkout/success";
          }, 1500);
        } else if (data.status === "rejected" || data.status === "cancelled") {
          setStatus("rejected");
          clearInterval(interval);
        }
      } catch {
        // mantém polling
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-primary p-6">
      <div className="max-w-md rounded-2xl border border-border bg-bg-card p-8 text-center">
        {status === "pending" && (
          <>
            <Loader2 size={48} className="mx-auto animate-spin text-accent" />
            <h1 className="mt-6 font-display text-2xl font-bold text-text-primary">
              Pagamento em processamento
            </h1>
            <p className="mt-3 text-sm text-text-secondary">
              Estamos confirmando seu pagamento. Isso pode levar alguns instantes.
              Esta página atualiza sozinha.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
              <Clock size={14} />
              Aguardando confirmação...
            </div>
          </>
        )}
        {status === "approved" && (
          <>
            <Loader2 size={48} className="mx-auto animate-spin text-accent" />
            <h1 className="mt-6 font-display text-2xl font-bold text-text-primary">
              Pagamento aprovado!
            </h1>
            <p className="mt-3 text-sm text-text-secondary">
              Redirecionando para o curso...
            </p>
          </>
        )}
        {status === "rejected" && (
          <>
            <h1 className="font-display text-2xl font-bold text-red-400">
              Pagamento rejeitado
            </h1>
            <p className="mt-3 text-sm text-text-secondary">
              O pagamento foi recusado pelo Mercado Pago. Tente novamente com outro
              cartão.
            </p>
            <a
              href="/checkout"
              className="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg-primary hover:opacity-90"
            >
              Voltar para o checkout
            </a>
          </>
        )}
      </div>
    </main>
  );
}
