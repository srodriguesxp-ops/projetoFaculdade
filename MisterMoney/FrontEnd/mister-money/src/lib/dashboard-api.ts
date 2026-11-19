import { unstable_rethrow } from "next/navigation";
import { accounts } from "@/lib/wallet-data";
import { expenseSeries } from "@/lib/dashboard-data";
import type { DashboardData, DashboardPayload } from "@/lib/dashboard-types";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";
const USUARIO_ID = Number(process.env.MISTERMONEY_USUARIO_ID ?? "2");

/** Espelho dos dados demonstrativos do front, usado se a API estiver fora. */
const dadosDemo = (): DashboardData => ({
  saldos: accounts.map((conta, indice) => ({
    contaId: indice + 1,
    tipo: conta.category === "Pessoa jurídica" ? "cnpj" : "cpf",
    nome: conta.name,
    saldo: conta.balance,
  })),
  resumoMensal: [
    {
      contaId: 0,
      mes: "2026-11-01",
      receita: 5700,
      custos: expenseSeries["6m"].at(-1)?.value ?? 4250,
      impostos: 120,
      lucroLiquido: 1450,
    },
  ],
  receitaAnual: [{ contaId: 0, ano: 2026, receitaAno: 4250 }],
  orcamentos: [
    {
      orcamentoId: 1,
      categoria: "Alimentação",
      mes: "2026-11-01",
      limite: 1000,
      gasto: 780,
      percentual: 78,
      estourou: false,
    },
    {
      orcamentoId: 2,
      categoria: "Transporte",
      mes: "2026-11-01",
      limite: 500,
      gasto: 520,
      percentual: 104,
      estourou: true,
    },
  ],
});

function normalizar(resposta: unknown): DashboardData {
  if (!resposta || typeof resposta !== "object") {
    throw new Error("Resposta da API não é um objeto");
  }

  const corpo = resposta as Partial<DashboardData>;
  if (!Array.isArray(corpo.saldos)) {
    throw new Error("Resposta da API sem a lista 'saldos'");
  }

  return {
    saldos: corpo.saldos,
    resumoMensal: Array.isArray(corpo.resumoMensal) ? corpo.resumoMensal : [],
    receitaAnual: Array.isArray(corpo.receitaAnual) ? corpo.receitaAnual : [],
    orcamentos: Array.isArray(corpo.orcamentos) ? corpo.orcamentos : [],
  };
}

/**
 * Busca o dashboard no backend Java. Chamada por um Server Component dentro de
 * <Suspense>: com Cache Components o fetch não é cacheado e acontece por request.
 */
export async function buscarDashboard(): Promise<DashboardPayload> {
  try {
    const resposta = await fetch(
      `${API_BASE_URL}/api/dashboard/${USUARIO_ID}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      },
    );

    if (!resposta.ok) {
      throw new Error(`API respondeu HTTP ${resposta.status}`);
    }

    return { data: normalizar(await resposta.json()), origem: "api" };
  } catch (erro) {
    // Durante o prerender o Next rejeita o fetch de propósito para encerrar o
    // shell estático; esse sinal precisa voltar para o framework (docs Next 16).
    unstable_rethrow(erro);
    console.warn(
      `[dashboard] Não foi possível consultar ${API_BASE_URL}; usando dados demonstrativos.`,
      erro,
    );
    return { data: dadosDemo(), origem: "demo" };
  }
}
