import { getLandingContent } from "@/lib/landing-content";
import { Navbar } from "@/components/landing/Navbar";
import { Apresentacao } from "@/components/landing/Apresentacao";
import { ProdutosShowcase } from "@/components/landing/ProdutosShowcase";
import { Sobre } from "@/components/landing/Sobre";
import { Resultados } from "@/components/landing/Resultados";
import { FAQ } from "@/components/landing/FAQ";
import { Closing } from "@/components/landing/Closing";
import { Footer } from "@/components/landing/Footer";
import { LandingScripts } from "@/components/landing/LandingScripts";
import { ScrollProgress } from "@/components/landing/ScrollProgress";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const c = await getLandingContent();

  return (
    <main className="ps-landing">
      <ScrollProgress />

      <Navbar content={c.nav} />
      <Apresentacao content={c.apresentacao} />
      <ProdutosShowcase content={c.produtos} />
      <Sobre content={c.sobre} />
      <Resultados content={c.resultados} />
      <FAQ content={c.faq} />
      <Closing content={c.closing} />
      <Footer content={c.footer} />
      <LandingScripts />
    </main>
  );
}
