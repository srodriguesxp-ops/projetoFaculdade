import type { IconName } from "@/components/icons";

export type Account = {
  id: "corrente" | "mei" | "reserva";
  name: string;
  category: string;
  institution: string;
  agency: string;
  number: string;
  balance: number;
  limit: number;
  color: string;
  icon: IconName;
};

export const accounts: Account[] = [
  {
    id: "corrente",
    name: "Conta corrente",
    category: "Pessoal",
    institution: "Banco Mister",
    agency: "0001",
    number: "•• 4829-1",
    balance: 12840.5,
    limit: 20000,
    color: "#f29b29",
    icon: "wallet",
  },
  {
    id: "mei",
    name: "Conta MEI",
    category: "Pessoa jurídica",
    institution: "Banco Mister",
    agency: "0001",
    number: "•• 7710-3",
    balance: 8720.9,
    limit: 15000,
    color: "#ffd08a",
    icon: "card",
  },
  {
    id: "reserva",
    name: "Reserva de emergência",
    category: "Investimento",
    institution: "CDB Liquidez Diária",
    agency: "—",
    number: "•• 0192-8",
    balance: 15400,
    limit: 20000,
    color: "#C97A16",
    icon: "chart",
  },
];

export const totalBalance = accounts.reduce(
  (sum, account) => sum + account.balance,
  0,
);
