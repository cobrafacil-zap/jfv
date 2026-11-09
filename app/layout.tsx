import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Tracker } from "@/components/analytics/Tracker";
import { getThemeColors, buildThemeCss } from "@/lib/theme-colors";

// Fontes hospedadas localmente (app/fonts) para o build não depender da rede
// do Google Fonts — evita falhas intermitentes de deploy no Vercel.
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

const jakarta = localFont({
  src: "./fonts/jakarta-latin.woff2",
  weight: "200 800",
  variable: "--font-jakarta",
  display: "swap",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/plex-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/plex-mono-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/plex-mono-latin-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-plex",
  display: "swap",
});

// Script que roda antes da pintura para evitar flash do tema errado (FOUC).
// Landing pública (`/`) usa tema escuro como padrão; admin segue a preferência do usuário.
const themeScript = `(function(){try{
  var path = location.pathname;
  var isLanding = path === '/' || path === '/index.html';
  var saved = localStorage.getItem('theme');
  var sys = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  var t = saved || (isLanding ? 'dark' : sys);
  document.documentElement.dataset.theme = t;
}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://jfv.smdigtal.com"),
  title: "Priscila Sinópolis — Método JFV | Jeito Fácil de Vender",
  description:
    "Especialista em Vendas, Estratégia Comercial e Gestão. Mais de 7 anos ajudando pessoas e empresas a venderem mais com o Método JFV.",
  keywords: [
    "priscila sinópolis",
    "método jfv",
    "jeito fácil de vender",
    "curso de vendas",
    "mentoria de vendas",
    "estratégia comercial",
    "vender mais",
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Priscila Sinópolis — Método JFV | Jeito Fácil de Vender",
    description:
      "Especialista em Vendas e criadora do Método JFV — o jeito simples e poderoso de vender mais todos os dias.",
    url: "https://jfv.smdigtal.com",
    siteName: "Priscila Sinópolis · Método JFV",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Priscila Sinópolis — Método JFV, Jeito Fácil de Vender",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Priscila Sinópolis — Método JFV | Jeito Fácil de Vender",
    description:
      "O método que já ajudou +500 pessoas a vender melhor. Jeito Fácil de Vender, com Priscila Sinópolis.",
    images: ["/og-image.jpg"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const colors = await getThemeColors();
  const themeCss = buildThemeCss(colors);

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="bg-bg-primary text-text-primary font-body antialiased">
        <Tracker />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}