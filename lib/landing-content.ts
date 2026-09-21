import { supabaseAdmin } from "@/lib/supabase";

/* ============================================================
   Conteúdo dinâmico da landing pública.
   Cada seção é armazenada como JSON no Supabase (landing_content)
   e editável em /admin/conteudo. Tudo aqui tem default embutido
   — a home funciona mesmo sem salvar nada.
   ============================================================ */

export type NavLink = { label: string; href: string };
export type CTA = { label: string; href: string };

export type NavContent = {
  brand: string;
  links: NavLink[];
  cta: CTA;
};

/** Apresentação — abertura da página (substitui o antigo Hero editorial). */
export type ApresentacaoContent = {
  eyebrow: string;            // ex: "MÉTODO JFV"
  name: string;               // "Priscila Sinópolis"
  method: string;             // "Método JFV"
  tagline: string;            // frase curta de venda
  sub: string;                // parágrafo de apoio
  photoUrl: string;           // foto vertical da Priscila
  stats: { value: string; label: string }[];
  primaryCta: CTA;            // "Conheça os programas"
  secondaryCta: CTA;          // social principal
  instagramHandle: string;    // "@priscila_sinopolis"
};

/** Fundo fixo (foto de identidade com overlay escuro). */
export type FundoFotoContent = {
  url: string;
};

export type SobreContent = {
  eyebrow: string;
  title: string;
  highlight: string;
  paragraphs: string[];
  photoMain: string;
  photoSm1: string;
  photoSm2: string;
  stats: { label: string; value: string }[];
  tags: string[];
};

export type ProductCard = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  desc: string;
  idealFor: string;
  price?: string;
  priceSuffix?: string;
  buttonLabel: string;
  href: string;
  featured?: boolean;
  coverUrl?: string;          // NOVO: cover do card (opcional; placeholder se vazio)
};

export type ProdutosContent = {
  eyebrow: string;
  title: string;
  titleEm: string;
  sub: string;
  cards: ProductCard[];
  allCta: CTA;
};

export type Depoimento = {
  phrase: string;
  text: string;
  name: string;
  role: string;
  product: string;
  result: string;
  isPlaceholder?: boolean;
};

export type ResultadosContent = {
  eyebrow: string;
  title: string;
  titleEm: string;
  sub: string;
  testimonials: Depoimento[];
};

export type FaqItem = { q: string; a: string };
export type FaqContent = {
  eyebrow: string;
  title: string;
  items: FaqItem[];
  ctaText: string;
  ctaLabel: string;
  ctaHref: string;
};

/** Encerramento — foto + headline grande + CTA único (substitui o CTA final). */
export type ClosingContent = {
  eyebrow: string;
  headline: string;
  headlineEm: string;
  sub: string;
  primaryCta: CTA;
  secondaryCta?: CTA;
  photoUrl: string;
};

export type SocialLink = { label: string; href: string };
export type FooterContent = {
  brand: string;
  method: string;
  tagline: string;
  socials: SocialLink[];
  copyright: string;
};

export type LandingContent = {
  nav: NavContent;
  apresentacao: ApresentacaoContent;
  fundoFoto: FundoFotoContent;
  produtos: ProdutosContent;
  sobre: SobreContent;
  resultados: ResultadosContent;
  faq: FaqContent;
  closing: ClosingContent;
  footer: FooterContent;
};

export const LANDING_SECTIONS = [
  "nav",
  "apresentacao",
  "fundoFoto",
  "produtos",
  "sobre",
  "resultados",
  "faq",
  "closing",
  "footer",
] as const;

export type LandingSectionKey = (typeof LANDING_SECTIONS)[number];

/* ============================================================
   DEFAULTS — nova estrutura personal-brand (bio-link premium).
   ============================================================ */

export const defaultContent: LandingContent = {
  nav: {
    brand: "Priscila Sinópolis",
    links: [
      { label: "Sobre", href: "#sobre" },
      { label: "Programas", href: "#programas" },
      { label: "Resultados", href: "#resultados" },
    ],
    cta: { label: "Conheça os programas", href: "#programas" },
  },
  apresentacao: {
    eyebrow: "MÉTODO JFV · VENDAS SEM COMPLICAÇÃO",
    name: "Priscila Sinópolis",
    method: "Método JFV",
    tagline: "Vender não precisa ser complicado.",
    sub: "Eu transformei anos de experiência comercial em um método simples para quem precisa vender mais — seja um produto, um serviço ou uma empresa inteira.",
    photoUrl: "/priscila/hero.jpg",
    stats: [
      { value: "+7", label: "anos em vendas" },
      { value: "+500", label: "clientes atendidos" },
      { value: "JFV", label: "método próprio" },
      { value: "BR +", label: "atuação internacional" },
    ],
    primaryCta: { label: "Conheça os programas", href: "#programas" },
    secondaryCta: { label: "Falar no WhatsApp", href: "https://wa.me/5543996820296" },
    instagramHandle: "@priscila_sinopolis",
  },
  fundoFoto: {
    url: "/priscila/hero.jpg",
  },
  produtos: {
    eyebrow: "PROGRAMAS",
    title: "O que eu criei",
    titleEm: "para você vender mais.",
    sub: "Quatro caminhos diferentes para o mesmo objetivo: tirar vendas do improviso e transformar em processo.",
    cards: [
      {
        id: "jfv-assinatura",
        category: "comecando",
        categoryLabel: "Assinatura",
        title: "Jeito Fácil de Vender",
        desc: "Comunidade e conteúdo semanal para quem quer vender todos os dias com método, sem improvisar.",
        idealFor: "Para quem está começando e quer construir base.",
        price: "R$ 19,90",
        priceSuffix: "/mês",
        buttonLabel: "Assinar agora",
        href: "https://pay.kiwify.com.br/3X8I06c",
        featured: true,
      },
      {
        id: "zero-10k",
        category: "mentorias",
        categoryLabel: "Mentoria",
        title: "Do Zero aos 10k",
        desc: "Programa individual para estruturar um negócio do zero e alcançar os primeiros R$ 10 mil por mês.",
        idealFor: "Para quem quer acompanhamento próximo.",
        price: "R$ 10k",
        priceSuffix: "/meta mensal",
        buttonLabel: "Aplicar para a mentoria",
        href: "https://forms.gle/rEyppDKmzZypoSd76",
      },
      {
        id: "mentoria-individual",
        category: "mentorias",
        categoryLabel: "Mentoria Premium",
        title: "Mentoria Individual",
        desc: "Acompanhamento 1:1 com a Priscila para construir uma estratégia comercial sob medida, com plano de ação, revisões e suporte direto.",
        idealFor: "Para quem quer acompanhamento próximo e personalizado.",
        price: "Sob consulta",
        buttonLabel: "Quero aplicar",
        href: "https://forms.gle/rEyppDKmzZypoSd76",
      },
      {
        id: "empresas-aceleracao",
        category: "empresas",
        categoryLabel: "Empresas",
        title: "Aceleração Comercial",
        desc: "Consultoria estratégica para empresas que querem aumentar faturamento e estruturar equipes de vendas.",
        idealFor: "Para empresas com operação comercial ativa.",
        price: "Sob consulta",
        buttonLabel: "Solicitar diagnóstico",
        href: "https://forms.gle/sWTZ5FmFDRutLZfH7",
      },
    ],
    allCta: { label: "Falar com a equipe", href: "https://wa.me/5543996820296" },
  },
  sobre: {
    eyebrow: "QUEM É",
    title: "Eu ensino vendas",
    highlight: "porque vivo vendas.",
    paragraphs: [
      "Priscila Sinópolis é empresária, mentora e estrategista comercial, com mais de 7 anos de experiência construindo estratégias de aquisição, vendas e crescimento para profissionais e empresas.",
      "Ao longo dessa trajetória, transformou a experiência prática em uma metodologia própria: o JFV — Jeito Fácil de Vender.",
      "Um método criado para tirar vendas do campo da improvisação e transformar o comercial em um processo simples, replicável e escalável.",
    ],
    photoMain: "/priscila/sobre-main.jpg",
    photoSm1: "/priscila/sobre-1.jpg",
    photoSm2: "/priscila/sobre-2.jpg",
    stats: [
      { value: "+7", label: "anos em vendas" },
      { value: "+500", label: "clientes atendidos" },
      { value: "JFV", label: "método próprio" },
    ],
    tags: ["Vendas", "Estratégia Comercial", "Gestão", "Mentoria", "Empresas"],
  },
  resultados: {
    eyebrow: "RESULTADOS",
    title: "Resultados que começaram",
    titleEm: "com uma mudança no processo.",
    sub: "Cada caso é uma decisão de aplicar método onde havia improviso.",
    testimonials: [
      {
        phrase: "Eu vendia todo mês, mas não sabia por que.",
        text: "Depois do JFV, passei a entender quem abordar, como conversar e quando insistir. Em três meses, o faturamento dobrou e o trabalho caiu pela metade.",
        name: "[Depoimento real — aguardando autorização]",
        role: "Profissional autônomo",
        product: "Assinatura JFV",
        result: "Faturamento 2x em 90 dias",
        isPlaceholder: true,
      },
      {
        phrase: "A equipe parou de esperar lead quente.",
        text: "Com a prospecção do método, montamos uma rotina que gera demanda todos os dias. O time comercial voltou a ter agenda cheia.",
        name: "[Depoimento real — aguardando autorização]",
        role: "Diretor comercial",
        product: "Aceleração Comercial",
        result: "Rotina de prospecção ativa implantada",
        isPlaceholder: true,
      },
      {
        phrase: "Vender virou processo, não improviso.",
        text: "Hoje tenho script, tenho cadência, tenho números. A equipe sabe o que fazer em cada etapa. Mudou a cultura comercial inteira.",
        name: "[Depoimento real — aguardando autorização]",
        role: "Fundador, empresa B2B",
        product: "Gestão Comercial",
        result: "Conversão +40% em 30 dias",
        isPlaceholder: true,
      },
      {
        phrase: "Eu tinha vergonha de vender.",
        text: "O método me tirou do automático. Hoje eu negocio com clareza e sem me sentir invasiva. Fecho mais e durmo melhor.",
        name: "[Depoimento real — aguardando autorização]",
        role: "Prestadora de serviços",
        product: "Mentoria Particular",
        result: "Agenda cheia em 60 dias",
        isPlaceholder: true,
      },
      {
        phrase: "O follow-up mudou tudo.",
        text: "Eu perdia venda porque desistia no primeiro não. Quando aprendi a conduzir a continuidade, fechamos o que já estava praticamente perdido.",
        name: "[Depoimento real — aguardando autorização]",
        role: "Sócio, agência",
        product: "Vendas com Método",
        result: "Recuperação de leads frios",
        isPlaceholder: true,
      },
      {
        phrase: "O JFV virou a espinha do nosso comercial.",
        text: "Adotamos as seis etapas como rito interno. Treinamos o time, ajustamos a oferta e o resultado apareceu em menos de um trimestre.",
        name: "[Depoimento real — aguardando autorização]",
        role: "CEO, varejo",
        product: "Aceleração Comercial",
        result: "Pipeline estruturado do zero",
        isPlaceholder: true,
      },
    ],
  },
  faq: {
    eyebrow: "DÚVIDAS FREQUENTES",
    title: "Perguntas frequentes",
    items: [
      {
        q: "Preciso ter experiência com vendas?",
        a: "Não. O Método JFV foi desenhado para funcionar do zero ao avançado. Você começa pela mentalidade e segue pelos seis movimentos, independente do seu ponto de partida.",
      },
      {
        q: "O Método JFV funciona para qualquer segmento?",
        a: "Sim. O método ensina o processo de vendas, não um produto específico. Funciona para serviços, varejo, imóveis, infoprodutos, B2B, consultorias e tecnologia — qualquer mercado onde exista alguém decidindo uma compra.",
      },
      {
        q: "Qual programa é melhor para mim?",
        a: "Depende do seu momento. Quem está começando normalmente começa pela assinatura JFV. Quem quer acompanhamento próximo vai para mentoria. Empresas com operação ativa entram na Aceleração Comercial. Fale com a equipe se tiver dúvida.",
      },
      {
        q: "Existe opção para empresas?",
        a: "Sim. O programa de Aceleração Comercial é uma consultoria estruturada para empresas que precisam aumentar faturamento, melhorar processos e formar equipes.",
      },
      {
        q: "Como funciona a assinatura JFV?",
        a: "Você paga R$ 19,90 por mês e tem acesso a aulas, lives com a Priscila, comunidade ativa e conteúdos semanais para aplicar no mesmo dia. Pode cancelar quando quiser.",
      },
      {
        q: "Em quanto tempo consigo aplicar o método?",
        a: "As primeiras mudanças de mentalidade e abordagem aparecem nas primeiras semanas. Resultados consistentes costumam aparecer entre 30 e 90 dias, dependendo do estágio e da dedicação na aplicação.",
      },
    ],
    ctaText: "Ainda não sabe por onde começar?",
    ctaLabel: "Fale com a nossa equipe",
    ctaHref: "https://wa.me/5543996820296",
  },
  closing: {
    eyebrow: "PRÓXIMO PASSO",
    headline: "Vender não precisa",
    headlineEm: "ser complicado.",
    sub: "Escolha o programa que mais combina com o seu momento e comece a construir um processo comercial mais simples, previsível e consistente.",
    primaryCta: { label: "Encontrar meu programa", href: "#programas" },
    secondaryCta: { label: "Falar com a equipe", href: "https://wa.me/5543996820296" },
    photoUrl: "/priscila/sobre-main.jpg",
  },
  footer: {
    brand: "Priscila Sinópolis",
    method: "Método JFV · Jeito Fácil de Vender",
    tagline: "Venda de um jeito mais simples. Cresça de um jeito mais inteligente.",
    socials: [
      { label: "Instagram", href: "https://www.instagram.com/priscila_sinopolis/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/priscila-sin%C3%B3polis/" },
      { label: "WhatsApp", href: "https://wa.me/5543996820296" },
    ],
    copyright: "© 2026 Priscila Sinópolis. Todos os direitos reservados.",
  },
};

/* ---------- Loader ---------- */

function mergeSection<K extends keyof LandingContent>(
  key: K,
  stored: unknown
): LandingContent[K] {
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    return { ...defaultContent[key], ...(stored as Partial<LandingContent[K]>) } as LandingContent[K];
  }
  return defaultContent[key];
}

/**
 * Busca todo o conteúdo da landing do Supabase (server-side, via service role)
 * e mescla com os defaults. Resiliente: em erro/tabela ausente, retorna defaults.
 */
export async function getLandingContent(): Promise<LandingContent> {
  try {
    const { data, error } = await supabaseAdmin
      .from("landing_content")
      .select("section, content");

    if (error || !data) return defaultContent;

    const map = new Map<string, unknown>();
    for (const row of data) {
      if (row?.section) map.set(row.section, row.content);
    }

    return {
      nav: mergeSection("nav", map.get("nav")),
      apresentacao: mergeSection("apresentacao", map.get("apresentacao")),
      fundoFoto: mergeSection("fundoFoto", map.get("fundoFoto")),
      produtos: mergeSection("produtos", map.get("produtos")),
      sobre: mergeSection("sobre", map.get("sobre")),
      resultados: mergeSection("resultados", map.get("resultados")),
      faq: mergeSection("faq", map.get("faq")),
      closing: mergeSection("closing", map.get("closing")),
      footer: mergeSection("footer", map.get("footer")),
    };
  } catch {
    return defaultContent;
  }
}
