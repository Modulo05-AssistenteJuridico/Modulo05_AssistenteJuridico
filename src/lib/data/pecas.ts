import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  AnexoPeca,
  DocumentoGerado,
  FaseLicitacao,
  PecaJuridica,
  StatusPeca,
  TeseJuridica,
  TeseSugerida,
  TipoPecaJuridica,
} from "@/types/database";

const BUCKET = "mod5";

const REGEX_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface CriarPecaInput {
  tipoId: string;
  licitacaoId?: string | null;
  contratoId?: string | null;
  tema?: string | null;
  tese: TeseSugerida;
}

export interface PecaCriada {
  id: string;
}

export interface PecaDetalhe {
  peca: PecaJuridica;
  fase: FaseLicitacao | null;
  tipo: TipoPecaJuridica | null;
  tese: TeseJuridica | null;
}

export async function criarPeca(input: CriarPecaInput): Promise<PecaCriada> {
  const idUsuario = process.env.DEV_USER_ID;
  if (!idUsuario) {
    throw new Error("DEV_USER_ID não configurado no ambiente.");
  }
  if (!REGEX_UUID.test(input.tipoId)) {
    throw new Error("Tipo de peça inválido.");
  }

  const supabase = createSupabaseAdminClient();

  const { data: tipo, error: erroTipo } = await supabase
    .from("mod5_tipo_peca_juridica")
    .select("id, id_fase")
    .eq("id", input.tipoId)
    .single();
  if (erroTipo || !tipo) {
    throw new Error("Tipo de peça não encontrado.");
  }

  const { data: tese, error: erroTese } = await supabase
    .from("mod5_tese_juridica")
    .insert({
      titulo: input.tese.titulo,
      objetivo: input.tese.objetivo
        ? input.tese.objetivo.slice(0, 50)
        : null,
      relevancia: input.tese.relevancia,
      fundamentacao: input.tese.fundamentacao,
    })
    .select("id")
    .single();
  if (erroTese || !tese) {
    throw new Error("Falha ao gravar a tese.");
  }

  const idEditalM4 =
    input.licitacaoId && REGEX_UUID.test(input.licitacaoId)
      ? input.licitacaoId
      : null;

  const idContratoM8 =
    input.contratoId && REGEX_UUID.test(input.contratoId)
      ? input.contratoId
      : null;

  const { data: peca, error: erroPeca } = await supabase
    .from("mod5_peca_juridica")
    .insert({
      id_usuario: idUsuario,
      id_fase: tipo.id_fase,
      id_tipo: tipo.id,
      id_tese: tese.id,
      id_edital_m4: idEditalM4,
      id_contrato_m8: idContratoM8,
      palavra_chave_tema: input.tema ?? null,
      status: "rascunho",
    })
    .select("id")
    .single();

  if (erroPeca || !peca) {
    await supabase.from("mod5_tese_juridica").delete().eq("id", tese.id);
    throw new Error("Falha ao gravar a peça.");
  }

  return { id: peca.id };
}

export async function buscarPecaPorId(id: string): Promise<PecaDetalhe | null> {
  if (!REGEX_UUID.test(id)) return null;

  const supabase = createSupabaseAdminClient();

  const { data: peca, error } = await supabase
    .from("mod5_peca_juridica")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !peca) return null;

  const [faseRes, tipoRes, teseRes] = await Promise.all([
    supabase
      .from("mod5_fase_licitacao")
      .select("*")
      .eq("id", peca.id_fase)
      .single(),
    supabase
      .from("mod5_tipo_peca_juridica")
      .select("*")
      .eq("id", peca.id_tipo)
      .single(),
    peca.id_tese
      ? supabase
          .from("mod5_tese_juridica")
          .select("*")
          .eq("id", peca.id_tese)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  return {
    peca: peca as PecaJuridica,
    fase: (faseRes.data as FaseLicitacao) ?? null,
    tipo: (tipoRes.data as TipoPecaJuridica) ?? null,
    tese: (teseRes.data as TeseJuridica) ?? null,
  };
}

function campoRelacao(rel: unknown, campo: string): string | null {
  if (!rel) return null;
  const obj = Array.isArray(rel) ? rel[0] : rel;
  return (obj as Record<string, string> | null)?.[campo] ?? null;
}

export async function listarPecasGeradas(): Promise<DocumentoGerado[]> {
  const idUsuario = process.env.DEV_USER_ID;
  if (!idUsuario) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("mod5_peca_juridica")
    .select(
      "id, status, palavra_chave_tema, anexos, updated_at, tipo:mod5_tipo_peca_juridica(nome), fase:mod5_fase_licitacao(nome), tese:mod5_tese_juridica(titulo)",
    )
    .eq("id_usuario", idUsuario)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];

  return data
    .filter((p) => Array.isArray(p.anexos) && (p.anexos as unknown[]).length > 0)
    .map((p) => {
      const anexos = p.anexos as AnexoPeca[];
      const ultimo = anexos[anexos.length - 1];
      return {
        id: p.id,
        tipoNome: campoRelacao(p.tipo, "nome") ?? "Peça jurídica",
        faseNome: campoRelacao(p.fase, "nome"),
        tema: p.palavra_chave_tema,
        teseTitulo: campoRelacao(p.tese, "titulo"),
        status: p.status as StatusPeca,
        nomeArquivo: ultimo?.nome ?? null,
        atualizadoEm: p.updated_at,
      };
    });
}

export async function baixarDocumentoPeca(
  id: string,
): Promise<{ arquivo: Buffer; nome: string } | null> {
  if (!REGEX_UUID.test(id)) return null;

  const supabase = createSupabaseAdminClient();
  const { data: peca, error } = await supabase
    .from("mod5_peca_juridica")
    .select("anexos")
    .eq("id", id)
    .single();
  if (error || !peca) return null;

  const anexos = (peca.anexos as AnexoPeca[] | null) ?? [];
  const ultimo = anexos[anexos.length - 1];
  if (!ultimo?.url) return null;

  const { data, error: erroDownload } = await supabase.storage
    .from(BUCKET)
    .download(ultimo.url);
  if (erroDownload || !data) return null;

  return { arquivo: Buffer.from(await data.arrayBuffer()), nome: ultimo.nome };
}

export async function excluirPeca(id: string): Promise<void> {
  if (!REGEX_UUID.test(id)) {
    throw new Error("Peça inválida.");
  }
  const idUsuario = process.env.DEV_USER_ID;
  const supabase = createSupabaseAdminClient();

  const { data: peca, error } = await supabase
    .from("mod5_peca_juridica")
    .select("id, id_tese, anexos, id_usuario")
    .eq("id", id)
    .single();
  if (error || !peca) {
    throw new Error("Peça não encontrada.");
  }
  if (idUsuario && peca.id_usuario !== idUsuario) {
    throw new Error("Peça não pertence ao usuário.");
  }

  const anexos = (peca.anexos as AnexoPeca[] | null) ?? [];
  const paths = anexos.map((a) => a.url).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  const { error: erroPeca } = await supabase
    .from("mod5_peca_juridica")
    .delete()
    .eq("id", id);
  if (erroPeca) {
    throw new Error(`Falha ao excluir a peça: ${erroPeca.message}`);
  }

  if (peca.id_tese) {
    await supabase.from("mod5_tese_juridica").delete().eq("id", peca.id_tese);
  }
}

const TIPO_DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function salvarDocumentoPeca(params: {
  pecaId: string;
  arquivo: Buffer;
  nomeArquivo: string;
  conteudo: string;
}): Promise<{ path: string }> {
  if (!REGEX_UUID.test(params.pecaId)) {
    throw new Error("Peça inválida.");
  }
  const supabase = createSupabaseAdminClient();

  const path = `documentos-gerados/${params.pecaId}-${Date.now()}.docx`;
  const { error: erroUpload } = await supabase.storage
    .from(BUCKET)
    .upload(path, params.arquivo, { contentType: TIPO_DOCX, upsert: true });
  if (erroUpload) {
    throw new Error(`Falha ao enviar o documento: ${erroUpload.message}`);
  }

  const { data: atual } = await supabase
    .from("mod5_peca_juridica")
    .select("anexos")
    .eq("id", params.pecaId)
    .single();

  const anexosAtuais = (atual?.anexos as AnexoPeca[] | null) ?? [];
  const novoAnexo: AnexoPeca = {
    nome: params.nomeArquivo,
    tipo: TIPO_DOCX,
    url: path,
    uploaded_at: new Date().toISOString(),
  };

  const { error: erroUpdate } = await supabase
    .from("mod5_peca_juridica")
    .update({
      anexos: [...anexosAtuais, novoAnexo],
      conteudo_final: params.conteudo,
      status: "gerada",
    })
    .eq("id", params.pecaId);
  if (erroUpdate) {
    throw new Error(`Falha ao registrar o documento: ${erroUpdate.message}`);
  }

  return { path };
}
