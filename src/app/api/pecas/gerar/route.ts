import { NextResponse } from "next/server";
import { z } from "zod";
import { gerarTesesIA } from "@/lib/ai/gerar-teses";
import { buscarPrecedentes } from "@/lib/data/licitacoes-base";
import { buscarEditalPorId } from "@/lib/data/licitacoes";
import { baixarDocumentosEdital } from "@/lib/data/edital-docs";
import { tesesMock } from "@/lib/mock/teses";

const schema = z.object({
  tema: z.string().min(1),
  tipoNome: z.string().optional(),
  tipoCodigo: z.string().optional(),
  licitacao: z.string().optional(),
  licitacaoId: z.string().optional(),
  contrato: z.string().optional(),
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
    const teses = await gerarTesesIA({ ...body, precedentes, documentos });
    return NextResponse.json({
      teses,
      fonte: "ia",
      precedentes: precedentes.length,
      documentos: documentos.length,
    });
  } catch (erro) {
    console.error("Falha ao gerar teses com a IA, usando mock:", erro);
    return NextResponse.json({ teses: tesesMock, fonte: "mock" });
  }
}
