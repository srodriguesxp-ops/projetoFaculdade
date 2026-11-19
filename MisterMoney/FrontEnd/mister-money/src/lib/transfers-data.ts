export type TransferDirection = "sent" | "received";
export type TransferStatus = "done" | "scheduled" | "cancelled";

export type Transfer = {
  id: string;
  name: string;
  initials: string;
  key: string;
  detail: string;
  dateLabel: string;
  amount: number;
  direction: TransferDirection;
  status: TransferStatus;
  accountId: "corrente" | "mei" | "reserva";
  note: string;
  color: string;
};

export type Contact = {
  id: string;
  name: string;
  initials: string;
  key: string;
  bank: string;
  color: string;
};

export const initialTransfers: Transfer[] = [
  {
    id: "t1",
    name: "Maria Oliveira",
    initials: "MO",
    key: "••• 447.192.830-••",
    detail: "Pix enviado · Conta corrente",
    dateLabel: "Hoje, 10:32",
    amount: 850,
    direction: "sent",
    status: "done",
    accountId: "corrente",
    note: "Divisão do almoço",
    color: "#f29b29",
  },
  {
    id: "t2",
    name: "Aluguel do escritório",
    initials: "AE",
    key: "••• 12.345.678/0001-••",
    detail: "Pix enviado · Conta MEI",
    dateLabel: "15 nov, 10:00",
    amount: 1200,
    direction: "sent",
    status: "done",
    accountId: "mei",
    note: "Competência de novembro",
    color: "#ffd08a",
  },
  {
    id: "t3",
    name: "João Ferreira",
    initials: "JF",
    key: "••• 991.220.451-••",
    detail: "Pix recebido · Conta corrente",
    dateLabel: "Hoje, 09:15",
    amount: 480,
    direction: "received",
    status: "done",
    accountId: "corrente",
    note: "Pagamento de serviço",
    color: "#C97A16",
  },
  {
    id: "t4",
    name: "Reserva de emergência",
    initials: "RE",
    key: "•• 0192-8",
    detail: "Transferência interna · CDB",
    dateLabel: "12 nov, 08:00",
    amount: 2000,
    direction: "sent",
    status: "done",
    accountId: "corrente",
    note: "Aplicação mensal",
    color: "#F9F9F9",
  },
  {
    id: "t5",
    name: "Ana Beatriz",
    initials: "AB",
    key: "••• 308.771.902-••",
    detail: "Pix recebido · Conta corrente",
    dateLabel: "08 nov, 16:24",
    amount: 320,
    direction: "received",
    status: "done",
    accountId: "corrente",
    note: "Reembolso",
    color: "#FFB454",
  },
  {
    id: "t6",
    name: "Fornecedor Solnas",
    initials: "FS",
    key: "••• 27.881.450/0001-••",
    detail: "Pix agendado · Conta MEI",
    dateLabel: "20 nov, 08:00",
    amount: 640,
    direction: "sent",
    status: "scheduled",
    accountId: "mei",
    note: "Pedido #1042",
    color: "#FFD08A",
  },
  {
    id: "t7",
    name: "Reserva de emergência",
    initials: "RE",
    key: "•• 0192-8",
    detail: "Pix agendado · CDB",
    dateLabel: "25 nov, 08:00",
    amount: 1000,
    direction: "sent",
    status: "scheduled",
    accountId: "corrente",
    note: "Reforço da reserva",
    color: "#FFD08A",
  },
];

export const contacts: Contact[] = [
  {
    id: "c1",
    name: "Maria Oliveira",
    initials: "MO",
    key: "••• 447.192.830-••",
    bank: "Banco Mister",
    color: "#f29b29",
  },
  {
    id: "c2",
    name: "João Ferreira",
    initials: "JF",
    key: "••• 991.220.451-••",
    bank: "Banco Aurora",
    color: "#C97A16",
  },
  {
    id: "c3",
    name: "Ana Beatriz",
    initials: "AB",
    key: "••• 308.771.902-••",
    bank: "Banco Mister",
    color: "#FFB454",
  },
  {
    id: "c4",
    name: "Fornecedor Solnas",
    initials: "FS",
    key: "••• 27.881.450/0001-••",
    bank: "Banco Sol",
    color: "#FFD08A",
  },
];

export const dailyPixLimit = 15000;
export const dailyPixUsed = 2850;

export const scheduleOptions = [
  { value: "Amanhã · 19/11", label: "Amanhã · 19/11" },
  { value: "Sex, 20/11", label: "Sex, 20/11" },
  { value: "Qua, 25/11", label: "Qua, 25/11" },
];
