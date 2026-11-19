import { Suspense } from "react";
import { FinanceiroLoading } from "@/components/financeiro-loading";
import { Gestao } from "@/components/gestao";
import { buscarFinanceiro } from "@/lib/financeiro-api";

async function ConteudoGestao() {
  const { data, origem } = await buscarFinanceiro(
    "contas",
    "categorias",
    "transacoes",
    "orcamentos",
  );
  return (
    <Gestao
      contas={data.contas}
      categorias={data.categorias}
      transacoes={data.transacoes}
      orcamentos={data.orcamentos}
      origem={origem}
    />
  );
}

export default function GerenciarPage() {
  return (
    <Suspense fallback={<FinanceiroLoading titulo="Carregando gestão..." />}>
      <ConteudoGestao />
    </Suspense>
  );
}
