import type { Transaction } from "@/lib/dashboard-data";
import type { StatementAccount, StatementEntry } from "@/lib/statement-data";
import type { Transfer } from "@/lib/transfers-data";
import type { TaxInstallment } from "@/lib/taxes-data";
import type { Account } from "@/lib/wallet-data";
import type {
  ContaApi,
  ImpostoApi,
  TransacaoApi,
  TransferenciaApi,
} from "@/lib/financeiro-api";

/** Adaptadores puros: transformam a resposta da API nos formatos já usados pela UI. */

const CORES = ["#f29b29", "#ffd08a", "#C97A16", "#8A5A1B", "#F7C46C"];
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const MESES_CURTO = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

// Referência fixa para não quebrar a hidratação (o app já usa datas demo fixas).
const DATA_REFERENCIA = new Date("2026-11-19T12:00:00").getTime();

export type MapaContas = {
  accounts: Account[];
  porId: Map<number, Account>;
};

const partesData = (valor: string) => {
  const [ano = 2026, mes = 1, dia = 1] = valor.split("-").map(Number);
  return { ano, mes, dia };
};

const dataDe = (valor: string) => {
  const { ano, mes, dia } = partesData(valor);
  return new Date(ano, mes - 1, dia, 12);
};

const diasAtras = (valor: string) =>
  Math.max(0, Math.round((DATA_REFERENCIA - dataDe(valor).getTime()) / 86_400_000));

const dataCurta = (valor: string) => {
  const { mes, dia } = partesData(valor);
  return `${dia} ${MESES_CURTO[mes - 1] ?? "jan"}`;
};

const grupoPorDias = (dias: number) => {
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Ontem";
  const { dia, mes, ano } = partesData(
    new Date(DATA_REFERENCIA - dias * 86_400_000).toISOString().slice(0, 10),
  );
  return `${dia} de ${MESES_CURTO[mes - 1]?.toLowerCase() ?? "jan"} de ${ano}`;
};

export function mapearContas(contas: ContaApi[]): MapaContas {
  let contasPessoais = 0;
  const porId = new Map<number, Account>();

  const accounts = contas.map((conta, indice) => {
    const accountId = (conta.tipo === "cnpj"
      ? "mei"
      : contasPessoais++ === 0
        ? "corrente"
        : "reserva") as Account["id"];
    const documento = conta.documento?.replace(/\D/g, "") ?? "";
    const account: Account = {
      id: accountId,
      name: conta.nome,
      category: conta.tipo === "cnpj" ? "Pessoa jurídica" : "Pessoal",
      institution: "Mister Money",
      agency: "—",
      number: documento ? `•• ${documento.slice(-4)}` : `•• ${conta.id}`,
      balance: conta.saldo,
      // A tabela contas não tem limite de crédito; mantemos o campo apenas
      // para compatibilidade com o layout demo (a UI rotula como participação).
      limit: Math.max(conta.saldo, 1),
      color: CORES[indice % CORES.length],
      icon: conta.tipo === "cnpj" ? "card" : "wallet",
    };
    porId.set(conta.id, account);
    return account;
  });

  return { accounts, porId };
}

export function paraMovimentacoes(
  transacoes: TransacaoApi[],
  contas: ContaApi[],
): Transaction[] {
  const { porId } = mapearContas(contas);
  return transacoes.map((item) => ({
    id: item.id,
    title: item.descricao || item.categoriaNome || "Lançamento",
    detail: `${item.tipo} · ${item.contaNome}${item.categoriaNome ? ` · ${item.categoriaNome}` : ""}`,
    date: dataCurta(item.data),
    amount: item.tipo === "receita" ? item.valor : -item.valor,
    kind: item.tipo === "receita" ? "income" : "expense",
    icon: item.tipo === "imposto" ? "chart" : "cart",
    accountId: porId.get(item.contaId)?.id ?? "corrente",
  }));
}

export function paraExtrato(
  transacoes: TransacaoApi[],
  transferencias: TransferenciaApi[],
  contas: ContaApi[],
): StatementEntry[] {
  const { porId } = mapearContas(contas);
  const lancamentos: StatementEntry[] = transacoes.map((item) => ({
    id: `t-${item.id}`,
    title: item.descricao || item.categoriaNome || "Lançamento",
    detail: `${item.tipo} · ${item.contaNome}${item.categoriaNome ? ` · ${item.categoriaNome}` : ""}`,
    group: grupoPorDias(diasAtras(item.data)),
    date: `${dataCurta(item.data)}, 12:00`,
    daysAgo: diasAtras(item.data),
    amount: item.tipo === "receita" ? item.valor : -Math.abs(item.valor),
    type: item.tipo === "receita" ? "income" : "expense",
    category: item.categoriaNome ?? "Sem categoria",
    method: "Lançamento manual",
    accountId: porId.get(item.contaId)?.id ?? "corrente",
    status: "done",
    icon: item.tipo === "imposto" ? "receipt" : "cart",
  }));

  const transferenciasConvertidas: StatementEntry[] = transferencias.map((item) => ({
    id: `tr-${item.id}`,
    title: "Transferência entre contas",
    detail: `${item.origemNome} → ${item.destinoNome}`,
    group: grupoPorDias(diasAtras(item.data)),
    date: `${dataCurta(item.data)}, 12:00`,
    daysAgo: diasAtras(item.data),
    amount: -Math.abs(item.valor),
    type: "transfer",
    category: "Entre contas",
    method: "Transferência interna",
    accountId: porId.get(item.origemContaId)?.id ?? "corrente",
    status: "done",
    icon: "transfer",
  }));

  return [...lancamentos, ...transferenciasConvertidas].sort(
    (a, b) => a.daysAgo - b.daysAgo,
  );
}

export function paraTransferencias(
  transferencias: TransferenciaApi[],
  contas: ContaApi[],
): Transfer[] {
  const { porId } = mapearContas(contas);
  return transferencias.map((item) => ({
    id: `api-${item.id}`,
    name: "Transferência entre contas",
    initials: "TF",
    key: "Interna",
    detail: `${item.origemNome} → ${item.destinoNome}`,
    dateLabel: dataCurta(item.data),
    amount: item.valor,
    direction: "sent",
    status: "done",
    accountId: (porId.get(item.origemContaId)?.id ?? "corrente") as StatementAccount,
    note: item.descricao || "Transferência entre contas do usuário",
    color: "var(--module)",
  }));
}

export function paraImpostos(impostos: ImpostoApi[]): {
  installments: TaxInstallment[];
  paidHistory: TaxInstallment[];
} {
  const installments: TaxInstallment[] = [];
  const paidHistory: TaxInstallment[] = [];

  for (const item of impostos) {
    const { ano, mes } = partesData(item.competencia);
    const nomeMes = MESES[mes - 1] ?? "Janeiro";
    const nomeCurto = MESES_CURTO[mes - 1] ?? "Jan";
    const vencimento =
      item.vencimento ?? `${ano}-${String(mes).padStart(2, "0")}-${String(new Date(ano, mes, 0).getDate()).padStart(2, "0")}`;
    const convertido: TaxInstallment = {
      id: `api-${item.id}`,
      month: nomeMes,
      short: nomeCurto,
      year: ano,
      competence: `${nomeMes} / ${ano}`,
      dueDate: vencimento,
      dueLabel: `${partesData(vencimento).dia}/${String(partesData(vencimento).mes).padStart(2, "0")}`,
      value: item.valorEstimado,
      status: item.pago
        ? "paid"
        : new Date(ano, mes - 1, 1).getTime() > DATA_REFERENCIA
          ? "scheduled"
          : "open",
      paidAt: item.pagoEm ? dataCurta(item.pagoEm) : undefined,
    };
    (convertido.status === "paid" ? paidHistory : installments).push(convertido);
  }

  return { installments, paidHistory };
}
