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
  logoStart: string;
  logoHighlight: string;
  links: NavLink[];
  cta: CTA;
};

export type HeroContent = {
  eyebrow: string;
  headline: string; // quebras de linha com \n
  headlineEm: string; // frase em gold (anexada ao headline)
  sub: string;
  primaryCta: CTA;
  secondaryCta: CTA;
  photoUrl: string;
  badges: string[];
};

export type StatItem = { num: string; label: string };
export type StatsContent = { items: StatItem[] };

export type SobreContent = {
  eyebrow: string;
  title: string;
  paragraphs: string[]; // suporta **bold**
  tags: string[];
  photoMain: string;
  photoSm1: string;
  photoSm2: string;
};

export type SellCard = { emoji: string; item: string };
export type QualquerUmContent = {
  eyebrow: string;
  title: string;
  titleEm: string;
  sub: string;
  cards: SellCard[];
  cta: string[]; // suporta **bold**
};

export type ProductCard = {
  badge: string;
  badgeClass: "bm" | "ba" | "be";
  title: string;
  price: string;
  priceSuffix: string;
  desc: string;
  benefits: string[];
  button: { label: string; href: string; variant: "navy" | "gold" };
  featured?: boolean;
};
export type ProdutosContent = {
  eyebrow: string;
  title: string;
  sub: string;
  cards: ProductCard[];
};

export type MetodoStep = { emoji: string; step: string; name: string; desc: string };
export type MetodoContent = {
  eyebrow: string;
  title: string;
  sub: string;
  steps: MetodoStep[];
};

export type ResultadosVideo = { label: string; url: string };
export type Depoimento = {
  text: string;
  avatar: string;
  name: string;
  role: string;
  product: string;
};
export type ResultadosContent = {
  eyebrow: string;
  title: string;
  sub: string;
  photos: string[]; // 2 fotos do mosaico
  videos: ResultadosVideo[]; // 3 vídeos do mosaico
  testimonials: Depoimento[];
};

export type FaqItem = { q: string; a: string };
export type FaqContent = { items: FaqItem[] };

export type CtaButton = { label: string; href: string; variant: "gold" | "outline" };
export type CtaContent = {
  eyebrow: string;
  headline: string;
  headlineEm: string;
  sub: string;
  buttons: CtaButton[];
};

export type FooterColumn = { title: string; links: NavLink[] };
export type SocialLink = { icon: string; href: string; title: string };
export type FooterContent = {
  brandName: string;
  brandSub: string;
  desc: string;
  socials: SocialLink[];
  columns: FooterColumn[];
  copy: string;
  method: string;
};

export type LandingContent = {
  nav: NavContent;
  hero: HeroContent;
  stats: StatsContent;
  sobre: SobreContent;
  qualquer_um: QualquerUmContent;
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
  "stats",
  "sobre",
  "qualquer_um",
  "produtos",
  "metodo",
  "resultados",
  "faq",
  "cta",
  "footer",
] as const;

export type LandingSectionKey = (typeof LANDING_SECTIONS)[number];

/* ---------- Defaults (cópia + fotos da referência) ---------- */

export const defaultContent: LandingContent = {
  nav: {
    logoStart: "Priscila ",
    logoHighlight: "Sinópolis",
    links: [
      { label: "Sobre", href: "#sobre" },
      { label: "Programas", href: "#produtos" },
      { label: "Método JFV", href: "#metodo" },
      { label: "Resultados", href: "#resultados" },
    ],
    cta: { label: "Comprar agora", href: "https://pay.kiwify.com.br/3X8I06c" },
  },
  hero: {
    eyebrow: "Método JFV · Especialista em Vendas",
    headline: "Venda mais.\nCresça mais.\nAprenda o",
    headlineEm: "Jeito Fácil\nde Vender.",
    sub: "Mais de 7 anos ajudando pessoas e empresas a venderem mais através de estratégias simples, práticas e aplicáveis.",
    primaryCta: { label: "Quero comprar agora →", href: "https://pay.kiwify.com.br/3X8I06c" },
    secondaryCta: { label: "Conhecer os programas", href: "#produtos" },
    photoUrl: "/priscila/hero.jpg",
    badges: [
      "+7 anos de experiência em vendas",
      "+30 mentorados transformados",
      "+500 clientes atendidos no mundo",
      "Método JFV validado e comprovado",
    ],
  },
  stats: {
    items: [
      { num: "+7", label: "Anos vendendo" },
      { num: "+30", label: "Mentorados" },
      { num: "+500", label: "Clientes no mundo" },
      { num: "JFV", label: "Método próprio" },
    ],
  },
  sobre: {
    eyebrow: "Quem é",
    title: "Quem é Priscila Sinópolis?",
    paragraphs: [
      "**Empresária, mentora e estrategista comercial.** Fundadora da Social Marketing Digital e criadora do Método JFV, Priscila dedicou mais de 7 anos construindo uma metodologia que transforma pessoas comuns em vendedores extraordinários.",
      "Seu diferencial está na **simplicidade com profundidade**: processos consistentes e escaláveis que funcionam tanto para quem está começando do zero quanto para empresas que desejam acelerar resultados.",
    ],
    tags: ["Vendas", "Estratégia Comercial", "Gestão de Equipes", "Método JFV", "Mentoria"],
    photoMain: "/priscila/sobre-main.jpg",
    photoSm1: "/priscila/sobre-1.jpg",
    photoSm2: "/priscila/sobre-2.jpg",
  },
  qualquer_um: {
    eyebrow: "A verdade sobre vendas",
    title: "Não importa o que você vende.\nO que importa é",
    titleEm: "como você vende.",
    sub: "Do bolo de pote caseiro ao Ferrari na concessionária — quem domina o processo de vendas vende qualquer coisa, para qualquer pessoa, em qualquer mercado. Isso é treinável. Isso é o Método JFV.",
    cards: [
      { emoji: "🎂", item: "Bolo de Pote" },
      { emoji: "👗", item: "Moda & Brechó" },
      { emoji: "💻", item: "Infoprodutos" },
      { emoji: "🏠", item: "Imóveis" },
      { emoji: "🚗", item: "Ferrari" },
    ],
    cta: [
      "O segredo não está no produto. Está em **você**.",
      "E vender é uma habilidade que qualquer pessoa pode aprender.",
    ],
  },
  produtos: {
    eyebrow: "Programas",
    title: "Escolha o seu caminho",
    sub: "Cada programa foi desenhado para um estágio diferente da sua jornada.",
    cards: [
      {
        badge: "Assinatura",
        badgeClass: "ba",
        title: "Jeito Fácil de Vender",
        price: "R$ 19,90",
        priceSuffix: "/mês",
        desc: "Comunidade exclusiva para vendedores, empreendedores e pessoas que desejam aprender a vender todos os dias de forma prática e consistente.",
        benefits: [
          "Aulas exclusivas toda semana",
          "Lives com Priscila",
          "Comunidade ativa",
          "Conteúdos semanais",
        ],
        button: { label: "Comprar na Kiwify →", href: "https://pay.kiwify.com.br/3X8I06c", variant: "gold" },
        featured: true,
      },
      {
        badge: "Mentoria Particular",
        badgeClass: "bm",
        title: "Do Zero aos 10k",
        price: "",
        priceSuffix: "",
        desc: "Programa individual para quem deseja construir um negócio sólido, estruturar vendas e alcançar seus primeiros R$ 10.000 por mês com acompanhamento próximo e personalizado.",
        benefits: [
          "Acompanhamento individual",
          "Plano comercial personalizado",
          "Suporte direto com Priscila",
          "Acesso ao Método JFV completo",
        ],
        button: { label: "Quero minha vaga →", href: "https://forms.gle/rEyppDKmzZypoSd76", variant: "navy" },
      },
      {
        badge: "Empresarial",
        badgeClass: "be",
        title: "Programa de Aceleração para Empresas",
        price: "",
        priceSuffix: "",
        desc: "Consultoria estratégica para empresas que desejam aumentar faturamento, melhorar processos comerciais e estruturar equipes de alta performance.",
        benefits: [
          "Diagnóstico comercial completo",
          "Reestruturação do processo de vendas",
          "Treinamento da equipe",
          "Acompanhamento de resultados",
        ],
        button: { label: "Agendar diagnóstico →", href: "https://forms.gle/sWTZ5FmFDRutLZfH7", variant: "navy" },
      },
    ],
  },
  metodo: {
    eyebrow: "Método Proprietário",
    title: "O Método JFV",
    sub: "O caminho simples, estruturado e comprovado para vender mais todos os dias.",
    steps: [
      { emoji: "🧠", step: "Passo 01", name: "Mentalidade Comercial", desc: "Construa a base certa para vender sem medo e com confiança" },
      { emoji: "🎯", step: "Passo 02", name: "Prospecção", desc: "Encontre os clientes certos antes de abrir a boca" },
      { emoji: "🤝", step: "Passo 03", name: "Relacionamento", desc: "Crie conexão real que abre portas antes da oferta" },
      { emoji: "💡", step: "Passo 04", name: "Oferta", desc: "Apresente o valor certo, para a pessoa certa, na hora certa" },
      { emoji: "🔄", step: "Passo 05", name: "Follow-up", desc: "A venda começa no não — aprenda a conduzir até o sim" },
      { emoji: "🚀", step: "Passo 06", name: "Escala", desc: "Transforme o processo em máquina de vendas recorrente" },
    ],
  },
  resultados: {
    eyebrow: "Resultados Reais",
    title: "Histórias de quem aplicou o Método JFV",
    sub: "Pessoas comuns. Resultados extraordinários.",
    photos: ["/priscila/resultados-1.jpg", "/priscila/resultados-2.jpg"],
    videos: [
      { label: "Depoimento em vídeo 1", url: "" },
      { label: "Depoimento em vídeo 2", url: "" },
      { label: "Depoimento em vídeo 3", url: "" },
    ],
    testimonials: [
      { avatar: "🎂", name: "Camila Rodrigues", role: "Confeiteira, São Paulo – SP", product: "Assinatura JFV", text: "Eu vendia bolo de pote há 2 anos e nunca conseguia passar de R$ 1.500 no mês. Depois de aplicar o Método JFV, em 60 dias cheguei a R$ 4.800. A Priscila me mostrou que o problema nunca foi o meu bolo — era a forma como eu vendia." },
      { avatar: "🚗", name: "Rafael Mendes", role: "Consultor de Vendas, Curitiba – PR", product: "Mentoria Particular", text: "Trabalho com vendas há 8 anos em concessionária e achei que já sabia tudo. O JFV virou minha chave: aprendi a escutar de verdade, a construir relacionamento e fechar muito mais rápido. Minha comissão dobrou em 3 meses." },
      { avatar: "👗", name: "Letícia Nunes", role: "Lojista, Belo Horizonte – MG", product: "Programa Empresarial", text: "Minha loja de roupas estava agonizando. Pensei em fechar. A Priscila me ensinou a prospectar no Instagram, a fazer follow-up e a apresentar o produto com valor. Em 45 dias, tive o melhor mês da minha história." },
      { avatar: "🌿", name: "Ana Paula Costa", role: "Terapeuta Holística, Florianópolis – SC", product: "Assinatura JFV", text: "Sou terapeuta e nunca soube como vender meus serviços sem me sentir invasiva. O JFV me ensinou que vender é servir — e quando entendi isso, tudo mudou. Hoje tenho agenda lotada e lista de espera." },
      { avatar: "💼", name: "Thiago Alves", role: "Empreendedor Digital, Goiânia – GO", product: "Mentoria Particular", text: "Trabalhava como CLT e queria empreender mas tinha medo de vender. Comecei do zero aplicando o método e em 4 meses já tinha faturado mais do que meu salário. Hoje sou meu próprio chefe e não volto mais." },
      { avatar: "🏢", name: "Marcelo Figueiredo", role: "CEO, empresa de tecnologia – SP", product: "Programa Empresarial", text: "Nossa equipe comercial estava travada. Contratamos a consultoria e em 30 dias já víamos diferença: mais ligações, melhor abordagem e conversão 40% maior. O método é simples e funciona de verdade." },
    ],
  },
  faq: {
    items: [
      { q: "Preciso ter experiência em vendas?", a: "Não. O Método JFV foi desenhado para funcionar tanto para quem está começando do zero quanto para quem já vende e quer escalar resultados. O conteúdo vai do básico ao avançado." },
      { q: "O método funciona para qualquer tipo de produto?", a: "Sim. O JFV ensina o processo de vendas — não um produto específico. Quem domina o processo vende desde bolo de pote até produtos de alto ticket, em qualquer mercado." },
      { q: "Como funciona a assinatura JFV?", a: "Você paga R$ 19,90/mês e tem acesso a aulas exclusivas toda semana, lives com a Priscila, comunidade ativa e conteúdos práticos para aplicar no mesmo dia. Cancele quando quiser." },
      { q: "Quanto tempo até ver resultados?", a: "Depende da sua aplicação. A maioria dos alunos relata mudanças nas primeiras semanas e resultados concretos nos primeiros 30 a 60 dias colocando o método em prática." },
      { q: "Tem garantia?", a: "A assinatura pode ser cancelada a qualquer momento, sem multa. Para mentorias e programas empresariais, os detalhes são combinados no diagnóstico inicial." },
    ],
  },
  cta: {
    eyebrow: "Próximo passo",
    headline: "Você está a uma decisão de",
    headlineEm: "transformar suas vendas.",
    sub: "Escolha o programa ideal e comece hoje. Qualquer produto. Qualquer mercado. Qualquer pessoa.",
    buttons: [
      { label: "Comprar agora", href: "https://pay.kiwify.com.br/3X8I06c", variant: "gold" },
      { label: "Conhecer os programas", href: "#produtos", variant: "outline" },
    ],
  },
  footer: {
    brandName: "Priscila Sinópolis",
    brandSub: "Vendas · Estratégia · Gestão",
    desc: "Especialista em Vendas e criadora do Método JFV — o jeito simples e poderoso de vender mais todos os dias.",
    socials: [
      { icon: "💬", href: "https://wa.me/5543996820296", title: "WhatsApp" },
      { icon: "📸", href: "https://www.instagram.com/priscila_sinopolis/", title: "Instagram" },
      { icon: "💼", href: "https://www.linkedin.com/in/priscila-sin%C3%B3polis/", title: "LinkedIn" },
    ],
    columns: [
      {
        title: "Programas",
        links: [
          { label: "Assinatura JFV", href: "#produtos" },
          { label: "Mentoria Particular", href: "https://forms.gle/rEyppDKmzZypoSd76" },
          { label: "Aceleração Empresarial", href: "https://forms.gle/sWTZ5FmFDRutLZfH7" },
        ],
      },
      {
        title: "Links",
        links: [
          { label: "Sobre Priscila", href: "#sobre" },
          { label: "Método JFV", href: "#metodo" },
          { label: "Resultados", href: "#resultados" },
          { label: "Contato via WhatsApp", href: "https://wa.me/5543996820296" },
        ],
      },
    ],
    copy: "© 2025 Priscila Sinópolis. Todos os direitos reservados.",
    method: "Método JFV · Jeito Fácil de Vender",
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
      stats: mergeSection("stats", map.get("stats")),
      sobre: mergeSection("sobre", map.get("sobre")),
      qualquer_um: mergeSection("qualquer_um", map.get("qualquer_um")),
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