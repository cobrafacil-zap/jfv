import { getLandingContent } from "@/lib/landing-content";
import { Navbar } from "@/components/landing/Navbar";
import { Apresentacao } from "@/components/landing/Apresentacao";
import { ProdutosShowcase } from "@/components/landing/ProdutosShowcase";
import { Sobre } from "@/components/landing/Sobre";
import { Resultados } from "@/components/landing/Resultados";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { LandingScripts } from "@/components/landing/LandingScripts";
import { ScrollProgress } from "@/components/landing/ScrollProgress";
import { LedAmbience } from "@/components/landing/LedAmbience";
import { WhatsAppFloat } from "@/components/landing/WhatsAppFloat";
import { StayPopup } from "@/components/landing/StayPopup";
import { JsonLd } from "@/components/landing/JsonLd";

export const revalidate = 300;

export default async function Home() {
  const c = await getLandingContent();

  return (
    <main className="ps-landing">
      <JsonLd content={c} />
      <ScrollProgress />
      <LedAmbience />

      <Navbar content={c.nav} />
      <Apresentacao content={c.apresentacao} />
      <ProdutosShowcase content={c.produtos} />
      <Sobre content={c.sobre} />
      <Resultados content={c.resultados} />
      <FAQ content={c.faq} />
      <Footer content={c.footer} />
      <WhatsAppFloat />
      <StayPopup />
      <LandingScripts />
    </main>
  );
}
