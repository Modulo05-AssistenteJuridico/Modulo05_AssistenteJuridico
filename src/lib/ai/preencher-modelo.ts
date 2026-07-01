import "server-only";
import { Type, Part } from "@google/genai";
import { createGeminiClient } from "@/lib/gemini";
import { gerarComFallback } from "@/lib/ai/gerar-teses";
import { CampoModelo } from "@/lib/data/modelos";
import { DocumentoIA } from "@/lib/data/edital-docs";

export interface PreencherModeloParams {
  campos: CampoModelo[];
  tipoNome?: string;
  tema?: string | null;
  tese?: {
    titulo?: string | null;
    objetivo?: string | null;
    fundamentacao?: string | null;
  } | null;
  edital?: {
    orgao?: string | null;
    objeto?: string | null;
  } | null;
  contrato?: {
    numero?: string | null;
    orgao?: string | null;
    objeto?: string | null;
    fornecedor?: string | null;
    cnpj?: string | null;
    valor?: number | null;
    vigenciaInicio?: string | null;
    vigenciaFim?: string | null;
  } | null;
  empresa?: {
    nome?: string | null;
    cnpj?: string | null;
    detalhes?: string | null;
  } | null;
  documentos?: DocumentoIA[];
}

export async function preencherCamposIA(
  params: PreencherModeloParams,
): Promise<Record<number, string>> {
  if (params.campos.length === 0) return {};
  const ai = createGeminiClient();

  const listaCampos = params.campos
    .map(
      (c) =>
        `- id ${c.id}${c.realce ? " [SEÇÃO ARGUMENTATIVA]" : ""}: "${c.original}"`,
    )
    .join("\n");

  const contexto = [
    params.tipoNome ? `Tipo de peça: ${params.tipoNome}` : null,
    params.tema ? `Tema: ${params.tema}` : null,
    params.edital?.orgao ? `Edital - órgão/contratante: ${params.edital.orgao}` : null,
    params.edital?.objeto ? `Edital - objeto: ${params.edital.objeto}` : null,
    params.contrato?.numero ? `Contrato - número: ${params.contrato.numero}` : null,
    params.contrato?.orgao
      ? `Contrato - órgão contratante: ${params.contrato.orgao}`
      : null,
    params.contrato?.objeto ? `Contrato - objeto: ${params.contrato.objeto}` : null,
    params.contrato?.fornecedor
      ? `Contrato - contratada/razão social: ${params.contrato.fornecedor}`
      : null,
    params.contrato?.cnpj ? `Contrato - CNPJ da contratada: ${params.contrato.cnpj}` : null,
    params.contrato?.valor
      ? `Contrato - valor global: R$ ${params.contrato.valor.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : null,
    params.contrato?.vigenciaInicio && params.contrato?.vigenciaFim
      ? `Contrato - vigência: ${params.contrato.vigenciaInicio} a ${params.contrato.vigenciaFim}`
      : null,
    params.empresa?.nome
      ? `Empresa fornecedora - razão social: ${params.empresa.nome}`
      : null,
    params.empresa?.cnpj
      ? `Empresa fornecedora - CNPJ: ${params.empresa.cnpj}`
      : null,
    params.empresa?.detalhes
      ? `Empresa fornecedora - detalhes: ${params.empresa.detalhes}`
      : null,
    params.tese?.titulo ? `Tese - título: ${params.tese.titulo}` : null,
    params.tese?.objetivo ? `Tese - objetivo: ${params.tese.objetivo}` : null,
    params.tese?.fundamentacao
      ? `Tese - fundamentação: ${params.tese.fundamentacao}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const notaDocs =
    params.documentos && params.documentos.length > 0
      ? `\n\nDOCUMENTOS DO EDITAL\nOs documentos do edital (${params.documentos
          .map((d) => d.nome)
          .join(
            ", ",
          )}) estão anexados a esta mensagem. Extraia deles os dados factuais reais (número do processo/edital, datas, itens, órgão, exigências) para preencher os campos correspondentes.`
      : "";

  const prompt = `Você é um advogado especialista em licitações públicas (Lei nº 14.133/2021) preenchendo um modelo de peça jurídica.
Cada campo abaixo é um trecho do documento a preencher. Os marcados com [SEÇÃO ARGUMENTATIVA] são as partes jurídicas centrais (fatos, direito, pedidos) e devem ser redigidos em texto corrido, fundamentados na tese fornecida.

DADOS DISPONÍVEIS
${contexto || "Nenhum dado de contexto além do modelo."}${notaDocs}

CAMPOS
${listaCampos}

Regras:
- O texto entre aspas de cada campo descreve EXATAMENTE o que aquele campo deve conter; siga essa instrução específica em cada um.
- Campos [SEÇÃO ARGUMENTATIVA]: redija o conteúdo jurídico aproveitando a tese (título, objetivo e fundamentação).
- NUNCA repita o mesmo conteúdo em mais de um campo. Cada campo deve ter texto próprio, distinto e complementar aos demais (ex.: a narrativa dos fatos é diferente da fundamentação jurídica, que é diferente dos pedidos). Não reescreva em um campo o que já foi dito em outro.
- Campos factuais: use a razão social da empresa SOMENTE no campo da própria empresa/licitante/recorrente (placeholder tipo "ABC" ou "razão social"); o CNPJ só no campo de CNPJ; o órgão do edital no campo do órgão destinatário/contratante; o objeto do edital no campo de descritivo/objeto/item.
- NÃO use a razão social em campos de nome de PESSOA — pregoeiro, representante legal, signatário (placeholders como "Fulano de Tal", "(incluir o nome, se houver)"); esses dados não existem, então omita esses campos.
- NÃO invente dados que não estejam no contexto (datas, número do processo/edital, nome do representante legal, RG, CPF, endereço completo se não constar nos detalhes da empresa); nesses casos, omita o campo da resposta.
- Responda em português e retorne apenas os campos que você efetivamente preencheu, no formato do schema (lista de {id, valor}).`;

  const partes: Part[] = [{ text: prompt }];
  for (const doc of params.documentos ?? []) {
    partes.push({ inlineData: { mimeType: doc.mimeType, data: doc.data } });
  }

  const base = {
    contents: partes,
    config: {
      temperature: 0.4,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            valor: { type: Type.STRING },
          },
          required: ["id", "valor"],
          propertyOrdering: ["id", "valor"],
        },
      },
    },
  };

  const itens = await gerarComFallback(async (modelo) => {
    const response = await ai.models.generateContent({
      model: modelo,
      ...base,
    });
    const texto = response.text;
    if (!texto) throw new Error("Resposta vazia da IA.");
    const arr = JSON.parse(texto) as { id: number; valor: string }[];
    if (!Array.isArray(arr)) throw new Error("Formato inválido da IA.");
    return arr;
  });

  const mapa: Record<number, string> = {};
  for (const item of itens) {
    if (
      typeof item.id === "number" &&
      typeof item.valor === "string" &&
      item.valor.trim()
    ) {
      mapa[item.id] = item.valor;
    }
  }
  return mapa;
}
