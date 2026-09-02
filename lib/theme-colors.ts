import { supabaseAdmin } from "@/lib/supabase";

/* ============================================================
   Cores do tema escolhidas pelo admin.
   O admin escolhe primary + secondary; o restante da paleta
   (claro/escuro/pale) é derivado. As cores são injetadas como
   override de CSS vars no <head> (layout) e repintam o site todo.
   ============================================================ */

export type ThemeColors = { primary: string; secondary: string };

export const DEFAULT_THEME_COLORS: ThemeColors = {
  primary: "#6D28D9",
  secondary: "#8B5CF6",
};

export const THEME_PRESETS: { name: string; colors: ThemeColors }[] = [
  { name: "Violeta", colors: { primary: "#6D28D9", secondary: "#8B5CF6" } },
  { name: "Roxo real", colors: { primary: "#7C3AED", secondary: "#A78BFA" } },
  { name: "Índigo", colors: { primary: "#4F46E5", secondary: "#818CF8" } },
  { name: "Roxo escuro", colors: { primary: "#581C87", secondary: "#A855F7" } },
  { name: "Azul", colors: { primary: "#2563EB", secondary: "#38BDF8" } },
  { name: "Esmeralda", colors: { primary: "#10B981", secondary: "#14B8A6" } },
  { name: "Âmbar", colors: { primary: "#F59E0B", secondary: "#F97316" } },
];

/* ---------- matemática de cor ---------- */
type RGB = { r: number; g: number; b: number };

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function hexToRgb(hex: string): RGB | null {
  const m = /^#?([a-f\d]{6}|[a-f\d]{3})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return {
    r: clamp(a.r + (b.r - a.r) * t),
    g: clamp(a.g + (b.g - a.g) * t),
    b: clamp(a.b + (b.b - a.b) * t),
  };
}

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 12, g: 12, b: 18 }; // bg-base dark

const lighten = (c: RGB, t: number) => mix(c, WHITE, t);
const darken = (c: RGB, t: number) => mix(c, BLACK, t);

const triplet = (c: RGB) => `${c.r} ${c.g} ${c.b}`;

export function isValidHex(h: string) {
  return !!hexToRgb(h);
}

/* ---------- geração da escala ---------- */
export interface ThemeScale {
  accent: string;
  accentLight: string;
  accentDeep: string;
  accentPaleLight: string;
  accentPaleDark: string;
  accent2: string;
  accent3: string;
}

export function buildScale(colors: ThemeColors): ThemeScale {
  const p = hexToRgb(colors.primary) ?? hexToRgb(DEFAULT_THEME_COLORS.primary)!;
  const s = hexToRgb(colors.secondary) ?? hexToRgb(DEFAULT_THEME_COLORS.secondary)!;
  return {
    accent: triplet(p),
    accentLight: triplet(lighten(p, 0.24)),
    accentDeep: triplet(darken(p, 0.22)),
    accentPaleLight: triplet(mix(p, WHITE, 0.9)),
    accentPaleDark: triplet(darken(p, 0.82)),
    accent2: triplet(s),
    accent3: triplet(lighten(s, 0.28)),
  };
}

/** CSS de override das vars de accent (vale para todo o site). */
export function buildThemeCss(colors: ThemeColors): string {
  const s = buildScale(colors);
  return `
:root{
  --accent: ${s.accent} !important;
  --accent-light: ${s.accentLight} !important;
  --accent-deep: ${s.accentDeep} !important;
  --accent-pale: ${s.accentPaleLight} !important;
  --accent-2: ${s.accent2} !important;
  --accent-3: ${s.accent3} !important;
}
:root[data-theme="dark"]{
  --accent-pale: ${s.accentPaleDark} !important;
}
`.trim();
}

/* ---------- persistência ---------- */
const SETTING_KEY = "theme_colors";

let _cache: { t: number; v: ThemeColors } | null = null;
const CACHE_TTL = 30000; // 30s

export async function getThemeColors(): Promise<ThemeColors> {
  if (_cache && Date.now() - _cache.t < CACHE_TTL) return _cache.v;
  try {
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", SETTING_KEY)
      .maybeSingle();
    const v: ThemeColors = (() => {
      if (!data?.value) return DEFAULT_THEME_COLORS;
      try {
        const parsed = JSON.parse(data.value) as Partial<ThemeColors>;
        return {
          primary:
            (parsed.primary && isValidHex(parsed.primary) && parsed.primary) ||
            DEFAULT_THEME_COLORS.primary,
          secondary:
            (parsed.secondary && isValidHex(parsed.secondary) && parsed.secondary) ||
            DEFAULT_THEME_COLORS.secondary,
        };
      } catch {
        return DEFAULT_THEME_COLORS;
      }
    })();
    _cache = { t: Date.now(), v };
    return v;
  } catch {
    return DEFAULT_THEME_COLORS;
  }
}

/** Esvazia o cache (chamar após salvar novas cores). */
export function invalidateThemeColorsCache() {
  _cache = null;
}