import Link from "next/link";
import { listarLicitacoes } from "@/lib/data/licitacoes";
import { listarContratos } from "@/lib/data/contratos";
import { listarTiposPeca } from "@/lib/data/tipos-peca";
import { NovaPecaForm } from "@/components/pecas/NovaPecaForm";

export const dynamic = "force-dynamic";

export default async function NovaPecaPage() {
  const [licitacoes, contratos, tipos] = await Promise.all([
    listarLicitacoes(),
    listarContratos(),
    listarTiposPeca(),
  ]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center gap-4">
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
          <h1 className="text-2xl font-bold text-slate-800">Criar nova peça</h1>
        </div>

        <NovaPecaForm
          licitacoes={licitacoes}
          contratos={contratos}
          tipos={tipos}
        />
      </div>
    </main>
  );
}
