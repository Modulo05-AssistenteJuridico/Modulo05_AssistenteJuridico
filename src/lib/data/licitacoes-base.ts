import "server-only";
import { LicitacaoBase } from "@/types/database";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const COLUNAS =
  "id, titulo, orgao, tipo_decisao, numero, lei_referencia, data_decisao, conteudo, fonte, created_at, updated_at";

export async function buscarPrecedentes(
  tema: string,
  limite = 5,
): Promise<LicitacaoBase[]> {
  if (!tema.trim()) return [];
  const supabase = createSupabaseAdminClient();

  try {
    const { data, error } = await supabase.rpc("mod5_buscar_precedentes", {
      termo: tema,
      limite,
    });
    if (!error && Array.isArray(data) && data.length > 0) {
      return data as LicitacaoBase[];
    }
  } catch {}

  try {
    const { data, error } = await supabase
      .from("mod5_licitacoes_base")
      .select(COLUNAS)
      .textSearch("conteudo", tema, { type: "websearch", config: "portuguese" })
      .limit(limite);
    if (error) throw error;
    return (data ?? []) as LicitacaoBase[];
  } catch {
    return [];
  }
}
