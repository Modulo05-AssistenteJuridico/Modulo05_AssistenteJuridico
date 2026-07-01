"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Contrato, Licitacao } from "@/types/external";
import { Relevancia, TeseSugerida, TipoPecaJuridica } from "@/types/database";
import { gerarTeses, gerarFundamentacao } from "@/lib/data/teses";
import {
  formatarContratoParaIA,
  rotuloContrato,
  tipoExigeContrato,
} from "@/lib/tipo-peca-contrato";
import { TeseCard, corRelevancia } from "@/components/pecas/TeseCard";
import { Dropdown } from "@/components/ui/Dropdown";

interface NovaPecaFormProps {
  licitacoes: Licitacao[];
  contratos: Contrato[];
  tipos: TipoPecaJuridica[];
}

function rotuloTema(tipo: TipoPecaJuridica | undefined): string {
  if (tipo?.codigo === "B") return "Digite o tema para a impugnação ao edital.";
  if (tipo?.codigo === "G") return "Digite o tema sobre o qual deseja recorrer.";
  if (tipo?.codigo === "H") return "Digite o tema da contrarrazão.";
  return "Digite o tema ou as palavras-chave da peça.";
}

const classeCampo =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

const ORDEM_RELEVANCIA: Record<Relevancia, number> = {
  Alta: 0,
  Média: 1,
  Baixa: 2,
};

const LEGENDA_RELEVANCIA: { nivel: Relevancia; descricao: string }[] = [
  { nivel: "Alta", descricao: "forte e aderente ao caso" },
  { nivel: "Média", descricao: "intermediário, com ressalvas" },
  { nivel: "Baixa", descricao: "fraco ou pouco aderente" },
];

function ordenarPorRelevancia(teses: TeseSugerida[]): TeseSugerida[] {
  return [...teses].sort(
    (a, b) =>
      (ORDEM_RELEVANCIA[a.relevancia] ?? 99) -
      (ORDEM_RELEVANCIA[b.relevancia] ?? 99),
  );
}

export function NovaPecaForm({
  licitacoes,
  contratos,
  tipos,
}: NovaPecaFormProps) {
  const router = useRouter();
  const [licitacaoId, setLicitacaoId] = useState("");
  const [tipoId, setTipoId] = useState("");
  const [contratoId, setContratoId] = useState("");
  const [baseEm, setBaseEm] = useState<"palavras" | "documento">("palavras");
  const [tema, setTema] = useState("");
  const [teses, setTeses] = useState<TeseSugerida[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [carregandoFund, setCarregandoFund] = useState<number | null>(null);
  const [criando, setCriando] = useState(false);
  const [erroCriar, setErroCriar] = useState<string | null>(null);

  const tipoSelecionado = tipos.find((t) => t.id === tipoId);
  const licitacaoSelecionada = licitacoes.find((l) => l.id === licitacaoId);
  const precisaContrato = tipoExigeContrato(tipoSelecionado);
  const contratoSelecionado = precisaContrato
    ? contratos.find((c) => c.id === contratoId)
    : undefined;
  const podeSugerir = tema.trim().length > 0 && !carregando;
  const teseEscolhida =
    selecionada !== null && teses ? teses[selecionada] : null;
  const podeCriar = teseEscolhida !== null && tipoId.length > 0 && !criando;

  function handleTipoChange(valor: string) {
    setTipoId(valor);
    const novo = tipos.find((t) => t.id === valor);
    if (!tipoExigeContrato(novo)) setContratoId("");
  }

  function contextoFundamentacao() {
    return {
      tema,
      tipoNome: tipoSelecionado?.nome,
      tipoCodigo: tipoSelecionado?.codigo ?? undefined,
      licitacao: licitacaoSelecionada
        ? `${licitacaoSelecionada.orgao} — ${licitacaoSelecionada.objeto}`
        : undefined,
      licitacaoId: licitacaoId || undefined,
      contrato: contratoSelecionado
        ? formatarContratoParaIA(contratoSelecionado)
        : undefined,
    };
  }

  async function handleSugerir() {
    setCarregando(true);
    setErroCriar(null);
    setSelecionada(null);
    setCarregandoFund(null);
    setTeses(null);
    const resultado = await gerarTeses(contextoFundamentacao());
    setTeses(ordenarPorRelevancia(resultado));
    setCarregando(false);
  }

  async function carregarFundamentacao(indice: number) {
    if (!teses) return;
    const alvo = teses[indice];
    if (!alvo || alvo.fundamentacao || carregandoFund === indice) return;
    setCarregandoFund(indice);
    const texto = await gerarFundamentacao({
      ...contextoFundamentacao(),
      titulo: alvo.titulo,
      objetivo: alvo.objetivo,
    });
    setTeses((atual) =>
      atual
        ? atual.map((t, i) =>
            i === indice ? { ...t, fundamentacao: texto } : t,
          )
        : atual,
    );
    setCarregandoFund(null);
  }

  async function handleCriar() {
    if (!teseEscolhida || !tipoId) return;
    setCriando(true);
    setErroCriar(null);
    try {
      let fundamentacao = teseEscolhida.fundamentacao;
      if (!fundamentacao) {
        fundamentacao = await gerarFundamentacao({
          ...contextoFundamentacao(),
          titulo: teseEscolhida.titulo,
          objetivo: teseEscolhida.objetivo,
        });
      }
      const resposta = await fetch("/api/pecas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoId,
          licitacaoId: licitacaoId || null,
          contratoId: precisaContrato && contratoId ? contratoId : null,
          tema: tema.trim() || null,
          tese: { ...teseEscolhida, fundamentacao },
        }),
      });
      if (!resposta.ok) throw new Error("Falha ao criar a peça.");
      const { id } = (await resposta.json()) as { id: string };
      router.push(`/pecas/${id}`);
    } catch {
      setErroCriar("Não foi possível criar a peça. Tente novamente.");
      setCriando(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
          1
        </span>
        <h2 className="text-base font-semibold text-slate-800">
          Informações para criar a peça
        </h2>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">
            Licitação
          </label>
          <Dropdown
            value={licitacaoId}
            onChange={setLicitacaoId}
            placeholder="Selecionar licitação"
            options={licitacoes.map((l) => ({
              value: l.id,
              label: `${l.orgao} — ${l.objeto.length > 80 ? `${l.objeto.slice(0, 80)}…` : l.objeto}`,
            }))}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">
            Tipo de peça jurídica
          </label>
          <Dropdown
            value={tipoId}
            onChange={handleTipoChange}
            placeholder="Selecionar tipo"
            options={tipos.map((t) => ({
              value: t.id,
              label: `${t.codigo ? `${t.codigo}. ` : ""}${t.nome}`,
            }))}
          />
          {tipoSelecionado?.descricao && (
            <p className="mt-1.5 text-sm text-slate-500">
              {tipoSelecionado.descricao}
            </p>
          )}
        </div>

        {precisaContrato && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">
              Contrato
            </label>
            <Dropdown
              value={contratoId}
              onChange={setContratoId}
              placeholder="Selecionar contrato"
              options={contratos.map((c) => ({
                value: c.id,
                label: rotuloContrato(c),
              }))}
            />
            <p className="mt-1.5 text-sm text-slate-500">
              Selecione o contrato relacionado. Ele será usado pela IA para
              embasar e preencher a peça.
            </p>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-slate-800">
            A peça será criada com base em:
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:gap-10">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="baseEm"
                checked={baseEm === "palavras"}
                onChange={() => setBaseEm("palavras")}
                className="h-4 w-4 accent-blue-600"
              />
              Palavras-chave, tema ou parte do documento
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="baseEm"
                checked={baseEm === "documento"}
                onChange={() => setBaseEm("documento")}
                className="h-4 w-4 accent-blue-600"
              />
              Documento (arquivo em .pdf, .doc, .docx ou .txt)
            </label>
          </div>
        </div>

        {baseEm === "palavras" ? (
          <div>
            <label className="block text-sm font-medium text-slate-700">
              {rotuloTema(tipoSelecionado)}
            </label>
            <textarea
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              rows={4}
              placeholder={`Exemplo: "Atestado restritivo", "Balanço vencido", "Certidões negativas vencidas"`}
              className={`mt-1.5 resize-y ${classeCampo}`}
            />
            <div className="mt-3">
              <button
                type="button"
                disabled={!podeSugerir}
                onClick={handleSugerir}
                className="cursor-pointer rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {carregando ? "Gerando sugestões..." : "Sugerir teses"}
              </button>
            </div>

            {carregando && (
              <p className="mt-4 text-sm text-slate-500">
                Analisando a base de precedentes e gerando teses...
              </p>
            )}

            {!carregando && teses && teses.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <p className="text-sm font-semibold text-slate-800">
                    Teses sugeridas — selecione uma:
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="font-medium">Relevância:</span>
                    {LEGENDA_RELEVANCIA.map((item) => (
                      <span
                        key={item.nivel}
                        className="inline-flex items-center gap-1.5"
                      >
                        <span
                          className={`rounded-md px-2 py-0.5 font-semibold ${corRelevancia[item.nivel]}`}
                        >
                          {item.nivel}
                        </span>
                        <span>{item.descricao}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {teses.map((t, i) => (
                    <TeseCard
                      key={i}
                      tese={t}
                      selecionada={selecionada === i}
                      onSelecionar={() =>
                        setSelecionada((atual) => (atual === i ? null : i))
                      }
                      onAbrir={() => carregarFundamentacao(i)}
                      carregandoFundamentacao={carregandoFund === i}
                    />
                  ))}
                </div>
                {selecionada !== null && !tipoId && (
                  <p className="mt-4 text-sm text-amber-700">
                    Selecione o tipo de peça jurídica para continuar.
                  </p>
                )}
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={!podeCriar}
                    onClick={handleCriar}
                    className="cursor-pointer rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {criando ? "Criando..." : "Criar minha petição"}
                  </button>
                </div>
              </div>
            )}

            {!carregando && teses && teses.length === 0 && (
              <p className="mt-4 text-sm text-slate-500">
                Nenhuma tese encontrada para o tema informado.
              </p>
            )}

            {erroCriar && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {erroCriar}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Upload de documento — disponível em breve.
          </div>
        )}
      </div>
    </div>
  );
}
