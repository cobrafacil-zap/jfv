import type { LandingContent } from "@/lib/landing-content";

const SITE_URL = "https://jfv.smdigtal.com";

/**
 * Dados estruturados (schema.org) para o Google entender a página:
 * - Person: Priscila Sinópolis
 * - WebSite + Organization
 * - FAQPage: as perguntas frequentes da landing
 */
export function JsonLd({ content }: { content: LandingContent }) {
  const person = {
    "@type": "Person",
    name: "Priscila Sinópolis",
    url: SITE_URL,
    image: `${SITE_URL}/priscila/sobre-main.jpg`,
    jobTitle: "Mentora e Estrategista Comercial",
    description:
      "Empresária, mentora e estrategista comercial, criadora do Método JFV — Jeito Fácil de Vender. Mais de 7 anos de experiência e +500 clientes atendidos.",
    sameAs: [
      "https://www.instagram.com/priscila_jeito_facil_de_vender/",
      "https://www.linkedin.com/in/priscila-sin%C3%B3polis/",
    ],
    knowsAbout: [
      "Vendas",
      "Prospecção de clientes",
      "Processo comercial",
      "Mentoria de vendas",
      "Aceleração comercial",
    ],
  };

  const organization = {
    "@type": "Organization",
    name: "Método JFV — Jeito Fácil de Vender",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    founder: { "@id": "#priscila" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: "Portuguese",
    },
  };

  const faqPage = {
    "@type": "FAQPage",
    mainEntity: content.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const dados = {
    "@context": "https://schema.org",
    "@graph": [
      { ...person, "@id": "#priscila" },
      organization,
      {
        "@type": "WebSite",
        name: "Priscila Sinópolis — Método JFV",
        url: SITE_URL,
        inLanguage: "pt-BR",
      },
      faqPage,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
