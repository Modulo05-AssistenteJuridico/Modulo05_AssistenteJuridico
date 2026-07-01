import { NextResponse } from "next/server";
import { z } from "zod";
import { criarPeca } from "@/lib/data/pecas";

const schema = z.object({
  tipoId: z.string().min(1),
  licitacaoId: z.string().nullable().optional(),
  contratoId: z.string().nullable().optional(),
  tema: z.string().nullable().optional(),
  tese: z.object({
    titulo: z.string().min(1),
    objetivo: z.string().optional().default(""),
    relevancia: z.enum(["Baixa", "Média", "Alta"]),
    fundamentacao: z.string().optional().default(""),
  }),
});

export async function POST(req: Request) {
  let body;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  try {
    const peca = await criarPeca(body);
    return NextResponse.json(peca, { status: 201 });
  } catch (erro) {
    console.error("Falha ao criar peça:", erro);
    return NextResponse.json(
      { erro: "Não foi possível criar a peça." },
      { status: 500 },
    );
  }
}
