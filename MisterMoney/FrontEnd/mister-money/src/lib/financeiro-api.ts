import { unstable_rethrow } from "next/navigation";

/** Contratos do CRUD exposto pelo backend Java (application/dto/FinanceiroResponse). */

export type ContaApi = {
  id: number;
  tipo: "cpf" | "cnpj";
  nome: string;
  documento: string | null;
  saldoInicial: number;
  saldo: number;
};

export type CategoriaApi = {
  id: number;
  contaId: number;
  nome: string;
  tipo: "despesa" | "receita";
};

export type TransacaoApi = {
  id: number;
  contaId: number;
  contaNome: string;
  categoriaId: number | null;
  categoriaNome: string | null;
  tipo: "receita" | "despesa" | "imposto";
  valor: number;
  descricao: string;
  data: string;
};

export type TransferenciaApi = {
  id: number;
  origemContaId: number;
  origemNome: string;
  destinoContaId: number;
  destinoNome: string;
  valor: number;
  descricao: string;
  data: string;
};

export type OrcamentoApi = {
  id: number;
  categoriaId: number;
  categoria: string;
  mes: string;
  limite: number;
  gasto: number;
  percentual: number;
  estourou: boolean;
};

export type ImpostoApi = {
  id: number;
  contaId: number;
  contaNome: string;
  tipo: "irpf" | "das";
  competencia: string;
  valorEstimado: number;
  vencimento: string | null;
  pagoEm: string | null;
  pago: boolean;
};

export type FinanceiroData = {
  contas: ContaApi[];
  categorias: CategoriaApi[];
  transacoes: TransacaoApi[];
  transferencias: TransferenciaApi[];
  orcamentos: OrcamentoApi[];
  impostos: ImpostoApi[];
};

export type Recurso = keyof FinanceiroData;
export type FinanceiroPayload<K extends Recurso> = {
  data: Pick<FinanceiroData, K>;
  origem: "api" | "demo";
};

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";
const USUARIO_ID = Number(process.env.MISTERMONEY_USUARIO_ID ?? "2");

const vazio: FinanceiroData = {
  contas: [],
  categorias: [],
  transacoes: [],
  transferencias: [],
  orcamentos: [],
  impostos: [],
};

/**
 * Busca somente os recursos pedidos no backend Java. Chamada por Server
 * Components dentro de <Suspense>, com fetch por request (cache: "no-store").
 * Se a API falhar, devolve listas vazias e `origem: "demo"`; cada página
 * decide então se usa seus dados demonstrativos.
 */
export async function buscarFinanceiro<K extends Recurso>(
  ...recursos: K[]
): Promise<FinanceiroPayload<K>> {
  try {
    const respostas = await Promise.all(
      recursos.map((recurso) =>
        fetch(`${API_BASE_URL}/api/usuarios/${USUARIO_ID}/${recurso}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        }),
      ),
    );

    const dados = {} as Pick<FinanceiroData, K>;
    for (const [indice, resposta] of respostas.entries()) {
      if (!resposta.ok) {
        throw new Error(`${recursos[indice]}: API respondeu HTTP ${resposta.status}`);
      }
      const corpo: unknown = await resposta.json();
      if (!Array.isArray(corpo)) {
        throw new Error(`${recursos[indice]}: API não devolveu uma lista`);
      }
      Object.assign(dados, { [recursos[indice]]: corpo });
    }
    return { data: dados, origem: "api" };
  } catch (erro) {
    // Não engole o sinal de abort do prerender do Next 16.
    unstable_rethrow(erro);
    console.warn(
      `[financeiro] Não foi possível consultar ${API_BASE_URL}; usando dados demonstrativos.`,
      erro,
    );
    const dados = Object.fromEntries(
      recursos.map((recurso) => [recurso, vazio[recurso]]),
    ) as Pick<FinanceiroData, K>;
    return { data: dados, origem: "demo" };
  }
}
