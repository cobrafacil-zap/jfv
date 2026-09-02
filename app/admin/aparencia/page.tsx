import { getThemeColors } from "@/lib/theme-colors";
import { ThemeColorsEditor } from "@/components/admin/theme/ThemeColorsEditor";

export const dynamic = "force-dynamic";

export default async function AparenciaPage() {
  const colors = await getThemeColors();
  return <ThemeColorsEditor initial={colors} />;
}