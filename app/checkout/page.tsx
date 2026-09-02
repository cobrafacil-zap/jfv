"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Lock, ArrowLeft, Loader2, Copy, Check, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

const PRICE = 4.99;
const PRICE_ORIGINAL = 19.90;
const DISCOUNT = PRICE_ORIGINAL - PRICE; // 14.91
const MP_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ||
  process.env.MERCADOPAGO_PUBLIC_KEY ||
  "";

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
}

type PaymentMethod = "card" | "pix";

interface CardData {
  number: string;
  holderName: string;
  expiry: string; // MM/YY
  cvv: string;
  installments: number;
  brand: string; // visa, master, amex, elo, hipercard, etc
}

export default function CheckoutPage() {
  const [form, setForm] = useState<CheckoutForm>({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
  });
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "payment">("form");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // Pix
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cartão
  const [card, setCard] = useState<CardData>({
    number: "",
    holderName: "",
    expiry: "",
    cvv: "",
    installments: 1,
    brand: "",
  });
  const [cardProcessing, setCardProcessing] = useState(false);

  // Carrega SDK do MP para tokenizar cartão
  useEffect(() => {
    if (step !== "payment" || paymentMethod !== "card") return;
    if (typeof window === "undefined") return;
    if ((window as any).MercadoPago) return; // já carregou

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.dataset.publicKey = MP_PUBLIC_KEY;
    document.body.appendChild(script);
  }, [step, paymentMethod]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!form.fullName || !form.email || !form.cpf) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }

      const response = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar. Tente novamente.");
      }

      if (!data.studentId) {
        throw new Error("Resposta inválida do servidor.");
      }

      setStudentId(data.studentId);
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // PIX — Checkout Transparente
  // ========================================
  const handlePixPayment = async () => {
    if (!studentId) return;
    setCardProcessing(true);
    setError(null);

    try {
      const cpfClean = form.cpf.replace(/\D/g, "");
      const response = await fetch("/api/checkout/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          email: form.email,
          firstName: form.fullName.split(" ")[0],
          lastName: form.fullName.split(" ").slice(1).join(" "),
          cpf: cpfClean,
          amount: PRICE,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar Pix.");
      }

      setPixPaymentId(data.paymentId);
      setPixQrCode(data.qrCode);
      setPixQrCodeBase64(data.qrCodeBase64);
      setPolling(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar Pix.");
    } finally {
      setCardProcessing(false);
    }
  };

  // Polling Pix
  useEffect(() => {
    if (!polling || !pixPaymentId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/checkout/check-payment/${pixPaymentId}`
        );
        const data = await response.json();

        if (data.status === "approved") {
          setPolling(false);
          window.location.href = "/checkout/success";
        } else if (data.status === "rejected" || data.status === "cancelled") {
          setPolling(false);
          setError("Pagamento rejeitado. Tente novamente.");
          setPixPaymentId(null);
          setPixQrCode(null);
          setPixQrCodeBase64(null);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [polling, pixPaymentId]);

  // ========================================
  // CARTÃO — Checkout Transparente
  // ========================================
  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    setCardProcessing(true);
    setError(null);

    try {
      const mp = (window as any).MercadoPago;
      if (!mp) {
        throw new Error("SDK do Mercado Pago não carregou. Recarregue a página.");
      }
      if (!MP_PUBLIC_KEY) {
        throw new Error("Chave pública do Mercado Pago não configurada.");
      }

      if (!card.brand) {
        throw new Error("Selecione a bandeira do cartão.");
      }

      // 1) Tokeniza o cartão no client usando SDK v2 do MP
      // O MP exige tokenização client-side por PCI-DSS — não dá pra enviar
      // número/validade/CVV crus para a API.
      const mpInstance = new mp(MP_PUBLIC_KEY);
      const cardToken = await mpInstance.createCardToken({
        cardNumber: card.number.replace(/\s/g, ""),
        cardholderName: card.holderName,
        cardExpirationMonth: card.expiry.split("/")[0],
        cardExpirationYear: (() => {
          const y = card.expiry.split("/")[1] || "";
          return y.length === 2 ? `20${y}` : y;
        })(),
        securityCode: card.cvv,
        identificationType: "CPF",
        identificationNumber: form.cpf.replace(/\D/g, ""),
      });

      if (!cardToken?.id) {
        throw new Error("Não foi possível tokenizar o cartão. Verifique os dados.");
      }

      const cpfClean = form.cpf.replace(/\D/g, "");

      // 2) Envia apenas o token para o backend
      const response = await fetch("/api/checkout/process-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          card: {
            token: cardToken.id,
            payment_method_id: card.brand,
          },
          payer: {
            email: form.email,
            firstName: form.fullName.split(" ")[0],
            lastName: form.fullName.split(" ").slice(1).join(" "),
            identification: {
              type: "CPF",
              number: cpfClean,
            },
          },
          installments: card.installments,
          amount: PRICE,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro ao processar pagamento.");
      }

      if (result.status === "rejected") {
        throw new Error(result.message || "Pagamento rejeitado.");
      }

      if (result.status === "approved") {
        window.location.href = "/checkout/success";
        return;
      }

      if (result.status === "pending" || result.status === "in_process") {
        if (result.id) {
          window.location.href = `/checkout/pending?id=${result.id}`;
          return;
        }
        throw new Error("Pagamento em processamento. Aguarde a confirmação.");
      }

      throw new Error("Resposta inesperada do servidor.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao processar pagamento."
      );
    } finally {
      setCardProcessing(false);
    }
  };

  const handleMask = (field: keyof CheckoutForm, value: string) => {
    let masked = value;
    if (field === "cpf") {
      masked = value
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else if (field === "phone") {
      masked = value
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    setForm({ ...form, [field]: masked });
  };

  const maskCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .slice(0, 19)
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();
  };

  const maskExpiry = (value: string) => {
    return value
      .replace(/\D/g, "")
      .slice(0, 4)
      .replace(/(\d{2})(\d)/, "$1/$2");
  };

  const copyPixCode = () => {
    if (pixQrCode) {
      navigator.clipboard.writeText(pixQrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-bg-primary">
      <div className="container-custom py-8 md:py-12">
        <a
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          <ArrowLeft size={16} />
          Voltar ao site
        </a>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Resumo do pedido */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-border bg-bg-card/50 p-8 backdrop-blur-sm">
              <h1 className="font-display text-2xl font-bold text-text-primary">
                Resumo do pedido
              </h1>

              <div className="mt-6 rounded-xl border border-border bg-bg-card p-5">
                <h3 className="font-semibold text-text-primary">
                  Como gravar bons vídeos pelo celular
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Curso completo · Acesso vitalício
                </p>
                <ul className="mt-4 space-y-2 text-sm text-text-secondary">
                  <li>✓ 6 módulos com aulas práticas</li>
                  <li>✓ Comunidade exclusiva</li>
                  <li>✓ Checklist de gravação</li>
                  <li>✓ Templates de edição</li>
                  <li>✓ Atualizações gratuitas</li>
                </ul>
              </div>

              <div className="mt-6 space-y-2 border-t border-border pt-6 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>{formatPrice(PRICE_ORIGINAL)}</span>
                </div>
                <div className="flex justify-between font-semibold text-accent">
                  <span>Desconto de lançamento</span>
                  <span>-{formatPrice(DISCOUNT)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-lg font-bold text-text-primary">
                  <span>Total à vista</span>
                  <span className="text-gradient">{formatPrice(PRICE)}</span>
                </div>
                <p className="text-xs text-text-muted">
                  ou 3x de {formatPrice(PRICE / 3)} no cartão
                </p>
              </div>

              <div className="mt-6 space-y-2 text-xs text-text-muted">
                <p className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-accent" />
                  Garantia incondicional de 7 dias
                </p>
                <p className="flex items-center gap-2">
                  <Lock size={14} className="text-accent" />
                  Pagamento 100% seguro via Mercado Pago
                </p>
              </div>
            </div>
          </div>

          {/* Formulário / Pagamento */}
          <div>
            <div className="rounded-2xl border border-border bg-bg-card/50 p-8 backdrop-blur-sm">
              {step === "form" && (
                <>
                  <h2 className="font-display text-2xl font-bold text-text-primary">
                    Seus dados
                  </h2>
                  <p className="mt-2 text-sm text-text-secondary">
                    Preencha seus dados para acessar o pagamento.
                  </p>

                  <form onSubmit={handleFormSubmit} className="mt-8 space-y-4">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="mb-2 block text-sm font-medium text-text-primary"
                      >
                        Nome completo *
                      </label>
                      <Input
                        id="fullName"
                        required
                        placeholder="Maria Silva"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-text-primary"
                      >
                        E-mail *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="seuemail@exemplo.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                      <p className="mt-1 text-xs text-text-muted">
                        Você receberá o acesso ao curso neste e-mail.
                      </p>
                      <div className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] text-amber-200 md:text-xs">
                        <div className="flex items-start gap-1.5">
                          <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-300" />
                          <div>
                            <strong className="font-semibold text-amber-100">Importante:</strong>{" "}
                            após o pagamento, o e-mail de acesso pode cair na pasta{" "}
                            <strong>Spam</strong> ou <strong>Promoções</strong>.
                            Confira lá caso não veja na caixa de entrada.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium text-text-primary"
                      >
                        WhatsApp
                      </label>
                      <Input
                        id="phone"
                        placeholder="(11) 98765-4321"
                        value={form.phone}
                        onChange={(e) => handleMask("phone", e.target.value)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="cpf"
                        className="mb-2 block text-sm font-medium text-text-primary"
                      >
                        CPF *
                      </label>
                      <Input
                        id="cpf"
                        required
                        placeholder="000.000.000-00"
                        value={form.cpf}
                        onChange={(e) => handleMask("cpf", e.target.value)}
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? "Processando..." : "Continuar para pagamento"}
                    </Button>

                    <p className="text-center text-xs text-text-muted">
                      Ao continuar, você concorda com nossos termos de uso.
                    </p>
                  </form>
                </>
              )}

              {step === "payment" && studentId && (
                <>
                  <h2 className="font-display text-2xl font-bold text-text-primary">
                    Pagamento
                  </h2>
                  <p className="mt-2 text-sm text-text-secondary">
                    Escolha a forma de pagamento e finalize sua inscrição.
                  </p>

                  {/* Tabs de método de pagamento */}
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => {
                        setPaymentMethod("card");
                        setPixPaymentId(null);
                        setError(null);
                      }}
                      className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${
                        paymentMethod === "card"
                          ? "border-accent bg-accent/15 text-accent"
                          : "border-border bg-bg-elevated text-text-secondary hover:border-accent"
                      }`}
                    >
                      💳 Cartão
                    </button>
                    <button
                      onClick={() => {
                        setPaymentMethod("pix");
                        setError(null);
                      }}
                      className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${
                        paymentMethod === "pix"
                          ? "border-accent bg-accent/15 text-accent"
                          : "border-border bg-bg-elevated text-text-secondary hover:border-accent"
                      }`}
                    >
                      🔑 Pix
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  {/* CARTÃO — Checkout Transparente */}
                  {paymentMethod === "card" && !pixPaymentId && (
                    <form onSubmit={handleCardPayment} className="mt-6 space-y-4">
                      <div>
                        <label
                          htmlFor="cardNumber"
                          className="mb-2 block text-sm font-medium text-text-primary"
                        >
                          Número do cartão
                        </label>
                        <Input
                          id="cardNumber"
                          required
                          placeholder="0000 0000 0000 0000"
                          value={card.number}
                          onChange={(e) =>
                            setCard({
                              ...card,
                              number: maskCardNumber(e.target.value),
                            })
                          }
                          maxLength={23}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="holderName"
                          className="mb-2 block text-sm font-medium text-text-primary"
                        >
                          Nome impresso no cartão
                        </label>
                        <Input
                          id="holderName"
                          required
                          placeholder="MARIA SILVA"
                          value={card.holderName}
                          onChange={(e) =>
                            setCard({
                              ...card,
                              holderName: e.target.value.toUpperCase(),
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="expiry"
                            className="mb-2 block text-sm font-medium text-text-primary"
                          >
                            Validade
                          </label>
                          <Input
                            id="expiry"
                            required
                            placeholder="MM/AA"
                            value={card.expiry}
                            onChange={(e) =>
                              setCard({
                                ...card,
                                expiry: maskExpiry(e.target.value),
                              })
                            }
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="cvv"
                            className="mb-2 block text-sm font-medium text-text-primary"
                          >
                            CVV
                          </label>
                          <Input
                            id="cvv"
                            required
                            placeholder="123"
                            value={card.cvv}
                            onChange={(e) =>
                              setCard({
                                ...card,
                                cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                              })
                            }
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="brand"
                          className="mb-2 block text-sm font-medium text-text-primary"
                        >
                          Bandeira
                        </label>
                        <select
                          id="brand"
                          required
                          value={card.brand}
                          onChange={(e) =>
                            setCard({ ...card, brand: e.target.value })
                          }
                          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                        >
                          <option value="">Selecione a bandeira...</option>
                          <option value="visa">Visa</option>
                          <option value="master">Mastercard</option>
                          <option value="amex">American Express</option>
                          <option value="elo">Elo</option>
                          <option value="hipercard">Hipercard</option>
                          <option value="hiper">Hiper</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="installments"
                          className="mb-2 block text-sm font-medium text-text-primary"
                        >
                          Parcelas
                        </label>
                        <select
                          id="installments"
                          value={card.installments}
                          onChange={(e) =>
                            setCard({
                              ...card,
                              installments: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
                        >
                          <option value={1}>
                            1x de {formatPrice(PRICE)} sem juros
                          </option>
                          <option value={2}>
                            2x de {formatPrice(PRICE / 2)} sem juros
                          </option>
                          <option value={3}>
                            3x de {formatPrice(PRICE / 3)} sem juros
                          </option>
                        </select>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={cardProcessing}
                      >
                        {cardProcessing ? (
                          <>
                            <Loader2 size={18} className="mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          `Pagar ${formatPrice(PRICE)}`
                        )}
                      </Button>

                      <p className="text-center text-xs text-text-muted">
                        🔒 Dados criptografados e processados diretamente pelo
                        Mercado Pago
                      </p>
                    </form>
                  )}

                  {/* PIX — Checkout Transparente */}
                  {paymentMethod === "pix" && !pixPaymentId && (
                    <div className="mt-6 space-y-4">
                      <p className="text-sm text-text-secondary">
                        Clique no botão abaixo para gerar o QR Code Pix. O
                        pagamento é aprovado em segundos.
                      </p>
                      <Button
                        onClick={handlePixPayment}
                        disabled={cardProcessing}
                        size="lg"
                        className="w-full"
                      >
                        {cardProcessing ? (
                          <>
                            <Loader2 size={18} className="mr-2 animate-spin" />
                            Gerando Pix...
                          </>
                        ) : (
                          "Gerar QR Code Pix"
                        )}
                      </Button>
                    </div>
                  )}

                  {/* QR CODE PIX */}
                  {paymentMethod === "pix" && pixPaymentId && (
                    <div className="mt-6 space-y-4 text-center">
                      <p className="text-sm font-semibold text-text-primary">
                        Escaneie o QR Code ou copie o código abaixo
                      </p>

                      {pixQrCodeBase64 && (
                        <div className="flex justify-center">
                          <img
                            src={`data:image/png;base64,${pixQrCodeBase64}`}
                            alt="QR Code Pix"
                            className="h-56 w-56 rounded-lg border-2 border-border bg-white p-2"
                          />
                        </div>
                      )}

                      {pixQrCode && (
                        <div className="space-y-2">
                          <p className="text-xs text-text-muted">
                            Pix Copia e Cola:
                          </p>
                          <div className="rounded-lg border border-border bg-bg-elevated p-3 text-left">
                            <p className="break-all font-mono text-xs text-text-secondary">
                              {pixQrCode}
                            </p>
                          </div>
                          <button
                            onClick={copyPixCode}
                            type="button"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:underline"
                          >
                            {copied ? (
                              <>
                                <Check size={14} />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                Copiar código
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {polling && (
                        <div className="flex items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
                          <Loader2 size={16} className="animate-spin" />
                          Aguardando pagamento...
                        </div>
                      )}

                      <p className="text-xs text-text-muted">
                        Após pagar, o acesso é liberado automaticamente em
                        alguns segundos.
                      </p>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setStep("form");
                      setPixPaymentId(null);
                      setError(null);
                    }}
                  >
                    ← Voltar e editar dados
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
