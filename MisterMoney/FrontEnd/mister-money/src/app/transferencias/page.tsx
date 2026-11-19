import { Suspense } from "react";
import { FinanceiroLoading } from "@/components/financeiro-loading";
import { Transfers } from "@/components/transfers";
import { mapearContas, paraTransferencias } from "@/lib/financeiro-adapters";
import { buscarFinanceiro } from "@/lib/financeiro-api";

async function ConteudoTransferencias() {
  const { data, origem } = await buscarFinanceiro("contas", "transferencias");
  const mapa = mapearContas(data.contas);
  const { accounts } = mapa;
  const transfers = paraTransferencias(data.transferencias, data.contas);
  const contasApi = data.contas.flatMap((conta) => {
    const uiId = mapa.porId.get(conta.id)?.id;
    return uiId ? [{ id: conta.id, uiId }] : [];
  });

  return (
    <Transfers
      accounts={accounts}
      transfers={transfers}
      contasApi={contasApi}
      origem={origem}
    />
  );
}

export default function TransferenciasPage() {
  return (
    <Suspense fallback={<FinanceiroLoading titulo="Carregando transferências..." />}>
      <ConteudoTransferencias />
    </Suspense>
  );
}
