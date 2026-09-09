import { supabaseAdmin } from "@/lib/supabase";

/* ============================================================
   Conteúdo dinâmico da landing pública.
   Cada seção é armazenada como JSON no Supabase (landing_content)
   e editável em /admin/conteudo. Tudo aqui tem default embutido
   (cópia + fotos da referência) — a home funciona mesmo sem salvar nada.
   ============================================================ */

export type NavLink = { label: string; href: string };
export type CTA = { label: string; href: string };

export type NavContent = {
  brand: string;
  links: NavLink[];
  cta: CTA;
};

export type HeroContent = {
  eyebrow: string;
  headline: string[];          // linhas da headline principal
  headlineEm: string[];        // linhas destacadas (mesma cadência)
  sub: string;
  primaryCta: CTA;
  secondaryCta: CTA;
  photoUrl: string;
  proof: string[];             // provas curtas exibidas no hero (sem repetir seção)
};

export type PositioningContent = {
  eyebrow: string;
  title: string[];             // linhas do título grande
  titleEm: string[];           // parte em destaque
  paragraphs: string[];
  chips: string[];             // micro-indicadores visuais (etapas do método)
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

export type ConceptualContent = {
  eyebrow: string;
  title: string;
  titleEm: string;
  sub: string;
  words: string[];             // palavras para a faixa marquee
  closing: string;
};

export type ProductFilter = {
  id: string;
  label: string;
};

export type ProductCard = {
  id: string;
  category: string;            // precisa bater com um filter.id
  categoryLabel: string;
  title: string;
  desc: string;
  idealFor: string;
  price?: string;
  priceSuffix?: string;
  buttonLabel: string;
  href: string;
  featured?: boolean;
};

export type ProdutosContent = {
  eyebrow: string;
  title: string;
  titleEm: string;
  sub: string;
  filters: ProductFilter[];
  cards: ProductCard[];
  catalogNote: string;         // texto exibido ao expandir
  allCta: { label: string; href: string };
};

export type MetodoStep = {
  num: string;                 // "01"
  name: string;
  desc: string;
};
export type MetodoContent = {
  eyebrow: string;
  stickyTitle: string;         // título fixo lateral (desktop)
  stickySub: string;
  title: string;
  sub: string;
  steps: MetodoStep[];
};

export type Depoimento = {
  phrase: string;              // frase principal grande
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

export type CtaContent = {
  eyebrow: string;
  title: string[];
  titleEm: string[];
  sub: string;
  primary: CTA;
  secondary: CTA;
};

export type FooterColumn = { title: string; links: NavLink[] };
export type SocialLink = { label: string; href: string };
export type FooterContent = {
  brand: string;
  method: string;
  tagline: string;
  socials: SocialLink[];
  columns: FooterColumn[];
  legal: string[];
  copyright: string;
};

export type LandingContent = {
  nav: NavContent;
  hero: HeroContent;
  positioning: PositioningContent;
  sobre: SobreContent;
  conceptual: ConceptualContent;
  produtos: ProdutosContent;
  metodo: MetodoContent;
  resultados: ResultadosContent;
  faq: FaqContent;
  cta: CtaContent;
  footer: FooterContent;
};

export const LANDING_SECTIONS = [
  "nav",
  "hero",
  "positioning",
  "sobre",
  "conceptual",
  "produtos",
  "metodo",
  "resultados",
  "faq",
  "cta",
  "footer",
] as const;

export type LandingSectionKey = (typeof LANDING_SECTIONS)[number];

/* ============================================================
   DEFAULTS — refletem o novo tom editorial e a nova hierarquia.
   Não inventamos números/depoimentos: tudo é estrutural.
   Depoimentos marcados com isPlaceholder são aguardando conteúdo real.
   ============================================================ */

export const defaultContent: LandingContent = {
  nav: {
    brand: "Priscila Sinópolis",
    links: [
      { label: "Sobre", href: "#sobre" },
      { label: "Método JFV", href: "#metodo" },
      { label: "Programas", href: "#programas" },
      { label: "Resultados", href: "#resultados" },
    ],
    cta: { label: "Conheça os programas", href: "#programas" },
  },
  hero: {
    eyebrow: "MÉTODO JFV · VENDAS SEM COMPLICAÇÃO",
    headline: ["Vender não precisa", "ser complicado."],
    headlineEm: [],
    sub: "Eu transformei anos de experiência comercial em um método simples para quem precisa vender mais — seja um produto, um serviço ou uma empresa inteira.",
    primaryCta: { label: "Conheça o Método JFV", href: "#metodo" },
    secondaryCta: { label: "Ver programas", href: "#programas" },
    photoUrl: "/priscila/hero.jpg",
    proof: [
      "+7 anos de experiência",
      "+500 clientes atendidos",
      "Atuação nacional e internacional",
      "Método próprio de vendas",
    ],
  },
  positioning: {
    eyebrow: "POSICIONAMENTO",
    title: ["Vendas não são talento.", "São processo."],
    titleEm: ["São processo."],
    paragraphs: [
      "Você não precisa nascer vendedor.",
      "Precisa entender quem abordar, como criar interesse, como apresentar valor, como conduzir a decisão e como continuar vendendo depois do primeiro “não”.",
      "É exatamente isso que o Método JFV organiza.",
    ],
    chips: ["Mentalidade", "Prospecção", "Relacionamento", "Oferta", "Follow-up", "Escala"],
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
  conceptual: {
    eyebrow: "A LÓGICA",
    title: "O produto muda.",
    titleEm: "A lógica da venda não.",
    sub: "De um serviço de R$ 100 a uma negociação de milhares de reais, toda venda passa por pessoas, percepção de valor, confiança e decisão.",
    words: [
      "SERVIÇOS",
      "VAREJO",
      "IMÓVEIS",
      "CONSULTORIA",
      "INFOPRODUTOS",
      "B2B",
      "ALIMENTAÇÃO",
      "TECNOLOGIA",
      "MODA",
    ],
    closing: "Se existe alguém comprando, existe um processo de vendas que pode ser melhorado.",
  },
  produtos: {
    eyebrow: "PROGRAMAS",
    title: "Encontre o próximo passo",
    titleEm: "para o seu momento.",
    sub: "Do primeiro cliente à estruturação de uma operação comercial, existe uma solução JFV para cada estágio.",
    filters: [
      { id: "all", label: "Todos" },
      { id: "comecando", label: "Começando agora" },
      { id: "vendas", label: "Vendas" },
      { id: "prospeccao", label: "Prospecção" },
      { id: "marketing", label: "Marketing" },
      { id: "gestao", label: "Gestão Comercial" },
      { id: "mentorias", label: "Mentorias" },
      { id: "empresas", label: "Empresas" },
      { id: "materiais", label: "Materiais e Ferramentas" },
    ],
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
        buttonLabel: "Conhecer",
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
        buttonLabel: "Conhecer",
        href: "https://forms.gle/rEyppDKmzZypoSd76",
      },
      {
        id: "empresas-aceleracao",
        category: "empresas",
        categoryLabel: "Empresas",
        title: "Aceleração Comercial",
        desc: "Consultoria estratégica para empresas que querem aumentar faturamento e estruturar equipes.",
        idealFor: "Para empresas com operação comercial ativa.",
        buttonLabel: "Conhecer",
        href: "https://forms.gle/sWTZ5FmFDRutLZfH7",
      },
      {
        id: "jfv-vendas",
        category: "vendas",
        categoryLabel: "Programa",
        title: "Vendas com Método",
        desc: "Treinamento estruturado para vendedores que precisam fechar mais e com mais previsibilidade.",
        idealFor: "Para vendedores em atividade.",
        buttonLabel: "Conhecer",
        href: "#programas",
      },
      {
        id: "jfv-prospeccao",
        category: "prospeccao",
        categoryLabel: "Programa",
        title: "Prospecção Sem Segredo",
        desc: "Como encontrar, abordar e qualificar leads todos os dias sem depender de indicação.",
        idealFor: "Para quem precisa gerar demanda própria.",
        buttonLabel: "Conhecer",
        href: "#programas",
      },
      {
        id: "jfv-gestao",
        category: "gestao",
        categoryLabel: "Programa",
        title: "Gestão Comercial",
        desc: "Estruturação de pipeline, métricas e rotina para times comerciais que precisam escalar.",
        idealFor: "Para líderes comerciais.",
        buttonLabel: "Conhecer",
        href: "#programas",
      },
    ],
    catalogNote:
      "Estes são alguns dos programas disponíveis. O catálogo completo reúne soluções para diferentes estágios e segmentos. Fale com a equipe para identificar o melhor próximo passo para o seu momento.",
    allCta: { label: "Ver todos os programas", href: "#programas" },
  },
  metodo: {
    eyebrow: "MÉTODO JFV",
    stickyTitle: "Método JFV",
    stickySub: "Um processo. Seis movimentos. Um sistema de vendas.",
    title: "Um método.",
    sub: "Seis movimentos para construir um processo de vendas completo.",
    steps: [
      {
        num: "01",
        name: "Mentalidade",
        desc: "Venda começa antes da abordagem. Posicionamento, confiança e clareza comercial.",
      },
      {
        num: "02",
        name: "Prospecção",
        desc: "Pare de falar com todo mundo. Encontre quem realmente tem potencial para comprar.",
      },
      {
        num: "03",
        name: "Relacionamento",
        desc: "Venda começa na confiança. Aprenda a criar conexão antes de tentar convencer.",
      },
      {
        num: "04",
        name: "Oferta",
        desc: "Não apresente características. Construa percepção de valor.",
      },
      {
        num: "05",
        name: "Follow-up",
        desc: "A maioria das vendas não acontece na primeira conversa. Aprenda a continuar sem ser inconveniente.",
      },
      {
        num: "06",
        name: "Escala",
        desc: "O que funciona uma vez precisa funcionar novamente. Transforme vendas em processo.",
      },
    ],
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
  cta: {
    eyebrow: "PRÓXIMO PASSO",
    title: ["Você não precisa vender", "do jeito difícil."],
    titleEm: [],
    sub: "Escolha o programa que mais combina com o seu momento e comece a construir um processo comercial mais simples, previsível e consistente.",
    primary: { label: "Encontrar meu programa", href: "#programas" },
    secondary: { label: "Falar com a equipe", href: "https://wa.me/5543996820296" },
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
    columns: [
      {
        title: "Navegação",
        links: [
          { label: "Sobre", href: "#sobre" },
          { label: "Método JFV", href: "#metodo" },
          { label: "Programas", href: "#programas" },
          { label: "Resultados", href: "#resultados" },
          { label: "Contato", href: "https://wa.me/5543996820296" },
        ],
      },
      {
        title: "Programas",
        links: [
          { label: "Assinatura JFV", href: "#programas" },
          { label: "Mentoria Particular", href: "https://forms.gle/rEyppDKmzZypoSd76" },
          { label: "Aceleração Empresarial", href: "https://forms.gle/sWTZ5FmFDRutLZfH7" },
        ],
      },
    ],
    legal: ["Termos de uso", "Política de privacidade"],
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
      hero: mergeSection("hero", map.get("hero")),
      positioning: mergeSection("positioning", map.get("positioning")),
      sobre: mergeSection("sobre", map.get("sobre")),
      conceptual: mergeSection("conceptual", map.get("conceptual")),
      produtos: mergeSection("produtos", map.get("produtos")),
      metodo: mergeSection("metodo", map.get("metodo")),
      resultados: mergeSection("resultados", map.get("resultados")),
      faq: mergeSection("faq", map.get("faq")),
      cta: mergeSection("cta", map.get("cta")),
      footer: mergeSection("footer", map.get("footer")),
    };
  } catch {
    return defaultContent;
  }
}