import type { CtaContent } from "@/lib/landing-content";
import { CTASection } from "@/components/ui/CTASection";

export function CTAFinal({ content }: { content: CtaContent }) {
  return <CTASection content={content} />;
}