import type { IconName } from "@/components/icons";

export type CardKind = "physical" | "virtual";
export type CardStatus = "active" | "blocked";

export type PaymentCard = {
  id: string;
  name: string;
  category: string;
  kind: CardKind;
  status: CardStatus;
  last4: string;
  holder: string;
  expiry: string;
  limit: number;
  used: number;
  invoiceDue: string;
  closing: string;
  color: string;
  gradient: string;
};

export type CardTransaction = {
  id: string;
  cardId: string;
  title: string;
  detail: string;
  date: string;
  amount: number;
  icon: IconName;
};

export type MonthInvoice = {
  label: string;
  value: number;
};

export const cards: PaymentCard[] = [
  {
    id: "platinum",
    name: "Mister Money Platinum",
    category: "Cartão físico · Débito e crédito",
    kind: "physical",
    status: "active",
    last4: "4829",
    holder: "JAY JODODA SILVA",
    expiry: "08/29",
    limit: 12000,
    used: 2870.4,
    invoiceDue: "10/12",
    closing: "03/12",
    color: "#f29b29",
    gradient: "linear-gradient(135deg, #6b3d08 0%, #3a2106 55%, #000014 100%)",
  },
  {
    id: "online",
    name: "Cartão virtual online",
    category: "Cartão virtual · Compras na internet",
    kind: "virtual",
    status: "active",
    last4: "9137",
    holder: "JAY JODODA SILVA",
    expiry: "05/28",
    limit: 3000,
    used: 642.9,
    invoiceDue: "10/12",
    closing: "03/12",
    color: "#F9F9F9",
    gradient: "linear-gradient(135deg, #8A6A32 0%, #4A2C08 55%, #000014 100%)",
  },
  {
    id: "mei",
    name: "Mister Money MEI",
    category: "Cartão físico · Empresa",
    kind: "physical",
    status: "blocked",
    last4: "7710",
    holder: "JAY JODODA SILVA ME",
    expiry: "11/30",
    limit: 8000,
    used: 1340,
    invoiceDue: "10/12",
    closing: "03/12",
    color: "#FFB454",
    gradient: "linear-gradient(135deg, #C97A16 0%, #6B3D08 55%, #000014 100%)",
  },
];

export const cardTransactions: CardTransaction[] = [
  {
    id: "ct1",
    cardId: "platinum",
    title: "Supermercado Natural",
    detail: "Débito · Alimentação",
    date: "Hoje, 18:42",
    amount: -248.9,
    icon: "cart",
  },
  {
    id: "ct2",
    cardId: "platinum",
    title: "Pix recebido",
    detail: "Crédito em conta · Maria Oliveira",
    date: "Hoje, 09:15",
    amount: 850,
    icon: "transfer",
  },
  {
    id: "ct3",
    cardId: "platinum",
    title: "Café da manhã",
    detail: "Crédito · Alimentação",
    date: "Hoje, 08:10",
    amount: -32.5,
    icon: "coffee",
  },
  {
    id: "ct4",
    cardId: "platinum",
    title: "Corrida de app",
    detail: "Débito · Transporte",
    date: "16 nov, 19:22",
    amount: -28.9,
    icon: "car",
  },
  {
    id: "ct5",
    cardId: "platinum",
    title: "Assinatura streaming",
    detail: "Crédito · Entretenimento",
    date: "15 nov, 07:00",
    amount: -55.9,
    icon: "receipt",
  },
  {
    id: "ct6",
    cardId: "online",
    title: "Loja online",
    detail: "Crédito · Compras",
    date: "Ontem, 21:08",
    amount: -289.9,
    icon: "cart",
  },
  {
    id: "ct7",
    cardId: "online",
    title: "Assinatura cloud",
    detail: "Crédito · Tecnologia",
    date: "14 nov, 11:30",
    amount: -59.9,
    icon: "receipt",
  },
  {
    id: "ct8",
    cardId: "online",
    title: "Livraria virtual",
    detail: "Crédito · Educação",
    date: "12 nov, 16:45",
    amount: -42.1,
    icon: "cart",
  },
  {
    id: "ct9",
    cardId: "mei",
    title: "Aluguel do escritório",
    detail: "Crédito · Moradia",
    date: "15 nov, 10:00",
    amount: -1200,
    icon: "home",
  },
  {
    id: "ct10",
    cardId: "mei",
    title: "Combustível",
    detail: "Débito · Transporte",
    date: "14 nov, 17:26",
    amount: -180.75,
    icon: "car",
  },
  {
    id: "ct11",
    cardId: "mei",
    title: "Material de escritório",
    detail: "Crédito · Fornecedores",
    date: "11 nov, 14:12",
    amount: -89.2,
    icon: "cart",
  },
];

export const invoiceHistory: Record<string, MonthInvoice[]> = {
  platinum: [
    { label: "Jun", value: 2140 },
    { label: "Jul", value: 2680 },
    { label: "Ago", value: 1980 },
    { label: "Set", value: 2450 },
    { label: "Out", value: 2310 },
    { label: "Nov", value: 2870.4 },
  ],
  online: [
    { label: "Jun", value: 310 },
    { label: "Jul", value: 480 },
    { label: "Ago", value: 260 },
    { label: "Set", value: 520 },
    { label: "Out", value: 390 },
    { label: "Nov", value: 642.9 },
  ],
  mei: [
    { label: "Jun", value: 980 },
    { label: "Jul", value: 1240 },
    { label: "Ago", value: 1060 },
    { label: "Set", value: 1580 },
    { label: "Out", value: 1420 },
    { label: "Nov", value: 1340 },
  ],
};

export const defaultHistory: MonthInvoice[] = [
  { label: "Jun", value: 0 },
  { label: "Jul", value: 0 },
  { label: "Ago", value: 0 },
  { label: "Set", value: 0 },
  { label: "Out", value: 0 },
  { label: "Nov", value: 0 },
];
