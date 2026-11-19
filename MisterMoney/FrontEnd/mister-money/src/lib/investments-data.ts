import type { MonthPoint } from "@/lib/dashboard-data";
import type { IconName } from "@/components/icons";

export type AssetCategory =
  | "renda-fixa"
  | "renda-variavel"
  | "fundo"
  | "cripto";

export type Asset = {
  id: string;
  name: string;
  ticker: string;
  category: AssetCategory;
  categoryLabel: string;
  amount: number;
  yieldPct: number;
  monthChange: number;
  color: string;
  risk: "Baixo" | "Médio" | "Alto";
  liquidity: string;
  description: string;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
  icon: IconName;
};

export const assets: Asset[] = [
  {
    id: "cdb",
    name: "CDB Liquidez Diária",
    ticker: "CDB",
    category: "renda-fixa",
    categoryLabel: "Renda fixa",
    amount: 15400,
    yieldPct: 0.92,
    monthChange: 1.4,
    color: "#f29b29",
    risk: "Baixo",
    liquidity: "Diária",
    description: "Reserva de emergência com liquidez imediata e baixo risco.",
  },
  {
    id: "ipca",
    name: "Tesouro IPCA+ 2035",
    ticker: "IPCA+35",
    category: "renda-fixa",
    categoryLabel: "Tesouro direto",
    amount: 8900,
    yieldPct: 0.78,
    monthChange: 0.9,
    color: "#ffd08a",
    risk: "Baixo",
    liquidity: "D+1",
    description: "Proteção contra inflação com vencimento em 2035.",
  },
  {
    id: "etf",
    name: "ETF S&P 500",
    ticker: "IVVB11",
    category: "renda-variavel",
    categoryLabel: "Ações internacionais",
    amount: 6200,
    yieldPct: 1.45,
    monthChange: 3.2,
    color: "#F9F9F9",
    risk: "Médio",
    liquidity: "D+2",
    description: "Exposição ao mercado norte-americano via ETF.",
  },
  {
    id: "petr4",
    name: "Petrobras PN",
    ticker: "PETR4",
    category: "renda-variavel",
    categoryLabel: "Ações",
    amount: 4350,
    yieldPct: -0.62,
    monthChange: -1.8,
    color: "#FFB454",
    risk: "Alto",
    liquidity: "D+2",
    description: "Posição em ações com foco em dividendos.",
  },
  {
    id: "btc",
    name: "Bitcoin",
    ticker: "BTC",
    category: "cripto",
    categoryLabel: "Criptoativos",
    amount: 2100,
    yieldPct: 2.85,
    monthChange: 6.7,
    color: "#FFD08A",
    risk: "Alto",
    liquidity: "Imediata",
    description: "Pequena parcela em cripto para diversificação.",
  },
  {
    id: "multimercado",
    name: "Fundo Multimercado",
    ticker: "MULTI",
    category: "fundo",
    categoryLabel: "Fundos",
    amount: 5400,
    yieldPct: 0.64,
    monthChange: 1.1,
    color: "#8F919B",
    risk: "Médio",
    liquidity: "D+30",
    description: "Estratégia diversificada com renda fixa e variável.",
  },
];

export const portfolioHistory: Record<"6m" | "12m", MonthPoint[]> = {
  "6m": [
    { label: "Jun", value: 31200 },
    { label: "Jul", value: 33500 },
    { label: "Ago", value: 32100 },
    { label: "Set", value: 35800 },
    { label: "Out", value: 38900 },
    { label: "Nov", value: 42350 },
  ],
  "12m": [
    { label: "Dez", value: 24500 },
    { label: "Jan", value: 25800 },
    { label: "Fev", value: 24900 },
    { label: "Mar", value: 27100 },
    { label: "Abr", value: 28300 },
    { label: "Mai", value: 29600 },
    { label: "Jun", value: 31200 },
    { label: "Jul", value: 33500 },
    { label: "Ago", value: 32100 },
    { label: "Set", value: 35800 },
    { label: "Out", value: 38900 },
    { label: "Nov", value: 42350 },
  ],
};

export const goals: Goal[] = [
  {
    id: "reserva",
    name: "Reserva de emergência",
    target: 20000,
    current: 15400,
    deadline: "Dez 2026",
    color: "#f29b29",
    icon: "wallet",
  },
  {
    id: "viagem",
    name: "Viagem em 2027",
    target: 15000,
    current: 6200,
    deadline: "Jul 2027",
    color: "#F9F9F9",
    icon: "sparkles",
  },
  {
    id: "aposentadoria",
    name: "Aposentadoria",
    target: 100000,
    current: 8900,
    deadline: "Longo prazo",
    color: "#FFB454",
    icon: "chart",
  },
];

export const dividendsReceived = 387.5;
