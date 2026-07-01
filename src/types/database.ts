export type NomeFase = "Pré-licitação" | "Julgamento" | "Contratual";

export type Relevancia = "Baixa" | "Média" | "Alta";

export type FonteDadosSessao = "api_gov" | "upload_manual";

export type StatusPeca =
  | "rascunho"
  | "gerada"
  | "baixada"
  | "aguardando_julgamento"
  | "julgada";

export type StatusNotificacao =
  | "recebida"
  | "em_defesa"
  | "defesa_enviada"
  | "julgada";

export interface FaseLicitacao {
  id: string;
  nome: NomeFase;
  descricao: string | null;
}

export interface TipoPecaJuridica {
  id: string;
  id_fase: string;
  nome: string;
  codigo: string | null;
  descricao: string | null;
}

export interface TeseJuridica {
  id: string;
  titulo: string;
  objetivo: string | null;
  relevancia: Relevancia | null;
  fundamentacao: string | null;
  created_at: string;
}

export interface LicitacaoBase {
  id: string;
  titulo: string;
  orgao: string | null;
  tipo_decisao: string | null;
  numero: string | null;
  lei_referencia: string | null;
  data_decisao: string | null;
  conteudo: string;
  fonte: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParticipanteSessao {
  cnpj: string;
  razao_social: string;
  status: string;
  motivo: string | null;
}

export interface SessaoJulgamento {
  id: string;
  id_edital_m4: string;
  data_sessao: string | null;
  pregoeiro: string | null;
  vencedor_cnpj: string | null;
  vencedor_razao_social: string | null;
  valor_vencedor: number | null;
  decisao: string | null;
  participantes: ParticipanteSessao[] | null;
  fonte_dados: FonteDadosSessao;
  arquivo_ata_url: string | null;
  created_at: string;
}

export interface NotificacaoContratual {
  id: string;
  id_contrato_m8: string;
  id_usuario: string;
  tipo: string | null;
  data_recebimento: string | null;
  prazo_defesa: string | null;
  descricao: string | null;
  arquivo_url: string | null;
  status: StatusNotificacao;
  created_at: string;
}

export interface AnexoPeca {
  nome: string;
  tipo: string;
  url: string;
  uploaded_at: string;
}

export interface PecaJuridica {
  id: string;
  id_usuario: string;
  id_fase: string;
  id_tipo: string;
  id_tese: string | null;
  id_edital_m4: string | null;
  id_sessao: string | null;
  id_contrato_m8: string | null;
  id_notificacao: string | null;
  palavra_chave_tema: string | null;
  anexos: AnexoPeca[];
  conteudo_final: string | null;
  status: StatusPeca;
  created_at: string;
  updated_at: string;
}

export interface HistoricoPecaJuridica {
  id: string;
  id_peca: string;
  versao: number;
  conteudo: string;
  alterado_por: string | null;
  created_at: string;
}

export interface TeseSugerida {
  titulo: string;
  objetivo: string;
  relevancia: Relevancia;
  fundamentacao?: string;
}

export interface DocumentoGerado {
  id: string;
  tipoNome: string;
  faseNome: string | null;
  tema: string | null;
  teseTitulo: string | null;
  status: StatusPeca;
  nomeArquivo: string | null;
  atualizadoEm: string;
}
