import type { Metadata } from "next";
import { AceleracaoForm } from "@/components/aplicacao/AceleracaoForm";

export const metadata: Metadata = {
  metadataBase: new URL("https://jfv.smdigtal.com"),
  title: "Diagnóstico · Aceleração Comercial | Priscila Sinópolis",
  description:
    "Diagnóstico para empresas que querem vender mais e aparecer mais. Cinco etapas para entender o cenário comercial e direcionar o próximo passo com o Método JFV.",
  alternates: { canonical: "/aceleracao" },
  openGraph: {
    title: "Diagnóstico · Aceleração Comercial | Priscila Sinópolis",
    description:
      "Consultoria estratégica para empresas que querem aumentar faturamento, estruturar o time comercial e ganhar visibilidade.",
    url: "https://jfv.smdigtal.com/aceleracao",
    siteName: "Priscila Sinópolis · Método JFV",
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export default function AceleracaoPage() {
  return <AceleracaoForm />;
}
