import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

type ClientOptions = Parameters<typeof createClient>[2];

/**
 * Cria um cliente Supabase de forma preguiçosa (lazy).
 *
 * O `createClient` lança "supabaseUrl is required" quando chamado sem URL.
 * Criando o cliente só no primeiro uso, o `next build` consegue importar os
 * módulos das rotas para coletar dados da página sem exigir as variáveis de
 * ambiente no momento do build.
 */
function createLazyClient(
  getUrl: () => string,
  getKey: () => string,
  options?: ClientOptions
): SupabaseClient {
  let client: SupabaseClient | null = null;

  const resolve = () => {
    if (!client) {
      const url = getUrl();
      if (!url) {
        throw new Error(
          "supabaseUrl is required. Defina NEXT_PUBLIC_SUPABASE_URL nas variáveis de ambiente."
        );
      }
      client = createClient(url, getKey(), options);
    }
    return client;
  };

  return new Proxy({} as SupabaseClient, {
    get(_target, prop, receiver) {
      const value = Reflect.get(resolve(), prop, receiver);
      return typeof value === "function" ? value.bind(resolve()) : value;
    },
  });
}

// Cliente público (browser) — usa anon key
export const supabase = createLazyClient(
  () => supabaseUrl,
  () => supabaseAnonKey
);

// Cliente admin (server) — usa service role key, bypass RLS
export const supabaseAdmin = createLazyClient(
  () => supabaseUrl,
  () => supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
