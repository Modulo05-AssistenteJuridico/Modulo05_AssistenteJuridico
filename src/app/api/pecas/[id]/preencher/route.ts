import { NextResponse } from "next/server";
import { buscarPecaPorId } from "@/lib/data/pecas";
import { buscarEditalPorId } from "@/lib/data/licitacoes";
import { buscarContratoPorId } from "@/lib/data/contratos";
import { baixarDocumentosEdital } from "@/lib/data/edital-docs";
import { buscarEmpresa } from "@/lib/data/empresa";
import {
  arquivoModeloParaTipo,
  baixarModelo,
  lerDocumentoXml,
  parsearDocumento,
} from "@/lib/data/modelos";
import { preencherCamposIA } from "@/lib/ai/preencher-modelo";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const detalhe = await buscarPecaPorId(id);
  if (!detalhe || !detalhe.tipo) {
    return NextResponse.json({ erro: "Peça não encontrada." }, { status: 404 });
  }

  const arquivo = arquivoModeloParaTipo(detalhe.tipo);
  if (!arquivo) {
    return NextResponse.json(
      { erro: "Tipo de peça sem modelo." },
      { status: 422 },
    );
  }

  try {
    const [{ campos }, [edital, contrato, empresa]] = await Promise.all([
      (async () => {
        const buf = await baixarModelo(arquivo);
        const xml = await lerDocumentoXml(buf);
        return parsearDocumento(xml);
      })(),
      Promise.all([
        detalhe.peca.id_edital_m4
          ? buscarEditalPorId(detalhe.peca.id_edital_m4)
          : Promise.resolve(null),
        detalhe.peca.id_contrato_m8
          ? buscarContratoPorId(detalhe.peca.id_contrato_m8)
          : Promise.resolve(null),
        buscarEmpresa(),
      ]),
    ]);
    const documentos = await baixarDocumentosEdital(edital?.docs);
    const valores = await preencherCamposIA({
      campos,
      tipoNome: detalhe.tipo.nome,
      tema: detalhe.peca.palavra_chave_tema,
      tese: detalhe.tese,
      edital: edital ? { orgao: edital.orgao, objeto: edital.objeto } : null,
      documentos,
      contrato: contrato
        ? {
            numero: contrato.numero,
            orgao: contrato.orgao,
            objeto: contrato.objeto,
            fornecedor: contrato.fornecedor,
            cnpj: contrato.cnpj,
            valor: contrato.valor,
            vigenciaInicio: contrato.vigencia_inicio,
            vigenciaFim: contrato.vigencia_fim,
          }
        : null,
      empresa,
    });
    return NextResponse.json({ valores });
  } catch (erro) {
    console.error("Falha ao preencher modelo:", erro);
    return NextResponse.json({ valores: {} });
  }
}
