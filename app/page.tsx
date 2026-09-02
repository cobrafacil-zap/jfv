import { getLandingContent } from "@/lib/landing-content";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Marquee } from "@/components/landing/Marquee";
import { Sobre } from "@/components/landing/Sobre";
import { QualquerUm } from "@/components/landing/QualquerUm";
import { Produtos } from "@/components/landing/Produtos";
import { Pricing } from "@/components/landing/Pricing";
import { Metodo } from "@/components/landing/Metodo";
import { Resultados } from "@/components/landing/Resultados";
import { FAQ } from "@/components/landing/FAQ";
import { CTAFinal } from "@/components/landing/CTAFinal";
import { Footer } from "@/components/landing/Footer";
import { LandingScripts } from "@/components/landing/LandingScripts";
import { ScrollProgress } from "@/components/landing/ScrollProgress";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const c = await getLandingContent();

  return (
    <main className="ps-landing">
      {/* Decoração: mesh de blobs + grão + barra de progresso */}
      <div className="mesh-blob b1" aria-hidden />
      <div className="mesh-blob b2" aria-hidden />
      <div className="mesh-blob b3" aria-hidden />
      <div className="landing-grain" aria-hidden />
      <ScrollProgress />

      <Navbar content={c.nav} />
      <Hero content={c.hero} />
      <Stats content={c.stats} />
      <Marquee items={c.metodo.steps.map((s) => s.name)} />
      <Sobre content={c.sobre} />
      <QualquerUm content={c.qualquer_um} />
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