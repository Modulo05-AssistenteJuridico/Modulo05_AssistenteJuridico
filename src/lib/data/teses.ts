import { TeseSugerida } from "@/types/database";
import { tesesMock } from "@/lib/mock/teses";

export interface GerarTesesInput {
  tema: string;
  tipoNome?: string;
  tipoCodigo?: string;
  licitacao?: string;
  licitacaoId?: string;
  contrato?: string;
}

export async function gerarTeses(
  input: GerarTesesInput,
): Promise<TeseSugerida[]> {
  if (!input.tema.trim()) return [];

  try {
    const resposta = await fetch("/api/pecas/gerar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!resposta.ok) throw new Error("Falha na requisição de teses.");
    const dados = (await resposta.json()) as { teses: TeseSugerida[] };
    return dados.teses;
  } catch {
    return tesesMock;
  }
}

export interface GerarFundamentacaoInput {
  tema: string;
  tipoNome?: string;
  tipoCodigo?: string;
  licitacao?: string;
  licitacaoId?: string;
  contrato?: string;
  titulo: string;
  objetivo?: string;
}

export async function gerarFundamentacao(
  input: GerarFundamentacaoInput,
): Promise<string> {
  try {
    const resposta = await fetch("/api/pecas/fundamentar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!resposta.ok) throw new Error("Falha ao gerar fundamentação.");
    const dados = (await resposta.json()) as { fundamentacao: string };
    return dados.fundamentacao;
  } catch {
    return "";
  }
}
