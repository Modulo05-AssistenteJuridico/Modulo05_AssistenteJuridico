import "server-only";
import { Type, Part } from "@google/genai";
import {
  createGeminiClient,
  GEMINI_MODEL,
  GEMINI_MODEL_FALLBACK,
} from "@/lib/gemini";
import { DocumentoIA } from "@/lib/data/edital-docs";
import { LicitacaoBase, TeseSugerida } from "@/types/database";

export interface GerarTesesParams {
  tema: string;
  tipoNome?: string;
  tipoCodigo?: string;
  licitacao?: string;
  contrato?: string;
  documentos?: DocumentoIA[];
  precedentes?: LicitacaoBase[];
}

export interface GerarFundamentacaoParams {
  tema: string;
  tipoNome?: string;
  tipoCodigo?: string;
  licitacao?: string;
  contrato?: string;
  documentos?: DocumentoIA[];
  titulo: string;
  objetivo?: string;
  precedentes?: LicitacaoBase[];
}

function blocoDocumentos(documentos?: DocumentoIA[]): string {
  if (!documentos || documentos.length === 0) return "";
  const nomes = documentos.map((d) => d.nome).join(", ");
  return `\n\nDOCUMENTOS DO EDITAL\nOs documentos do edital (${nomes}) estão anexados a esta mensagem. Use-os como fonte primária de fatos: exigências, itens, datas, número do processo e cláusulas questionáveis.`;
}

function montarContents(
  prompt: string,
  documentos?: DocumentoIA[],
): string | Part[] {
  if (!documentos || documentos.length === 0) return prompt;
  const partes: Part[] = documentos.map((doc) => ({
    inlineData: { mimeType: doc.mimeType, data: doc.data },
  }));
  partes.push({ text: prompt });
  return partes;
}

function formatarPrecedentes(precedentes?: LicitacaoBase[]): string {
  if (!precedentes || precedentes.length === 0) {
    return "Não há precedentes específicos disponíveis na base; utilize seu conhecimento jurídico geral.";
  }
  return precedentes
    .map((p, i) => {
      const cabecalho = [p.orgao, p.tipo_decisao, p.numero, p.lei_referencia]
        .filter(Boolean)
        .join(" ");
      const trecho =
        p.conteudo.length > 600 ? `${p.conteudo.slice(0, 600)}...` : p.conteudo;
      return `${i + 1}. ${cabecalho ? `${cabecalho} — ` : ""}${p.titulo}\n${trecho}`;
    })
    .join("\n\n");
}

function montarContexto(p: {
  tipoNome?: string;
  tipoCodigo?: string;
  licitacao?: string;
  contrato?: string;
  tema: string;
}): string {
  return [
    p.tipoNome
      ? `Tipo de peça: ${p.tipoCodigo ? `${p.tipoCodigo}. ` : ""}${p.tipoNome}`
      : null,
    p.licitacao ? `Licitação: ${p.licitacao}` : null,
    p.contrato ? `Contrato: ${p.contrato}` : null,
    `Tema informado pelo usuário: ${p.tema}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function montarPromptTeses(p: GerarTesesParams): string {
  return `Você é um advogado especialista em licitações públicas no Brasil, regidas pela Lei nº 14.133/2021.
Com base no contexto e nos precedentes abaixo, sugira de 5 a 7 teses jurídicas distintas que possam fundamentar a peça.

CONTEXTO
${montarContexto(p)}

BASE DE PRECEDENTES
${formatarPrecedentes(p.precedentes)}${blocoDocumentos(p.documentos)}

Para cada tese, retorne:
- titulo: em caixa alta, no formato "TIPO - DESCRIÇÃO DA TESE - REQUER A HABILITAÇÃO/INABILITAÇÃO" quando aplicável;
- objetivo: frase curta começando por "Requer a Habilitação", "Requer a Inabilitação" ou objetivo equivalente, seguida de um breve resumo do argumento;
- relevancia: "Baixa", "Média" ou "Alta", conforme a força do argumento e a aderência aos precedentes.

Não escreva a fundamentação completa; ela será gerada em uma etapa posterior. Responda em português, somente com o JSON no formato do schema. Não inclua texto fora do JSON.`;
}

function montarPromptFundamentacao(p: GerarFundamentacaoParams): string {
  return `Você é um advogado especialista em licitações públicas no Brasil, regidas pela Lei nº 14.133/2021.
Escreva a fundamentação jurídica da tese abaixo em um único parágrafo objetivo, citando dispositivos legais e princípios pertinentes e aproveitando os precedentes quando aplicável.

CONTEXTO
${montarContexto(p)}

TESE
Título: ${p.titulo}${p.objetivo ? `\nObjetivo: ${p.objetivo}` : ""}

BASE DE PRECEDENTES
${formatarPrecedentes(p.precedentes)}${blocoDocumentos(p.documentos)}

Responda em português, somente com o texto da fundamentação, sem título, sem rótulos e sem JSON.`;
}

const TENTATIVAS = 2;

function statusDoErro(erro: unknown): number | undefined {
  return (erro as { status?: number } | null)?.status;
}

export async function gerarComFallback<T>(
  executar: (modelo: string) => Promise<T>,
): Promise<T> {
  const modelos = Array.from(new Set([GEMINI_MODEL, GEMINI_MODEL_FALLBACK]));
  let ultimoErro: unknown = new Error("Falha ao gerar conteúdo com a IA.");
  for (let indice = 0; indice < modelos.length; indice++) {
    const modelo = modelos[indice];
    const ultimoModelo = indice === modelos.length - 1;
    for (let tentativa = 0; tentativa < TENTATIVAS; tentativa++) {
      try {
        return await executar(modelo);
      } catch (erro) {
        ultimoErro = erro;
        const status = statusDoErro(erro);
        if (status !== 429 && status !== 500 && status !== 503) throw erro;
        if (status === 429 && !ultimoModelo) break;
        if (tentativa < TENTATIVAS - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, status === 429 ? 2000 : 500),
          );
        }
      }
    }
  }
  throw ultimoErro;
}

function interpretar(texto: string | undefined): TeseSugerida[] {
  if (!texto) throw new Error("Resposta vazia da IA.");
  const teses = JSON.parse(texto) as TeseSugerida[];
  if (!Array.isArray(teses) || teses.length === 0) {
    throw new Error("A IA não retornou teses válidas.");
  }
  return teses;
}

export async function gerarTesesIA(
  params: GerarTesesParams,
): Promise<TeseSugerida[]> {
  const ai = createGeminiClient();
  const base = {
    contents: montarContents(montarPromptTeses(params), params.documentos),
    config: {
      temperature: 0.4,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            titulo: { type: Type.STRING },
            objetivo: { type: Type.STRING },
            relevancia: {
              type: Type.STRING,
              enum: ["Baixa", "Média", "Alta"],
            },
          },
          required: ["titulo", "objetivo", "relevancia"],
          propertyOrdering: ["titulo", "objetivo", "relevancia"],
        },
      },
    },
  };

  return gerarComFallback(async (modelo) => {
    const response = await ai.models.generateContent({
      model: modelo,
      ...base,
    });
    return interpretar(response.text);
  });
}

export async function gerarFundamentacaoIA(
  params: GerarFundamentacaoParams,
): Promise<string> {
  const ai = createGeminiClient();
  const base = {
    contents: montarContents(
      montarPromptFundamentacao(params),
      params.documentos,
    ),
    config: {
      temperature: 0.4,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  return gerarComFallback(async (modelo) => {
    const response = await ai.models.generateContent({
      model: modelo,
      ...base,
    });
    const texto = response.text?.trim();
    if (!texto) throw new Error("Fundamentação vazia da IA.");
    return texto;
  });
}
