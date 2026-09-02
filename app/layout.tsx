import type { Metadata } from "next";
import { Inter, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { getThemeColors, buildThemeCss } from "@/lib/theme-colors";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Script que roda antes da pintura para evitar flash do tema errado (FOUC).
// Lê a preferência salva (ou do sistema) e seta data-theme no <html>.
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var t=s?s:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export const metadata: Metadata = {
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
    type: "website",
    locale: "pt_BR",
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
      className={`${inter.variable} ${playfair.variable} ${grotesk.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="bg-bg-primary text-text-primary font-body antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}