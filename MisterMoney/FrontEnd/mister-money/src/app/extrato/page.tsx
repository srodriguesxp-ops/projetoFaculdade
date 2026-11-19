import { Suspense } from "react";
import { FinanceiroLoading } from "@/components/financeiro-loading";
import { Statement } from "@/components/statement";
import { mapearContas, paraExtrato } from "@/lib/financeiro-adapters";
import { buscarFinanceiro } from "@/lib/financeiro-api";

async function ConteudoExtrato() {
  const { data, origem } = await buscarFinanceiro(
    "contas",
    "transacoes",
    "transferencias",
  );
  const { accounts } = mapearContas(data.contas);
  const entries = paraExtrato(data.transacoes, data.transferencias, data.contas);
  return <Statement accounts={accounts} entries={entries} origem={origem} />;
}

export default function ExtratoPage() {
  return (
    <Suspense fallback={<FinanceiroLoading titulo="Carregando extrato..." />}>
      <ConteudoExtrato />
    </Suspense>
  );
}
