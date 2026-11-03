import type { Metadata } from "next";
import { AplicacaoForm } from "@/components/aplicacao/AplicacaoForm";

export const metadata: Metadata = {
  metadataBase: new URL("https://jfv.smdigtal.com"),
  title: "Aplicação · Do Zero aos 10k | Priscila Sinópolis",
  description:
    "Aplicação para a mentoria individual Do Zero aos 10k, com Priscila Sinópolis. Cinco etapas para entender o momento da sua agência de marketing e direcionar o próximo passo.",
  alternates: { canonical: "/aplicacao" },
  openGraph: {
    title: "Aplicação · Do Zero aos 10k | Priscila Sinópolis",
    description:
      "Mentoria individual para donos de agência de marketing que querem sair da estagnação e crescer com método.",
    url: "https://jfv.smdigtal.com/aplicacao",
    siteName: "Priscila Sinópolis · Método JFV",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function AplicacaoPage() {
  return <AplicacaoForm />;
}
