"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/* ============================================================
   Configuração
   ============================================================ */
const WHATSAPP_NUMERO = "5543996820296";
const CHAVE_RASCUNHO = "jfv_aplicacao_rascunho_v1";
const TOTAL_ETAPAS = 5;

type FormState = {
  nome: string;
  negocio: string;
  momento: string;
  meta: string;
  desafio: string;
  estrutura: string[];
  tempo: string;
  investimento: string;
  prazo: string;
  email: string;
  whatsapp: string;
  consentimento: boolean;
};

const ESTADO_INICIAL: FormState = {
  nome: "",
  negocio: "",
  momento: "",
  meta: "",
  desafio: "",
  estrutura: [],
  tempo: "",
  investimento: "",
  prazo: "",
  email: "",
  whatsapp: "",
  consentimento: false,
};

/* ============================================================
   Ícones
   ============================================================ */
const ICONES = {
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
    </>
  ),
  seed: (
    <>
      <path d="M12 21v-6" />
      <path d="M12 15c0-4 3-7 7-7 0 4-3 7-7 7z" />
      <path d="M12 17c0-3-2.5-5.5-5.5-5.5 0 3 2.5 5.5 5.5 5.5z" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3c3.5 1.5 5.5 5 5.5 9l-2 2h-7l-2-2C6.5 8 8.5 4.5 12 3z" />
      <circle cx="12" cy="9" r="1.6" />
      <path d="M9 14l-2 4 4-1.5" />
      <path d="M15 14l2 4-4-1.5" />
    </>
  ),
  wave: (
    <>
      <path d="M3 16c2.5 0 3-7 5.5-7S11 18 13.5 18 16 8 18.5 8 20 13 21 13" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20v-6" />
      <path d="M10 20V8" />
      <path d="M16 20v-9" />
      <path d="M2.5 20h19" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6.1" />
      <path d="M17.5 13.6A5.5 5.5 0 0 1 21 19" />
    </>
  ),
  tag: (
    <>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1.4" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </>
  ),
  repeat: (
    <>
      <path d="M17 3l3 3-3 3" />
      <path d="M20 6H8a4 4 0 0 0-4 4" />
      <path d="M7 21l-3-3 3-3" />
      <path d="M4 18h12a4 4 0 0 0 4-4" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5z" />
      <path d="M4 7.5V6a2 2 0 0 1 2-2h11" />
      <path d="M15 11.5h4v4h-4a2 2 0 0 1 0-4z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M8 14h3" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  phone: (
    <>
      <path d="M21.5 16.9v2.6a1.7 1.7 0 0 1-1.9 1.7 17 17 0 0 1-7.4-2.6 16.7 16.7 0 0 1-5.1-5.1A17 17 0 0 1 4.5 6a1.7 1.7 0 0 1 1.7-1.9h2.6a1.7 1.7 0 0 1 1.7 1.5c.1.9.3 1.7.6 2.5a1.7 1.7 0 0 1-.4 1.8l-1.1 1.1a13.7 13.7 0 0 0 5.1 5.1l1.1-1.1a1.7 1.7 0 0 1 1.8-.4c.8.3 1.6.5 2.5.6a1.7 1.7 0 0 1 1.4 1.8z" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </>
  ),
  send: (
    <>
      <path d="m4.5 12 15-7-4.5 15-3.2-5.8z" />
      <path d="m11.8 14.2 7.7-9.2" />
    </>
  ),
  check: (
    <>
      <path d="m5 12.5 4.2 4.2L19 7" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5" />
      <path d="M12 16h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </>
  ),
} as const;

type IconeNome = keyof typeof ICONES;

function Icone({ nome, tamanho = 22 }: { nome: IconeNome; tamanho?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONES[nome]}
    </svg>
  );
}

/* ============================================================
   Conteúdo das perguntas
   ============================================================ */
type Opcao = { valor: string; titulo: string; detalhe?: string; icone: IconeNome };

const MOMENTOS: Opcao[] = [
  {
    valor: "Ainda não comecei",
    titulo: "Ainda não comecei",
    detalhe: "Tenho a ideia, mas nada estruturado",
    icone: "seed",
  },
  {
    valor: "Estou começando",
    titulo: "Estou começando",
    detalhe: "Já fiz as primeiras vendas",
    icone: "rocket",
  },
  {
    valor: "Vendo de forma irregular",
    titulo: "Vendo de forma irregular",
    detalhe: "Tem mês bom, tem mês ruim",
    icone: "wave",
  },
  {
    valor: "Já vendo todo mês",
    titulo: "Já vendo todo mês",
    detalhe: "Quero chegar aos R$ 10 mil",
    icone: "chart",
  },
];

const METAS: Opcao[] = [
  { valor: "Até R$ 3 mil por mês", titulo: "Até R$ 3 mil por mês", icone: "target" },
  { valor: "De R$ 3 mil a R$ 5 mil por mês", titulo: "De R$ 3 mil a R$ 5 mil por mês", icone: "target" },
  { valor: "De R$ 5 mil a R$ 10 mil por mês", titulo: "De R$ 5 mil a R$ 10 mil por mês", icone: "target" },
  { valor: "Acima de R$ 10 mil por mês", titulo: "Acima de R$ 10 mil por mês", icone: "chart" },
  { valor: "Ainda não defini", titulo: "Ainda não defini", icone: "compass" },
];

const DESAFIOS: Opcao[] = [
  {
    valor: "Não sei o que vender",
    titulo: "Não sei o que vender",
    detalhe: "Posicionamento e oferta",
    icone: "compass",
  },
  {
    valor: "Falta de clientes",
    titulo: "Falta de clientes",
    detalhe: "Prospecção e demanda",
    icone: "users",
  },
  {
    valor: "Preço e negociação",
    titulo: "Preço e negociação",
    detalhe: "Vendo, mas não sobra",
    icone: "tag",
  },
  {
    valor: "Processo e organização",
    titulo: "Processo e organização",
    detalhe: "Tudo depende de mim",
    icone: "gear",
  },
  {
    valor: "Constância",
    titulo: "Constância",
    detalhe: "Começo e paro",
    icone: "repeat",
  },
  {
    valor: "Outro",
    titulo: "Outro",
    detalhe: "Quero explicar na conversa",
    icone: "spark",
  },
];

const ESTRUTURAS: Opcao[] = [
  { valor: "Produto ou serviço definido", titulo: "Produto ou serviço definido", icone: "tag" },
  { valor: "Perfil ou página profissional", titulo: "Perfil ou página profissional", icone: "spark" },
  { valor: "Clientes recorrentes", titulo: "Clientes recorrentes", icone: "users" },
  { valor: "Processo de vendas organizado", titulo: "Processo de vendas organizado", icone: "gear" },
  { valor: "Nenhum desses ainda", titulo: "Nenhum desses ainda", icone: "seed" },
];

const TEMPOS: Opcao[] = [
  { valor: "Até 1 hora por dia", titulo: "Até 1 hora por dia", icone: "clock" },
  { valor: "De 1 a 3 horas por dia", titulo: "De 1 a 3 horas por dia", icone: "clock" },
  { valor: "De 3 a 6 horas por dia", titulo: "De 3 a 6 horas por dia", icone: "clock" },
  { valor: "Período integral", titulo: "Período integral", icone: "clock" },
];

const INVESTIMENTOS: Opcao[] = [
  { valor: "Até R$ 500", titulo: "Até R$ 500", icone: "wallet" },
  { valor: "De R$ 500 a R$ 1.500", titulo: "De R$ 500 a R$ 1.500", icone: "wallet" },
  { valor: "De R$ 1.500 a R$ 3.000", titulo: "De R$ 1.500 a R$ 3.000", icone: "wallet" },
  { valor: "Acima de R$ 3.000", titulo: "Acima de R$ 3.000", icone: "wallet" },
  {
    valor: "Quero entender melhor antes",
    titulo: "Quero entender melhor antes",
    detalhe: "Prefiro falar de valores na conversa",
    icone: "compass",
  },
];

const PRAZOS: Opcao[] = [
  { valor: "Imediatamente", titulo: "Imediatamente", icone: "rocket" },
  { valor: "Em até 15 dias", titulo: "Em até 15 dias", icone: "calendar" },
  { valor: "Em até 30 dias", titulo: "Em até 30 dias", icone: "calendar" },
  { valor: "De 1 a 3 meses", titulo: "De 1 a 3 meses", icone: "calendar" },
  { valor: "Só estou pesquisando", titulo: "Só estou pesquisando", icone: "compass" },
];

/* Etapas do formulário (as telas são agrupadas em 5 etapas) */
const TELAS = [
  { etapa: 1, tema: "Quem é você" },
  { etapa: 2, tema: "Momento e meta" },
  { etapa: 2, tema: "Momento e meta" },
  { etapa: 3, tema: "Desafio e rotina" },
  { etapa: 3, tema: "Desafio e rotina" },
  { etapa: 3, tema: "Desafio e rotina" },
  { etapa: 4, tema: "Investimento e prazo" },
  { etapa: 4, tema: "Investimento e prazo" },
  { etapa: 5, tema: "Como falar com você" },
];

/* ============================================================
   Utilitários
   ============================================================ */
function formatarTelefone(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function capturarOrigem() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get("utm_source") || "",
    utm_medium: p.get("utm_medium") || "",
    utm_campaign: p.get("utm_campaign") || "",
    utm_term: p.get("utm_term") || "",
    utm_content: p.get("utm_content") || "",
    referrer: document.referrer || "",
    pagina: window.location.href,
  };
}

/* ============================================================
   Subcomponentes
   ============================================================ */
function MensagemErro({ children }: { children: ReactNode }) {
  return (
    <p className="aplic-error" role="alert">
      <Icone nome="alert" tamanho={15} />
      <span>{children}</span>
    </p>
  );
}

function CartaoOpcao({
  opcao,
  tipo,
  nome,
  marcado,
  multiplo,
  onSelect,
}: {
  opcao: Opcao;
  tipo: "radio" | "checkbox";
  nome: string;
  marcado: boolean;
  multiplo?: boolean;
  onSelect: () => void;
}) {
  return (
    <label className={`aplic-option${marcado ? " is-selected" : ""}`}>
      <input
        type={tipo}
        name={nome}
        value={opcao.valor}
        checked={marcado}
        onChange={onSelect}
      />
      <span className="aplic-option-icon">
        <Icone nome={opcao.icone} tamanho={21} />
      </span>
      <span className="aplic-option-text">
        <span className="aplic-option-title">{opcao.titulo}</span>
        {opcao.detalhe && <span className="aplic-option-detail">{opcao.detalhe}</span>}
      </span>
      <span className={`aplic-mark${multiplo ? " is-multi" : ""}`}>
        <Icone nome="check" tamanho={13} />
      </span>
    </label>
  );
}

/* ============================================================
   Componente principal
   ============================================================ */
export function AplicacaoForm() {
  const [iniciado, setIniciado] = useState(false);
  const [tela, setTela] = useState(0);
  const [direcao, setDirecao] = useState<"next" | "prev">("next");
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"form" | "enviando" | "concluido">("form");
  const [armazenado, setArmazenado] = useState(true);
  const [rascunhoCarregado, setRascunhoCarregado] = useState(false);
  const [alturaPalco, setAlturaPalco] = useState<number | undefined>(undefined);

  const telaRef = useRef<HTMLDivElement>(null);

  const meta = TELAS[tela];
  const ehUltima = tela === TELAS.length - 1;

  /* --- rascunho --- */
  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_RASCUNHO);
      if (salvo) {
        const dados = JSON.parse(salvo) as Partial<FormState>;
        setForm({ ...ESTADO_INICIAL, ...dados });
      }
    } catch {
      /* rascunho inválido: ignora */
    }
    setRascunhoCarregado(true);
  }, []);

  useEffect(() => {
    if (!rascunhoCarregado) return;
    try {
      localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(form));
    } catch {
      /* armazenamento indisponível: segue sem rascunho */
    }
  }, [form, rascunhoCarregado]);

  /* --- trava o scroll enquanto a capa está aberta --- */
  useEffect(() => {
    document.body.classList.toggle("aplic-capa-aberta", !iniciado);
    return () => document.body.classList.remove("aplic-capa-aberta");
  }, [iniciado]);

  /* --- altura do palco (transição suave entre telas) --- */
  useEffect(() => {
    const el = telaRef.current;
    if (!el) return;
    const medir = () => setAlturaPalco(el.getBoundingClientRect().height);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [tela, erros]);

  /* --- progresso --- */
  const progresso = useMemo(() => {
    const daEtapa = TELAS.filter((t) => t.etapa === meta.etapa);
    const posicao = TELAS.slice(0, tela + 1).filter((t) => t.etapa === meta.etapa).length;
    return Math.round(((meta.etapa - 1 + posicao / daEtapa.length) / TOTAL_ETAPAS) * 100);
  }, [meta.etapa, tela]);

  /* --- fundo que clareia conforme avança --- */
  const fundo = useMemo(() => {
    const inicio = [20, 16, 12];
    const fim = [40, 30, 21];
    const t = TELAS.length > 1 ? tela / (TELAS.length - 1) : 0;
    const cor = inicio.map((v, i) => Math.round(v + (fim[i] - v) * t));
    return `rgb(${cor.join(", ")})`;
  }, [tela]);

  /* --- atualizar campo --- */
  function atualizar<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => {
      if (!(campo in atual)) return atual;
      const proximo = { ...atual };
      delete proximo[campo as string];
      return proximo;
    });
  }

  function alternarEstrutura(valor: string) {
    setForm((atual) => {
      if (valor === "Nenhum desses ainda") {
        return {
          ...atual,
          estrutura: atual.estrutura.includes(valor) ? [] : [valor],
        };
      }
      const semNenhum = atual.estrutura.filter((v) => v !== "Nenhum desses ainda");
      return {
        ...atual,
        estrutura: semNenhum.includes(valor)
          ? semNenhum.filter((v) => v !== valor)
          : [...semNenhum, valor],
      };
    });
    setErros((atual) => {
      if (!("estrutura" in atual)) return atual;
      const proximo = { ...atual };
      delete proximo.estrutura;
      return proximo;
    });
  }

  /* --- validação por tela --- */
  function validar(indice: number) {
    const e: Record<string, string> = {};
    switch (indice) {
      case 0:
        if (form.nome.trim().length < 2) e.nome = "Digite seu nome completo.";
        if (form.negocio.trim().length < 2) e.negocio = "Conte seu negócio ou área de atuação.";
        break;
      case 1:
        if (!form.momento) e.momento = "Escolha o momento que mais se parece com o seu.";
        break;
      case 2:
        if (!form.meta) e.meta = "Escolha uma meta para os próximos meses.";
        break;
      case 3:
        if (!form.desafio) e.desafio = "Escolha o que mais te impede de crescer hoje.";
        break;
      case 4:
        if (form.estrutura.length === 0) e.estrutura = "Marque pelo menos uma opção.";
        break;
      case 5:
        if (!form.tempo) e.tempo = "Escolha quanto tempo você consegue dedicar.";
        break;
      case 6:
        if (!form.investimento) e.investimento = "Escolha uma faixa para direcionar a conversa.";
        break;
      case 7:
        if (!form.prazo) e.prazo = "Escolha quando você pretende começar.";
        break;
      case 8:
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
          e.email = "Digite um e-mail válido.";
        }
        if (form.whatsapp.replace(/\D/g, "").length < 10) {
          e.whatsapp = "Digite o WhatsApp com DDD.";
        }
        if (!form.consentimento) {
          e.consentimento = "Precisamos do seu consentimento para continuar.";
        }
        break;
    }
    setErros(e);
    return Object.keys(e).length === 0;
  }

  /* --- navegação --- */
  function irPara(proximo: number) {
    if (proximo < 0 || proximo >= TELAS.length) return;
    setDirecao(proximo > tela ? "next" : "prev");
    setTela(proximo);
    setErros({});
  }

  function avancar() {
    if (!validar(tela)) return;
    irPara(tela + 1);
  }

  function voltar() {
    irPara(tela - 1);
  }

  /* --- envio --- */
  async function enviar() {
    if (!validar(tela)) return;
    setStatus("enviando");

    const payload = {
      nome: form.nome.trim(),
      negocio: form.negocio.trim(),
      momento: form.momento,
      meta_faturamento: form.meta,
      desafio: form.desafio,
      estrutura: form.estrutura,
      tempo_disponivel: form.tempo,
      faixa_investimento: form.investimento,
      prazo: form.prazo,
      email: form.email.trim(),
      whatsapp: form.whatsapp.replace(/\D/g, ""),
      consentimento: form.consentimento,
      origem: capturarOrigem(),
      recebido_em: new Date().toISOString(),
    };

    try {
      const [resposta] = await Promise.all([
        fetch("/api/aplicacao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        new Promise((r) => setTimeout(r, 1400)),
      ]);

      if (!resposta.ok) throw new Error("Falha no envio");

      const resultado = (await resposta.json().catch(() => ({}))) as { stored?: boolean };
      setArmazenado(resultado.stored !== false);

      try {
        localStorage.removeItem(CHAVE_RASCUNHO);
      } catch {
        /* ignora */
      }
      setStatus("concluido");
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {
      setStatus("form");
      setErros({
        envio: "Não conseguimos registrar sua aplicação agora. Tente novamente ou fale direto no WhatsApp.",
      });
    }
  }

  function mensagemWhatsApp() {
    const linhas = [
      "Olá, Priscila! Acabei de preencher a aplicação para a mentoria Do Zero aos 10k.",
      "",
      `Nome: ${form.nome}`,
      `Negócio: ${form.negocio}`,
      `Momento: ${form.momento}`,
      `Meta: ${form.meta}`,
      `Desafio: ${form.desafio}`,
      `Já tenho: ${form.estrutura.join(", ") || "-"}`,
      `Tempo por dia: ${form.tempo}`,
      `Investimento: ${form.investimento}`,
      `Prazo: ${form.prazo}`,
    ];
    return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(linhas.join("\n"))}`;
  }

  /* --- conteúdo de cada tela --- */
  function renderizarTela() {
    switch (tela) {
      case 0:
        return (
          <>
            <span className="aplic-tag">Etapa 1 · Quem é você</span>
            <h2 className="aplic-question">Vamos começar pelo essencial</h2>
            <p className="aplic-sub">
              Precisamos só do básico para saber com quem estamos falando.
            </p>

            <div className={`aplic-field${erros.nome ? " is-invalid" : ""}`}>
              <label htmlFor="aplic-nome">
                Nome completo <span aria-hidden>*</span>
              </label>
              <input
                id="aplic-nome"
                type="text"
                value={form.nome}
                onChange={(e) => atualizar("nome", e.target.value)}
                placeholder="Ex.: Maria Aparecida Silva"
                autoComplete="name"
                aria-invalid={Boolean(erros.nome)}
              />
              {erros.nome && <MensagemErro>{erros.nome}</MensagemErro>}
            </div>

            <div className={`aplic-field${erros.negocio ? " is-invalid" : ""}`}>
              <label htmlFor="aplic-negocio">
                Seu negócio ou área de atuação <span aria-hidden>*</span>
              </label>
              <input
                id="aplic-negocio"
                type="text"
                value={form.negocio}
                onChange={(e) => atualizar("negocio", e.target.value)}
                placeholder="Ex.: estética, consultoria, loja de roupas..."
                autoComplete="organization"
                aria-invalid={Boolean(erros.negocio)}
              />
              {erros.negocio && <MensagemErro>{erros.negocio}</MensagemErro>}
            </div>

            {Acoes()}
          </>
        );

      case 1:
        return (
          <>
            <span className="aplic-tag">Etapa 2 · Momento e meta</span>
            <fieldset className="aplic-fieldset">
              <legend className="aplic-question">Qual é o seu momento hoje?</legend>
              <p className="aplic-sub">
                Escolha a opção que mais se parece com a sua realidade.
              </p>
              <div className="aplic-options">
                {MOMENTOS.map((opcao) => (
                  <CartaoOpcao
                    key={opcao.valor}
                    opcao={opcao}
                    tipo="radio"
                    nome="momento"
                    marcado={form.momento === opcao.valor}
                    onSelect={() => atualizar("momento", opcao.valor)}
                  />
                ))}
              </div>
              {erros.momento && <MensagemErro>{erros.momento}</MensagemErro>}
            </fieldset>
            {Acoes()}
          </>
        );

      case 2:
        return (
          <>
            <span className="aplic-tag">Etapa 2 · Momento e meta</span>
            <fieldset className="aplic-fieldset">
              <legend className="aplic-question">
                Qual é a sua meta de faturamento para os próximos 6 meses?
              </legend>
              <p className="aplic-sub">
                Pode ser uma meta ousada. É ela que vai guiar o nosso plano.
              </p>
              <div className="aplic-options aplic-options--duas">
                {METAS.map((opcao) => (
                  <CartaoOpcao
                    key={opcao.valor}
                    opcao={opcao}
                    tipo="radio"
                    nome="meta"
                    marcado={form.meta === opcao.valor}
                    onSelect={() => atualizar("meta", opcao.valor)}
                  />
                ))}
              </div>
              {erros.meta && <MensagemErro>{erros.meta}</MensagemErro>}
            </fieldset>
            {Acoes()}
          </>
        );

      case 3:
        return (
          <>
            <span className="aplic-tag">Etapa 3 · Desafio e rotina</span>
            <fieldset className="aplic-fieldset">
              <legend className="aplic-question">O que mais te impede de crescer hoje?</legend>
              <p className="aplic-sub">
                Seja honesta(o). É por aqui que a mentoria começa a fazer diferença.
              </p>
              <div className="aplic-options aplic-options--duas">
                {DESAFIOS.map((opcao) => (
                  <CartaoOpcao
                    key={opcao.valor}
                    opcao={opcao}
                    tipo="radio"
                    nome="desafio"
                    marcado={form.desafio === opcao.valor}
                    onSelect={() => atualizar("desafio", opcao.valor)}
                  />
                ))}
              </div>
              {erros.desafio && <MensagemErro>{erros.desafio}</MensagemErro>}
            </fieldset>
            {Acoes()}
          </>
        );

      case 4:
        return (
          <>
            <span className="aplic-tag">Etapa 3 · Desafio e rotina</span>
            <fieldset className="aplic-fieldset">
              <legend className="aplic-question">O que você já tem pronto hoje?</legend>
              <p className="aplic-sub">Pode marcar mais de uma opção.</p>
              <div className="aplic-options aplic-options--duas">
                {ESTRUTURAS.map((opcao) => (
                  <CartaoOpcao
                    key={opcao.valor}
                    opcao={opcao}
                    tipo="checkbox"
                    nome="estrutura"
                    marcado={form.estrutura.includes(opcao.valor)}
                    multiplo
                    onSelect={() => alternarEstrutura(opcao.valor)}
                  />
                ))}
              </div>
              {erros.estrutura && <MensagemErro>{erros.estrutura}</MensagemErro>}
            </fieldset>
            {Acoes()}
          </>
        );

      case 5:
        return (
          <>
            <span className="aplic-tag">Etapa 3 · Desafio e rotina</span>
            <fieldset className="aplic-fieldset">
              <legend className="aplic-question">
                Quanto tempo por dia você consegue dedicar ao negócio?
              </legend>
              <p className="aplic-sub">
                A mentoria se adapta à sua rotina, mas exige constância.
              </p>
              <div className="aplic-options aplic-options--duas">
                {TEMPOS.map((opcao) => (
                  <CartaoOpcao
                    key={opcao.valor}
                    opcao={opcao}
                    tipo="radio"
                    nome="tempo"
                    marcado={form.tempo === opcao.valor}
                    onSelect={() => atualizar("tempo", opcao.valor)}
                  />
                ))}
              </div>
              {erros.tempo && <MensagemErro>{erros.tempo}</MensagemErro>}
            </fieldset>
            {Acoes()}
          </>
        );

      case 6:
        return (
          <>
            <span className="aplic-tag">Etapa 4 · Investimento e prazo</span>
            <fieldset className="aplic-fieldset">
              <legend className="aplic-question">
                Qual faixa de investimento faz sentido para você agora?
              </legend>
              <p className="aplic-sub">
                Sem compromisso. Isso só ajuda a montar uma proposta realista.
              </p>
              <div className="aplic-options">
                {INVESTIMENTOS.map((opcao) => (
                  <CartaoOpcao
                    key={opcao.valor}
                    opcao={opcao}
                    tipo="radio"
                    nome="investimento"
                    marcado={form.investimento === opcao.valor}
                    onSelect={() => atualizar("investimento", opcao.valor)}
                  />
                ))}
              </div>
              {erros.investimento && <MensagemErro>{erros.investimento}</MensagemErro>}
            </fieldset>
            {Acoes()}
          </>
        );

      case 7:
        return (
          <>
            <span className="aplic-tag">Etapa 4 · Investimento e prazo</span>
            <fieldset className="aplic-fieldset">
              <legend className="aplic-question">Quando você quer começar?</legend>
              <p className="aplic-sub">
                As vagas da mentoria são limitadas por trimestre.
              </p>
              <div className="aplic-options aplic-options--duas">
                {PRAZOS.map((opcao) => (
                  <CartaoOpcao
                    key={opcao.valor}
                    opcao={opcao}
                    tipo="radio"
                    nome="prazo"
                    marcado={form.prazo === opcao.valor}
                    onSelect={() => atualizar("prazo", opcao.valor)}
                  />
                ))}
              </div>
              {erros.prazo && <MensagemErro>{erros.prazo}</MensagemErro>}
            </fieldset>
            {Acoes()}
          </>
        );

      default:
        return (
          <>
            <span className="aplic-tag">Etapa 5 · Contato</span>
            <h2 className="aplic-question">Como podemos falar com você?</h2>
            <p className="aplic-sub">
              Nossa equipe responde em horário comercial, de segunda a sexta.
            </p>

            <div className={`aplic-field${erros.email ? " is-invalid" : ""}`}>
              <label htmlFor="aplic-email">
                E-mail <span aria-hidden>*</span>
              </label>
              <input
                id="aplic-email"
                type="email"
                value={form.email}
                onChange={(e) => atualizar("email", e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                inputMode="email"
                aria-invalid={Boolean(erros.email)}
              />
              {erros.email && <MensagemErro>{erros.email}</MensagemErro>}
            </div>

            <div className={`aplic-field${erros.whatsapp ? " is-invalid" : ""}`}>
              <label htmlFor="aplic-whatsapp">
                WhatsApp com DDD <span aria-hidden>*</span>
              </label>
              <input
                id="aplic-whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={(e) => atualizar("whatsapp", formatarTelefone(e.target.value))}
                placeholder="(43) 99999-9999"
                autoComplete="tel-national"
                inputMode="tel"
                maxLength={16}
                aria-invalid={Boolean(erros.whatsapp)}
              />
              {erros.whatsapp && <MensagemErro>{erros.whatsapp}</MensagemErro>}
            </div>

            <label
              className={`aplic-consent${erros.consentimento ? " is-invalid" : ""}`}
            >
              <input
                type="checkbox"
                checked={form.consentimento}
                onChange={(e) => atualizar("consentimento", e.target.checked)}
              />
              <span>
                Concordo em ser contatada(o) pela equipe da Priscila Sinópolis pelo
                WhatsApp ou e-mail informado.
              </span>
            </label>
            {erros.consentimento && <MensagemErro>{erros.consentimento}</MensagemErro>}

            {erros.envio && (
              <div className="aplic-send-error" role="alert">
                <strong>Não conseguimos enviar agora</strong>
                <p>{erros.envio}</p>
                <a
                  className="aplic-btn aplic-btn--whats"
                  href={mensagemWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Falar no WhatsApp
                </a>
              </div>
            )}

            {Acoes()}
          </>
        );
    }
  }

  function Acoes() {
    return (
      <div className="aplic-actions">
        {tela === 0 ? (
          <a className="aplic-back-link" href="/">
            <Icone nome="arrowLeft" tamanho={18} />
            Voltar para o site
          </a>
        ) : (
          <button type="button" className="aplic-btn aplic-btn--ghost" onClick={voltar}>
            <Icone nome="arrowLeft" tamanho={18} />
            Voltar
          </button>
        )}

        {ehUltima ? (
          <button
            type="submit"
            className="aplic-btn aplic-btn--primary"
            disabled={status === "enviando"}
          >
            Enviar aplicação
            <Icone nome="send" tamanho={18} />
          </button>
        ) : (
          <button type="button" className="aplic-btn aplic-btn--primary" onClick={avancar}>
            Continuar
            <Icone nome="arrowRight" tamanho={18} />
          </button>
        )}
      </div>
    );
  }

  /* --- tela de agradecimento --- */
  if (status === "concluido") {
    const primeiroNome = form.nome.trim().split(/\s+/)[0] || "";
    const resumo = [
      ["Nome", form.nome],
      ["Negócio", form.negocio],
      ["Momento", form.momento],
      ["Meta", form.meta],
      ["Desafio", form.desafio],
      ["Já tenho", form.estrutura.join(", ")],
      ["Tempo por dia", form.tempo],
      ["Investimento", form.investimento],
      ["Prazo", form.prazo],
    ].filter(([, valor]) => valor);

    return (
      <div className="aplic aplic--done">
        <div className="aplic-done-wrap">
          <div className="aplic-done-card">
            <span className="aplic-brand aplic-brand--done">
              <span className="aplic-brand-name">Priscila Sinópolis</span>
              <span className="aplic-brand-method">Método JFV</span>
            </span>

            <div className="aplic-done-check">
              <Icone nome="check" tamanho={30} />
            </div>

            <h1 className="aplic-done-title">
              Aplicação enviada{primeiroNome ? `, ${primeiroNome}` : ""}!
            </h1>
            <p className="aplic-done-text">
              {armazenado
                ? "Recebi suas respostas. Vou analisar seu momento com calma e, se a mentoria fizer sentido para você, te chamo no WhatsApp para uma conversa."
                : "Suas respostas estão prontas. Para garantir que cheguem até a Priscila, envie o resumo pelo WhatsApp — é rápido e já adianta a conversa."}
            </p>

            <div className="aplic-summary">
              <h2>Resumo da sua aplicação</h2>
              <dl>
                {resumo.map(([rotulo, valor]) => (
                  <div key={rotulo} className="aplic-summary-item">
                    <dt>{rotulo}</dt>
                    <dd>{valor}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="aplic-done-actions">
              <a
                className="aplic-btn aplic-btn--whats"
                href={mensagemWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icone nome="phone" tamanho={19} />
                {armazenado
                  ? "Adiantar a conversa no WhatsApp"
                  : "Enviar minhas respostas no WhatsApp"}
              </a>
              <a className="aplic-btn aplic-btn--ghost" href="/">
                Voltar para o site
              </a>
            </div>

            <p className="aplic-done-note">
              Quanto mais detalhes você compartilhar, mais precisa fica a análise.
              Nada do que você respondeu será compartilhado fora da equipe.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* --- formulário --- */
  return (
    <div className="aplic" style={{ background: fundo }}>
      {/* Capa */}
      <section className={`aplic-cover${iniciado ? " is-gone" : ""}`} aria-label="Apresentação">
        <div className="aplic-cover-inner">
          <div className="aplic-cover-text">
            <span className="aplic-brand">
              <span className="aplic-brand-name">Priscila Sinópolis</span>
              <span className="aplic-brand-method">Método JFV</span>
            </span>

            <p className="aplic-cover-eyebrow">
              Mentoria individual · Do Zero aos 10k
            </p>
            <h1 className="aplic-cover-title">
              Seu negócio não precisa começar grande. Precisa começar{" "}
              <em>certo</em>.
            </h1>
            <p className="aplic-cover-sub">
              Em cinco etapas, quero entender o seu momento, o seu maior desafio e
              onde você quer chegar. A partir disso, vejo se a mentoria é o caminho
              certo — e te retorno pelo WhatsApp.
            </p>

            <div className="aplic-cover-actions">
              <button
                type="button"
                className="aplic-cover-btn"
                onClick={() => setIniciado(true)}
              >
                Começar minha aplicação
                <Icone nome="arrowRight" tamanho={20} />
              </button>
              <p className="aplic-cover-note">
                Leva cerca de 1 minuto. Sem compromisso — o retorno é pelo WhatsApp.
              </p>
            </div>

            <ul className="aplic-cover-facts">
              <li>
                <Icone nome="check" tamanho={16} />
                <span>
                  <b>+7 anos</b> em vendas
                </span>
              </li>
              <li>
                <Icone nome="check" tamanho={16} />
                <span>
                  <b>+500</b> clientes atendidos
                </span>
              </li>
              <li>
                <Icone nome="check" tamanho={16} />
                <span>
                  Método <b>JFV</b> próprio
                </span>
              </li>
            </ul>
          </div>

          <figure className="aplic-cover-photo">
            <img
              src="/priscila/aplicacao-retrato.jpg"
              alt="Priscila Sinópolis, criadora do Método JFV"
              width={675}
              height={1200}
            />
            <figcaption>
              Priscila Sinópolis · criadora do Método JFV
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Formulário */}
      <main className="aplic-main">
        <header className="aplic-header">
          <span className="aplic-brand aplic-brand--compact">
            <span className="aplic-brand-name">Priscila Sinópolis</span>
            <span className="aplic-brand-method">Método JFV</span>
          </span>

          <div className="aplic-progress">
            <div className="aplic-progress-top">
              <span className="aplic-progress-step">
                Etapa {meta.etapa} de {TOTAL_ETAPAS}
              </span>
              <span className="aplic-progress-theme">{meta.tema}</span>
            </div>
            <div
              className="aplic-progress-track"
              role="progressbar"
              aria-label="Progresso da aplicação"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progresso}
            >
              <span style={{ width: `${progresso}%` }} />
            </div>
          </div>
        </header>

        <div className="aplic-stage-wrap">
          <div className="aplic-card">
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (ehUltima) enviar();
                else avancar();
              }}
            >
              <div className="aplic-stage" style={{ height: alturaPalco }}>
                <div
                  key={tela}
                  ref={telaRef}
                  className={`aplic-screen aplic-screen--${direcao}`}
                  tabIndex={-1}
                >
                  {renderizarTela()}
                </div>
              </div>
            </form>
          </div>
        </div>

        <footer className="aplic-footer">
          <span>Priscila Sinópolis</span>
          <i aria-hidden />
          <span>Método JFV</span>
          <i aria-hidden />
          <span>Do Zero aos 10k</span>
        </footer>
      </main>

      {/* Overlay de envio */}
      {status === "enviando" && (
        <div className="aplic-overlay" role="status" aria-live="assertive">
          <div className="aplic-overlay-ring" aria-hidden />
          <p>Analisando sua aplicação...</p>
          <div className="aplic-overlay-line" aria-hidden>
            <span />
          </div>
        </div>
      )}
    </div>
  );
}
