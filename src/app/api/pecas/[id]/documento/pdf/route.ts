import { NextResponse } from "next/server";
import { baixarDocumentoPeca } from "@/lib/data/pecas";
import { lerDocumentoXml, parsearDocumento } from "@/lib/data/modelos";
import { gerarPdf } from "@/lib/data/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  let blocos;
  try {
    const xml = await lerDocumentoXml(documento.arquivo);
    blocos = parsearDocumento(xml).blocos;
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível ler o documento." },
      { status: 500 },
    );
  }

  const pdf = await gerarPdf(blocos);
  const nomePdf = documento.nome.replace(/\.docx$/i, "") + ".pdf";
  const nomeAscii = nomePdf.replace(/[^\x20-\x7E]/g, "_");

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeAscii}"; filename*=UTF-8''${encodeURIComponent(
        nomePdf,
      )}`,
    },
  });
}
