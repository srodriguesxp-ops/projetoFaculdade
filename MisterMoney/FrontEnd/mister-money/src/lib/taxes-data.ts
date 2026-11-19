export type TaxStatus = "open" | "scheduled" | "paid";

export type TaxInstallment = {
  id: string;
  month: string;
  short: string;
  year: number;
  competence: string;
  dueDate: string;
  dueLabel: string;
  value: number;
  status: TaxStatus;
  paidAt?: string;
};

export const installments: TaxInstallment[] = [
  {
    id: "2026-11",
    month: "Novembro",
    short: "Nov",
    year: 2026,
    competence: "Novembro / 2026",
    dueDate: "2026-11-20",
    dueLabel: "20/11",
    value: 120,
    status: "open",
  },
  {
    id: "2026-12",
    month: "Dezembro",
    short: "Dez",
    year: 2026,
    competence: "Dezembro / 2026",
    dueDate: "2026-12-21",
    dueLabel: "21/12",
    value: 120,
    status: "scheduled",
  },
  {
    id: "2027-01",
    month: "Janeiro",
    short: "Jan",
    year: 2027,
    competence: "Janeiro / 2027",
    dueDate: "2027-01-20",
    dueLabel: "20/01",
    value: 120,
    status: "scheduled",
  },
  {
    id: "2027-02",
    month: "Fevereiro",
    short: "Fev",
    year: 2027,
    competence: "Fevereiro / 2027",
    dueDate: "2027-02-19",
    dueLabel: "19/02",
    value: 120,
    status: "scheduled",
  },
  {
    id: "2027-03",
    month: "Março",
    short: "Mar",
    year: 2027,
    competence: "Março / 2027",
    dueDate: "2027-03-22",
    dueLabel: "22/03",
    value: 120,
    status: "scheduled",
  },
  {
    id: "2027-04",
    month: "Abril",
    short: "Abr",
    year: 2027,
    competence: "Abril / 2027",
    dueDate: "2027-04-20",
    dueLabel: "20/04",
    value: 120,
    status: "scheduled",
  },
];

export const paidHistory: TaxInstallment[] = [
  {
    id: "2026-10",
    month: "Outubro",
    short: "Out",
    year: 2026,
    competence: "Outubro / 2026",
    dueDate: "2026-10-20",
    dueLabel: "20/10",
    value: 120,
    status: "paid",
    paidAt: "18/10/2026",
  },
  {
    id: "2026-09",
    month: "Setembro",
    short: "Set",
    year: 2026,
    competence: "Setembro / 2026",
    dueDate: "2026-09-21",
    dueLabel: "21/09",
    value: 120,
    status: "paid",
    paidAt: "19/09/2026",
  },
  {
    id: "2026-08",
    month: "Agosto",
    short: "Ago",
    year: 2026,
    competence: "Agosto / 2026",
    dueDate: "2026-08-20",
    dueLabel: "20/08",
    value: 120,
    status: "paid",
    paidAt: "18/08/2026",
  },
  {
    id: "2026-07",
    month: "Julho",
    short: "Jul",
    year: 2026,
    competence: "Julho / 2026",
    dueDate: "2026-07-20",
    dueLabel: "20/07",
    value: 120,
    status: "paid",
    paidAt: "17/07/2026",
  },
  {
    id: "2026-06",
    month: "Junho",
    short: "Jun",
    year: 2026,
    competence: "Junho / 2026",
    dueDate: "2026-06-22",
    dueLabel: "22/06",
    value: 120,
    status: "paid",
    paidAt: "19/06/2026",
  },
  {
    id: "2026-05",
    month: "Maio",
    short: "Mai",
    year: 2026,
    competence: "Maio / 2026",
    dueDate: "2026-05-20",
    dueLabel: "20/05",
    value: 120,
    status: "paid",
    paidAt: "18/05/2026",
  },
];

export const yearPaidTotal = paidHistory.reduce(
  (sum, item) => sum + item.value,
  0,
);
