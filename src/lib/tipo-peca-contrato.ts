import { Contrato } from "@/types/external";
import { TipoPecaJuridica } from "@/types/database";

export function tipoExigeContrato(
  tipo: Pick<TipoPecaJuridica, "nome" | "codigo"> | undefined | null,
): boolean {
  if (!tipo) return false;
  const codigo = (tipo.codigo ?? "").toUpperCase();
  const nome = tipo.nome.toLowerCase();
  if (codigo === "P" || nome.includes("pagamento")) return true;
  if (nome.includes("reajuste")) return true;
  if (codigo === "E" || nome.includes("reequil")) return true;
  if (codigo === "D" || nome.includes("defesa")) return true;
  if (nome.includes("reconsidera")) return true;
  return false;
}

export function rotuloContrato(contrato: Contrato): string {
  const objeto =
    contrato.objeto.length > 70
      ? `${contrato.objeto.slice(0, 70)}…`
      : contrato.objeto;
  return `${contrato.numero} — ${objeto}`;
}

export function formatarContratoParaIA(contrato: Contrato): string {
  const valor = contrato.valor
    ? `R$ ${contrato.valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : null;
  return [
    `Contrato nº ${contrato.numero}`,
    contrato.orgao ? `Órgão contratante: ${contrato.orgao}` : null,
    contrato.objeto ? `Objeto: ${contrato.objeto}` : null,
    contrato.fornecedor
      ? `Contratada: ${contrato.fornecedor}${contrato.cnpj ? ` (CNPJ ${contrato.cnpj})` : ""}`
      : null,
    valor ? `Valor global: ${valor}` : null,
    contrato.vigencia_inicio && contrato.vigencia_fim
      ? `Vigência: ${contrato.vigencia_inicio} a ${contrato.vigencia_fim}`
      : null,
  ]
    .filter(Boolean)
    .join(". ");
}
