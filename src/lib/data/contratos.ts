import "server-only";
import { Contrato } from "@/types/external";
import { contratosMock } from "@/lib/mock/contratos";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const COLUNAS =
  "id, numero, orgao, objeto, fornecedor, cnpj, valor, vigencia_inicio, vigencia_fim";

interface LinhaContrato {
  id: string;
  numero: string | null;
  orgao: string | null;
  objeto: string | null;
  fornecedor: string | null;
  cnpj: string | null;
  valor: number | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
}

function mapear(l: LinhaContrato): Contrato {
  return {
    id: l.id,
    numero: l.numero ?? "",
    orgao: l.orgao ?? "",
    objeto: l.objeto ?? "",
    fornecedor: l.fornecedor ?? "",
    cnpj: l.cnpj ?? "",
    valor: l.valor ?? 0,
    vigencia_inicio: l.vigencia_inicio ?? "",
    vigencia_fim: l.vigencia_fim ?? "",
  };
}

export async function listarContratos(): Promise<Contrato[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("mod8_contrato")
      .select(COLUNAS)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return contratosMock;
    return (data as LinhaContrato[]).map(mapear);
  } catch {
    return contratosMock;
  }
}

export async function buscarContratoPorId(id: string): Promise<Contrato | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("mod8_contrato")
      .select(COLUNAS)
      .eq("id", id)
      .single();
    if (error || !data) return null;
    return mapear(data as LinhaContrato);
  } catch {
    return null;
  }
}
