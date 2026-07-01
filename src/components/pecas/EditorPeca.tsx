"use client";

import {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { BlocoModelo, RunModelo } from "@/lib/data/modelos";

interface EditorPecaProps {
  pecaId: string;
  blocos: BlocoModelo[];
}

function estiloRun(run: RunModelo): CSSProperties {
  const estilo: CSSProperties = {};
  if (run.negrito) estilo.fontWeight = 700;
  if (run.italico) estilo.fontStyle = "italic";
  if (run.sublinhado) estilo.textDecoration = "underline";
  if (run.tamanho) estilo.fontSize = `${run.tamanho}pt`;
  return estilo;
}

export function EditorPeca({ pecaId, blocos }: EditorPecaProps) {
  const router = useRouter();
  const refs = useRef<Record<number, HTMLSpanElement | null>>({});
  const [valoresIA, setValoresIA] = useState<Record<number, string> | null>(
    null,
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregado = valoresIA !== null;

  const valoresFinais = useMemo(() => {
    const mapa: Record<number, string> = {};
    for (const bloco of blocos) {
      for (const run of bloco.runs) {
        if (run.campoId !== null) {
          mapa[run.campoId] = valoresIA?.[run.campoId] ?? run.texto;
        }
      }
    }
    return mapa;
  }, [blocos, valoresIA]);

  useEffect(() => {
    let ativo = true;
    async function preencher() {
      try {
        const resposta = await fetch(`/api/pecas/${pecaId}/preencher`, {
          method: "POST",
        });
        const dados = (await resposta.json()) as {
          valores?: Record<string, string>;
        };
        if (!ativo) return;
        const mapa: Record<number, string> = {};
        for (const [id, valor] of Object.entries(dados.valores ?? {})) {
          mapa[Number(id)] = valor;
        }
        setValoresIA(mapa);
      } catch {
        if (!ativo) return;
        setErro("Não foi possível preencher com a IA; preencha manualmente.");
        setValoresIA({});
      }
    }
    preencher();
    return () => {
      ativo = false;
    };
  }, [pecaId]);

  useLayoutEffect(() => {
    if (!carregado) return;
    for (const [id, texto] of Object.entries(valoresFinais)) {
      const el = refs.current[Number(id)];
      if (el && el.textContent !== texto) el.textContent = texto;
    }
  }, [carregado, valoresFinais]);

  function coletarValores(): Record<string, string> {
    const valores: Record<string, string> = {};
    for (const bloco of blocos) {
      for (const run of bloco.runs) {
        if (run.campoId !== null) {
          valores[String(run.campoId)] =
            refs.current[run.campoId]?.textContent ?? "";
        }
      }
    }
    return valores;
  }

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/pecas/${pecaId}/documento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valores: coletarValores() }),
      });
      if (!resposta.ok) throw new Error("Falha ao salvar.");
      sessionStorage.setItem("toast", "Documento salvo com sucesso.");
      router.push("/");
    } catch {
      setErro("Não foi possível salvar o documento. Tente novamente.");
      setSalvando(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
            2
          </span>
          <h2 className="text-base font-semibold text-slate-800">
            Visualizar peça
          </h2>
        </div>
      </div>

      {!carregado ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <p className="text-sm text-slate-500">
            Gerando o documento com a IA...
          </p>
        </div>
      ) : (
        <>
          <p className="px-6 pt-4 text-sm text-slate-500">
            Os campos destacados são editáveis. A IA preencheu o que foi
            possível com a tese escolhida; o restante ficou marcado para você
            completar.
          </p>

          <div className="mx-6 my-4 rounded-lg border border-slate-200 bg-white p-6 font-serif text-[12pt] leading-relaxed text-slate-800 sm:p-10">
            {blocos.map((bloco, i) => (
              <p
                key={i}
                style={{ textAlign: bloco.alinhamento }}
                className={bloco.runs.length ? "mb-3" : "h-3"}
              >
                {bloco.runs.map((run, j) => {
                  if (run.campoId === null) {
                    return (
                      <span key={j} style={estiloRun(run)}>
                        {run.texto}
                      </span>
                    );
                  }
                  const idCampo = run.campoId;
                  return (
                    <span key={j} className="whitespace-pre-wrap">
                      <span className="select-none font-semibold text-slate-400">
                        [
                      </span>
                      <span
                        ref={(el) => {
                          refs.current[idCampo] = el;
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        style={estiloRun(run)}
                        className={`mx-0.5 rounded px-1 outline-none focus:ring-2 focus:ring-blue-300 ${
                          run.realce
                            ? "bg-yellow-100 focus:bg-yellow-50"
                            : "bg-blue-50 text-blue-900 focus:bg-white"
                        }`}
                      />
                      <span className="select-none font-semibold text-slate-400">
                        ]
                      </span>
                    </span>
                  );
                })}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
            {erro && (
              <span className="mr-auto text-sm text-red-600">{erro}</span>
            )}
            <button
              type="button"
              disabled={salvando}
              onClick={handleSalvar}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {salvando && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {salvando ? "Salvando..." : "Salvar documento"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
