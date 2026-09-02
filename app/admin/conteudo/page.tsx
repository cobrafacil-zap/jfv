import { getLandingContent } from "@/lib/landing-content";
import { LandingEditor } from "@/components/admin/landing/LandingEditor";

export const dynamic = "force-dynamic";

export default async function ConteudoPage() {
  const content = await getLandingContent();
  return <LandingEditor initial={content} />;
}