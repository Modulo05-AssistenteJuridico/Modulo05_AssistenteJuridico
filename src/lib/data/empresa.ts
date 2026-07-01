import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface EmpresaFornecedor {
  cnpj: string | null;
  nome: string | null;
  detalhes: string | null;
}

export async function buscarEmpresa(): Promise<EmpresaFornecedor | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("mod4_tempmod2")
      .select("cnpj, company_name, company_details")
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      cnpj: data.cnpj ?? null,
      nome: data.company_name ?? null,
      detalhes: data.company_details ?? null,
    };
  } catch {
    return null;
  }
}
