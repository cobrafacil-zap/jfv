import type { FaqContent } from "@/lib/landing-content";
import { FAQ as FAQNew } from "@/components/ui/FAQ";

export function FAQ({ content }: { content: FaqContent }) {
  return <FAQNew content={content} />;
}