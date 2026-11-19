/** Contrato da API Java: GET /api/dashboard/{usuarioId} */

export type SaldoConta = {
  contaId: number;
  tipo: "cpf" | "cnpj";
  nome: string;
  saldo: number;
};

export type ResumoMensal = {
  contaId: number;
  mes: string;
  receita: number;
  custos: number;
  impostos: number;
  lucroLiquido: number;
};

export type ReceitaAnual = {
  contaId: number;
  ano: number;
  receitaAno: number;
};

export type OrcamentoProgresso = {
  orcamentoId: number;
  categoria: string;
  mes: string;
  limite: number;
  gasto: number;
  percentual: number;
  estourou: boolean;
};

export type DashboardData = {
  saldos: SaldoConta[];
  resumoMensal: ResumoMensal[];
  receitaAnual: ReceitaAnual[];
  orcamentos: OrcamentoProgresso[];
};

export type DashboardPayload = {
  data: DashboardData;
  origem: "api" | "demo";
};
