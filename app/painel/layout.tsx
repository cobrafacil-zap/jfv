import type { Metadata } from "next";
import "./painel.css";

export const metadata: Metadata = {
  title: "Painel de métricas · JFV",
  description: "Métricas de visitas, cliques e conversões da landing da JFV.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="pnl-root">{children}</div>;
}
