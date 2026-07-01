import "server-only";
import { TipoPecaJuridica } from "@/types/database";
import { tiposPecaMock } from "@/lib/mock/tipos-peca";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function listarTiposPeca(): Promise<TipoPecaJuridica[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("mod5_tipo_peca_juridica")
      .select("id, id_fase, nome, codigo, descricao")
      .order("codigo", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return tiposPecaMock;
    return data as TipoPecaJuridica[];
  } catch {
    return tiposPecaMock;
  }
}
