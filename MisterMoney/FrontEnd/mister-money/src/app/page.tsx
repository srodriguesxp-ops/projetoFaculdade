import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard";
import { DashboardLoading } from "@/components/dashboard-loading";
import { paraMovimentacoes, paraSerieDespesas } from "@/lib/financeiro-adapters";
import { buscarFinanceiro } from "@/lib/financeiro-api";
import { buscarDashboard } from "@/lib/dashboard-api";

async function ConteudoDashboard() {
  // Duas consultas independentes: o resumo agregado e o extrato bruto, que
  // alimenta o gráfico e a lista de últimas movimentações.
  const [resumo, financeiro] = await Promise.all([
    buscarDashboard(),
    buscarFinanceiro("contas", "transacoes"),
  ]);

  const temExtrato =
    financeiro.origem === "api" && financeiro.data.transacoes.length > 0;
  const series = temExtrato
    ? paraSerieDespesas(financeiro.data.transacoes)
    : undefined;
  const movements = temExtrato
    ? paraMovimentacoes(financeiro.data.transacoes, financeiro.data.contas)
    : undefined;

  return (
    <Dashboard
      data={resumo.data}
      origem={resumo.origem}
      series={series}
      movements={movements}
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <ConteudoDashboard />
    </Suspense>
  );
}
