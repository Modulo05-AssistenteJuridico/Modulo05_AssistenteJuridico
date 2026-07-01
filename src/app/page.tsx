import { listarPecasGeradas } from "@/lib/data/pecas";
import { ListaDocumentos } from "@/components/pecas/ListaDocumentos";
import { BotaoNovaPeca } from "@/components/pecas/BotaoNovaPeca";

export const dynamic = "force-dynamic";

export default async function Home() {
  const documentos = await listarPecasGeradas();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Documentos gerados
            </h2>
            <BotaoNovaPeca />
          </div>
          <ListaDocumentos documentos={documentos} />
        </section>
      </div>
    </main>
  );
}
