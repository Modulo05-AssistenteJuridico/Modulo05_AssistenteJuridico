import { Contrato } from "@/types/external";

export const contratosMock: Contrato[] = [
  {
    id: "con-001",
    numero: "Contrato nº 045/2025",
    orgao: "Município de Porto União/SC",
    objeto:
      "Registro de preços para aquisição de troféus e medalhas para premiações em eventos esportivos",
    fornecedor: "Comercial Esportiva Ltda.",
    cnpj: "12.345.678/0001-90",
    valor: 187500,
    vigencia_inicio: "2025-02-10",
    vigencia_fim: "2026-02-09",
  },
  {
    id: "con-002",
    numero: "Contrato nº 112/2024",
    orgao: "Secretaria Estadual de Saúde",
    objeto: "Prestação de serviços continuados de limpeza e conservação predial",
    fornecedor: "Higienize Serviços Gerais Ltda.",
    cnpj: "98.765.432/0001-10",
    valor: 2340000,
    vigencia_inicio: "2024-06-01",
    vigencia_fim: "2025-05-31",
  },
  {
    id: "con-003",
    numero: "Contrato nº 008/2025",
    orgao: "Departamento Nacional de Infraestrutura de Transportes",
    objeto:
      "Execução de obra de recuperação de pavimento asfáltico em rodovia federal",
    fornecedor: "Construtora Estrada Real S.A.",
    cnpj: "45.678.912/0001-33",
    valor: 8750000,
    vigencia_inicio: "2025-03-15",
    vigencia_fim: "2026-09-15",
  },
];
