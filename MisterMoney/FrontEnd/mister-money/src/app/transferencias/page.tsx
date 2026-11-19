import { Suspense } from "react";
import { FinanceiroLoading } from "@/components/financeiro-loading";
import { Transfers } from "@/components/transfers";
import { mapearContas, paraTransferencias } from "@/lib/financeiro-adapters";
import { buscarFinanceiro } from "@/lib/financeiro-api";

async function ConteudoTransferencias() {
  const { data, origem } = await buscarFinanceiro("contas", "transferencias");
  const { accounts } = mapearContas(data.contas);
  const transfers = paraTransferencias(data.transferencias, data.contas);
  return <Transfers accounts={accounts} transfers={transfers} origem={origem} />;
}

export default function TransferenciasPage() {
  return (
    <Suspense fallback={<FinanceiroLoading titulo="Carregando transferências..." />}>
      <ConteudoTransferencias />
    </Suspense>
  );
}
