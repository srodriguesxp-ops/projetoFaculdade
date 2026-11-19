import { Suspense } from "react";
import { FinanceiroLoading } from "@/components/financeiro-loading";
import { Wallet } from "@/components/wallet";
import { mapearContas, paraMovimentacoes } from "@/lib/financeiro-adapters";
import { buscarFinanceiro } from "@/lib/financeiro-api";

async function ConteudoCarteira() {
  const { data, origem } = await buscarFinanceiro("contas", "transacoes");
  const { accounts } = mapearContas(data.contas);
  const movements = paraMovimentacoes(data.transacoes, data.contas);
  return <Wallet accounts={accounts} movements={movements} origem={origem} />;
}

export default function CarteiraPage() {
  return (
    <Suspense fallback={<FinanceiroLoading titulo="Carregando carteira..." />}>
      <ConteudoCarteira />
    </Suspense>
  );
}
