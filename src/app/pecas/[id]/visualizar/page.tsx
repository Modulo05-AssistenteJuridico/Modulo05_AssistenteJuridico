import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { baixarDocumentoPeca } from "@/lib/data/pecas";
import { lerDocumentoXml, parsearDocumento } from "@/lib/data/modelos";
import type { RunModelo } from "@/lib/data/modelos";

export const dynamic = "force-dynamic";

function estiloRun(run: RunModelo): CSSProperties {
  const estilo: CSSProperties = {};
  if (run.negrito) estilo.fontWeight = 700;
  if (run.italico) estilo.fontStyle = "italic";
  if (run.sublinhado) estilo.textDecoration = "underline";
  if (run.tamanho) estilo.fontSize = `${run.tamanho}pt`;
  return estilo;
}

export default async function VisualizarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const documento = await baixarDocumentoPeca(id);
  if (!documento) notFound();

  let blocos = null;
  try {
    const xml = await lerDocumentoXml(documento.arquivo);
    blocos = parsearDocumento(xml).blocos;
  } catch {
    blocos = null;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
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
        </div>

        <h1 className="mt-3 text-2xl font-bold text-slate-800">
          {documento.nome.replace(/\.docx$/i, "")}
        </h1>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {blocos ? (
            <div className="mx-6 my-4 rounded-lg border border-slate-200 bg-white p-6 font-serif text-[12pt] leading-relaxed text-slate-800 sm:p-10">
              {blocos.map((bloco, i) => (
                <p
                  key={i}
                  style={{ textAlign: bloco.alinhamento }}
                  className={bloco.runs.length ? "mb-3" : "h-3"}
                >
                  {bloco.runs.map((run, j) => (
                    <span key={j} style={estiloRun(run)}>
                      {run.texto}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              Não foi possível carregar a visualização deste documento.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
