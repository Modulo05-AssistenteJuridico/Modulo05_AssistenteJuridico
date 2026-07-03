"use client";

import { useState } from "react";
import { Relevancia, TeseSugerida } from "@/types/database";

export const corRelevancia: Record<Relevancia, string> = {
  Baixa: "bg-amber-100 text-amber-700",
  Média: "bg-sky-100 text-sky-700",
  Alta: "bg-emerald-100 text-emerald-700",
};

interface TeseCardProps {
  tese: TeseSugerida;
  selecionada: boolean;
  onSelecionar: () => void;
  onAbrir?: () => void;
  carregandoFundamentacao?: boolean;
}

export function TeseCard({
  tese,
  selecionada,
  onSelecionar,
  onAbrir,
  carregandoFundamentacao = false,
}: TeseCardProps) {
  const [aberto, setAberto] = useState(false);

  function alternar() {
    const proximo = !aberto;
    setAberto(proximo);
    if (proximo) onAbrir?.();
  }

  return (
    <div
      className={`rounded-lg border transition-colors ${
        selecionada
          ? "border-blue-500 bg-blue-50/50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={selecionada}
          onChange={onSelecionar}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
        />
        <button
          type="button"
          onClick={onSelecionar}
          className="flex-1 cursor-pointer text-left"
        >
          <p className="text-sm font-semibold leading-snug text-slate-800">
            {tese.titulo}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-semibold text-blue-700">Objetivo: </span>
            {tese.objetivo}
          </p>
        </button>
        <span
          className={`shrink-0 rounded-md px-2.5 py-0.5 text-xs font-semibold ${corRelevancia[tese.relevancia] ?? "bg-slate-100 text-slate-600"}`}
        >
          {tese.relevancia}
        </span>
        <button
          type="button"
          onClick={alternar}
          aria-label="Ver fundamentação"
          className="shrink-0 cursor-pointer text-blue-600"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-5 w-5 transition-transform ${aberto ? "rotate-180" : ""}`}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {aberto && (
        <div className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600">
          {carregandoFundamentacao
            ? "Gerando fundamentação..."
            : tese.fundamentacao
              ? tese.fundamentacao
              : "Não foi possível carregar a fundamentação."}
        </div>
      )}
    </div>
  );
}
