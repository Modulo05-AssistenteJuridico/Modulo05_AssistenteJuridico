import "server-only";
import { Licitacao } from "@/types/external";
import { licitacoesMock } from "@/lib/mock/licitacoes";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function listarLicitacoes(): Promise<Licitacao[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("mod4_tempmod1")
      .select("edital_id, orgao, objeto, doc_1, doc_2, doc_3, doc_4, doc_5")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return licitacoesMock;
    return data.map((e) => ({
      id: e.edital_id,
      orgao: e.orgao ?? "",
      objeto: e.objeto ?? "",
      docs: [e.doc_1, e.doc_2, e.doc_3, e.doc_4, e.doc_5].filter(
        (d): d is string => Boolean(d),
      ),
    }));
  } catch {
    return licitacoesMock;
  }
}

export async function buscarEditalPorId(id: string): Promise<Licitacao | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("mod4_tempmod1")
      .select("edital_id, orgao, objeto, doc_1, doc_2, doc_3, doc_4, doc_5")
      .eq("edital_id", id)
      .single();
    if (error || !data) return null;
    return {
      id: data.edital_id,
      orgao: data.orgao ?? "",
      objeto: data.objeto ?? "",
      docs: [data.doc_1, data.doc_2, data.doc_3, data.doc_4, data.doc_5].filter(
        (d): d is string => Boolean(d),
      ),
    };
  } catch {
    return null;
  }
}
