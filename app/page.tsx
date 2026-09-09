import { getLandingContent } from "@/lib/landing-content";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Positioning } from "@/components/landing/Positioning";
import { Sobre } from "@/components/landing/Sobre";
import { Conceptual } from "@/components/landing/Conceptual";
import { Produtos } from "@/components/landing/Produtos";
import { Metodo } from "@/components/landing/Metodo";
import { Resultados } from "@/components/landing/Resultados";
import { FAQ } from "@/components/landing/FAQ";
import { CTAFinal } from "@/components/landing/CTAFinal";
import { Footer } from "@/components/landing/Footer";
import { LandingScripts } from "@/components/landing/LandingScripts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const c = await getLandingContent();

  return (
    <main className="ps-landing">
      <Navbar content={c.nav} />
      <Hero content={c.hero} />
      <Positioning content={c.positioning} />
      <Sobre content={c.sobre} />
      <Conceptual content={c.conceptual} />
      <Produtos content={c.produtos} />
      <Metodo content={c.metodo} />
      <Resultados content={c.resultados} />
      <FAQ content={c.faq} />
      <CTAFinal content={c.cta} />
      <Footer content={c.footer} />
      <LandingScripts />
    </main>
  );
}