export function formatarData(valor: string | Date | null | undefined): string {
  if (!valor) return "";
  const data = typeof valor === "string" ? new Date(valor) : valor;
  if (Number.isNaN(data.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}

export function formatarDataHora(
  valor: string | Date | null | undefined,
): string {
  if (!valor) return "";
  const data = typeof valor === "string" ? new Date(valor) : valor;
  if (Number.isNaN(data.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}
