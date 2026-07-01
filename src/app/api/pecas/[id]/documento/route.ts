import { NextResponse } from "next/server";
import { z } from "zod";
import {
  baixarDocumentoPeca,
  buscarPecaPorId,
  salvarDocumentoPeca,
} from "@/lib/data/pecas";
import {
  aplicarValores,
  arquivoModeloParaTipo,
  baixarModelo,
  extrairTexto,
  lerDocumentoXml,
  regravarDocx,
  removerRealce,
} from "@/lib/data/modelos";

const TIPO_DOCX =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const schema = z.object({
  valores: z.record(z.string(), z.string()),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const documento = await baixarDocumentoPeca(id);
  if (!documento) {
    return NextResponse.json(
      { erro: "Documento não encontrado." },
      { status: 404 },
    );
  }

  const nomeAscii = documento.nome.replace(/[^\x20-\x7E]/g, "_");
  return new NextResponse(new Uint8Array(documento.arquivo), {
    headers: {
      "Content-Type": TIPO_DOCX,
      "Content-Disposition": `inline; filename="${nomeAscii}"; filename*=UTF-8''${encodeURIComponent(
        documento.nome,
      )}`,
    },
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const detalhe = await buscarPecaPorId(id);
  if (!detalhe || !detalhe.tipo) {
    return NextResponse.json({ erro: "Peça não encontrada." }, { status: 404 });
  }
  const arquivo = arquivoModeloParaTipo(detalhe.tipo);
  if (!arquivo) {
    return NextResponse.json(
      { erro: "Tipo de peça sem modelo." },
      { status: 422 },
    );
  }

  try {
    const valores: Record<number, string> = {};
    for (const [chave, valor] of Object.entries(body.valores)) {
      valores[Number(chave)] = valor;
    }

    const buf = await baixarModelo(arquivo);
    const xml = await lerDocumentoXml(buf);
    const novoXml = removerRealce(aplicarValores(xml, valores));
    const docx = await regravarDocx(buf, novoXml);
    const conteudo = extrairTexto(novoXml);

    const { path } = await salvarDocumentoPeca({
      pecaId: id,
      arquivo: docx,
      nomeArquivo: `${detalhe.tipo.nome}.docx`,
      conteudo,
    });
    return NextResponse.json({ path });
  } catch (erro) {
    console.error("Falha ao salvar documento:", erro);
    return NextResponse.json(
      { erro: "Não foi possível salvar o documento." },
      { status: 500 },
    );
  }
}
