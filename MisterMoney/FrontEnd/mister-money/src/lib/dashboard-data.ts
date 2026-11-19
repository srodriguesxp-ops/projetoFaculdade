export type Period = "6m" | "12m";

export type MonthPoint = {
  label: string;
  value: number;
};

export type Transaction = {
  id: number;
  title: string;
  detail: string;
  date: string;
  amount: number;
  kind: "expense" | "income";
  icon: "cart" | "transfer" | "coffee" | "home" | "car" | "chart";
  accountId: "corrente" | "mei" | "reserva";
};

export const expenseSeries: Record<Period, MonthPoint[]> = {
  "6m": [
    { label: "Jun", value: 3180 },
    { label: "Jul", value: 3620 },
    { label: "Ago", value: 2940 },
    { label: "Set", value: 4210 },
    { label: "Out", value: 3520 },
    { label: "Nov", value: 4250 },
  ],
  "12m": [
    { label: "Dez", value: 2760 },
    { label: "Jan", value: 3120 },
    { label: "Fev", value: 2980 },
    { label: "Mar", value: 3410 },
    { label: "Abr", value: 3050 },
    { label: "Mai", value: 3680 },
    { label: "Jun", value: 3180 },
    { label: "Jul", value: 3620 },
    { label: "Ago", value: 2940 },
    { label: "Set", value: 4210 },
    { label: "Out", value: 3520 },
    { label: "Nov", value: 4250 },
  ],
};

export const transactions: Transaction[] = [
  {
    id: 1,
    title: "Supermercado",
    detail: "Cartão de débito • Alimentação",
    date: "Ontem, 18:42",
    amount: -248.9,
    kind: "expense",
    icon: "cart",
    accountId: "corrente",
  },
  {
    id: 2,
    title: "Transferência recebida",
    detail: "Pix • Maria Oliveira",
    date: "Hoje, 09:15",
    amount: 850,
    kind: "income",
    icon: "transfer",
    accountId: "corrente",
  },
  {
    id: 3,
    title: "Café da manhã",
    detail: "Cartão de crédito • Alimentação",
    date: "Hoje, 08:10",
    amount: -32.5,
    kind: "expense",
    icon: "coffee",
    accountId: "corrente",
  },
  {
    id: 4,
    title: "Aluguel do escritório",
    detail: "Transferência • Moradia",
    date: "15 nov, 10:00",
    amount: -1200,
    kind: "expense",
    icon: "home",
    accountId: "mei",
  },
  {
    id: 5,
    title: "Combustível",
    detail: "Cartão de débito • Transporte",
    date: "14 nov, 17:26",
    amount: -180.75,
    kind: "expense",
    icon: "car",
    accountId: "mei",
  },
  {
    id: 6,
    title: "Retorno de investimento",
    detail: "CDB • Investimentos",
    date: "12 nov, 08:00",
    amount: 420.3,
    kind: "income",
    icon: "chart",
    accountId: "reserva",
  },
];

export const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export const shortBrl = (value: number) => {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} mil`;
  }
  return brl(value);
};

export const monthTotal = (point: MonthPoint) => point.value;
