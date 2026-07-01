import { NextResponse } from "next/server";
import { z } from "zod";
import { gerarFundamentacaoIA } from "@/lib/ai/gerar-teses";
import { buscarPrecedentes } from "@/lib/data/licitacoes-base";
import { buscarEditalPorId } from "@/lib/data/licitacoes";
import { baixarDocumentosEdital } from "@/lib/data/edital-docs";

const schema = z.object({
  tema: z.string().min(1),
  tipoNome: z.string().optional(),
  tipoCodigo: z.string().optional(),
  licitacao: z.string().optional(),
  licitacaoId: z.string().optional(),
  contrato: z.string().optional(),
  titulo: z.string().min(1),
  objetivo: z.string().optional().default(""),
});

export async function POST(req: Request) {
  let body;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  try {
    const [precedentes, edital] = await Promise.all([
      buscarPrecedentes(body.tema),
      body.licitacaoId
        ? buscarEditalPorId(body.licitacaoId)
        : Promise.resolve(null),
    ]);
    const documentos = await baixarDocumentosEdital(edital?.docs);
    const fundamentacao = await gerarFundamentacaoIA({
      ...body,
      precedentes,
      documentos,
    });
    return NextResponse.json({ fundamentacao });
  } catch (erro) {
    console.error("Falha ao gerar fundamentação:", erro);
    return NextResponse.json(
      { erro: "Não foi possível gerar a fundamentação." },
      { status: 500 },
    );
  }
}
