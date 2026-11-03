import type { Metadata } from "next";
import { AplicacaoForm } from "@/components/aplicacao/AplicacaoForm";

export const metadata: Metadata = {
  title: "Aplicação · Do Zero aos 10k | Priscila Sinópolis",
  description:
    "Aplicação para a mentoria individual Do Zero aos 10k, com Priscila Sinópolis. Cinco etapas para entender seu momento e direcionar seu próximo passo.",
  robots: { index: false, follow: false },
};

export default function AplicacaoPage() {
  return <AplicacaoForm />;
}
