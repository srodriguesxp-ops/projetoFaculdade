import { Suspense } from "react";
import { FinanceiroLoading } from "@/components/financeiro-loading";
import { Taxes } from "@/components/taxes";
import { paraImpostos } from "@/lib/financeiro-adapters";
import { buscarFinanceiro } from "@/lib/financeiro-api";

async function ConteudoImpostos() {
  const { data, origem } = await buscarFinanceiro("impostos");
  const { installments, paidHistory } = paraImpostos(data.impostos);
  return (
    <Taxes
      installments={installments}
      history={paidHistory}
      origem={origem}
    />
  );
}

export default function ImpostosMeiPage() {
  return (
    <Suspense fallback={<FinanceiroLoading titulo="Carregando impostos..." />}>
      <ConteudoImpostos />
    </Suspense>
  );
}
