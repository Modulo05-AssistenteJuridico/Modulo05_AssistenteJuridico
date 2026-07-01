import { TipoPecaJuridica } from "@/types/database";

export const tiposPecaMock: TipoPecaJuridica[] = [
  {
    id: "tipo-a",
    id_fase: "fase-pre-licitacao",
    nome: "PEDIDO DE ESCLARECIMENTOS",
    codigo: "A",
    descricao: "Serve para tirar dúvidas sobre regras do edital antes da licitação.",
  },
  {
    id: "tipo-b",
    id_fase: "fase-pre-licitacao",
    nome: "IMPUGNAÇÃO AO EDITAL DE LICITAÇÃO",
    codigo: "B",
    descricao: "Serve para questionar cláusulas ilegais ou restritivas do edital.",
  },
  {
    id: "tipo-g",
    id_fase: "fase-julgamento",
    nome: "RECURSO ADMINISTRATIVO",
    codigo: "G",
    descricao: "Serve para reverter uma decisão administrativa desfavorável.",
  },
  {
    id: "tipo-h",
    id_fase: "fase-julgamento",
    nome: "CONTRARRAZÃO DE RECURSO ADMINISTRATIVO",
    codigo: "H",
    descricao: "Serve para responder ao recurso apresentado por outro licitante.",
  },
  {
    id: "tipo-p",
    id_fase: "fase-contratual",
    nome: "PEDIDO DE PAGAMENTO",
    codigo: "P",
    descricao: "Serve para requerer pagamento devido pela Administração.",
  },
  {
    id: "tipo-e",
    id_fase: "fase-contratual",
    nome: "PEDIDO DE REEQUILÍBRIO ECONÔMICO-FINANCEIRO",
    codigo: "E",
    descricao: "Serve para restabelecer o equilíbrio do contrato diante de fatos imprevisíveis.",
  },
  {
    id: "tipo-d",
    id_fase: "fase-contratual",
    nome: "DEFESA PRÉVIA",
    codigo: "D",
    descricao: "Serve para se defender de notificação de descumprimento contratual.",
  },
  {
    id: "tipo-r",
    id_fase: "fase-contratual",
    nome: "PEDIDO DE REAJUSTE",
    codigo: "R",
    descricao: "Serve para atualizar o valor do contrato conforme o índice previsto.",
  },
  {
    id: "tipo-c",
    id_fase: "fase-contratual",
    nome: "PEDIDO DE RECONSIDERAÇÃO",
    codigo: "C",
    descricao: "Serve para pedir a revisão de uma decisão administrativa na fase contratual.",
  },
];
