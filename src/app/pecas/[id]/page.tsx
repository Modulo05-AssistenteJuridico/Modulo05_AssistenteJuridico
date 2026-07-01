import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarPecaPorId } from "@/lib/data/pecas";
import {
  arquivoModeloParaTipo,
  baixarModelo,
  lerDocumentoXml,
  parsearDocumento,
} from "@/lib/data/modelos";
import { EditorPeca } from "@/components/pecas/EditorPeca";

export const dynamic = "force-dynamic";

export default async function PecaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detalhe = await buscarPecaPorId(id);
  if (!detalhe || !detalhe.tipo) notFound();

  const arquivo = arquivoModeloParaTipo(detalhe.tipo);
  let blocos = null;
  if (arquivo) {
    try {
      const buf = await baixarModelo(arquivo);
      const xml = await lerDocumentoXml(buf);
      blocos = parsearDocumento(xml).blocos;
    } catch {
      blocos = null;
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/pecas/nova"
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.24a.75.75 0 0 1 0-1.06l4.25-4.24a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
          Voltar
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-800">
          {detalhe.tipo.nome}
        </h1>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {blocos ? (
            <EditorPeca pecaId={id} blocos={blocos} />
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              {arquivo
                ? "Não foi possível carregar o modelo deste tipo de peça."
                : "Ainda não há um modelo disponível para este tipo de peça."}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
