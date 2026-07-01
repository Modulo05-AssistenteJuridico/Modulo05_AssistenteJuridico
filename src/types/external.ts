export interface Licitacao {
  id: string;
  orgao: string;
  objeto: string;
  docs: string[];
}

export interface Contrato {
  id: string;
  numero: string;
  orgao: string;
  objeto: string;
  fornecedor: string;
  cnpj: string;
  valor: number;
  vigencia_inicio: string;
  vigencia_fim: string;
}
