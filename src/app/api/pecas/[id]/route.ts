import { NextResponse } from "next/server";
import { excluirPeca } from "@/lib/data/pecas";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await excluirPeca(id);
    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error("Falha ao excluir peça:", erro);
    return NextResponse.json(
      { erro: "Não foi possível excluir a peça." },
      { status: 500 },
    );
  }
}
