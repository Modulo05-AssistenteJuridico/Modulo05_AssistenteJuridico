import { NextResponse } from "next/server";
import { baixarDocumentoPeca } from "@/lib/data/pecas";

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

  const nomeDocx = documento.nome.replace(/\.docx$/i, "") + ".docx";
  const nomeAscii = nomeDocx.replace(/[^\x20-\x7E]/g, "_");

  return new NextResponse(new Uint8Array(documento.arquivo), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${nomeAscii}"; filename*=UTF-8''${encodeURIComponent(
        nomeDocx,
      )}`,
    },
  });
}
