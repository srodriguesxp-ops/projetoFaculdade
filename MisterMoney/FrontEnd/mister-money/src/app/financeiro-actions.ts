"use server";

import { revalidatePath } from "next/cache";
import type { ImpostoApi, TransferenciaApi } from "@/lib/financeiro-api";

/**
 * Server Actions (Next 16): a chamada ao backend Java acontece no servidor,
 * então CORS não é problema e o cliente recebe só o resultado serializável.
 * Toda entrada é validada aqui mesmo vindo diretamente de um POST forjado.
 */

export type ResultadoAcao = {
  ok: boolean;
  mensagem: string;
  id?: number;
};

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8081";
const USUARIO_ID = Number(process.env.MISTERMONEY_USUARIO_ID ?? "2");

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ID_REGEX = /^\d+$/;

function inteiroPositivo(valor: number, nome: string) {
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new Error(`${nome} inválido.`);
  }
  return valor;
}

async function mensagemDoErro(resposta: Response) {
  try {
    const corpo: unknown = await resposta.json();
    if (corpo && typeof corpo === "object" && "erro" in corpo) {
      return String((corpo as { erro: unknown }).erro);
    }
  } catch {
    // A API pode responder HTML em erro de servidor; seguimos com o status.
  }
  return `A API respondeu HTTP ${resposta.status}.`;
}

function revalidarRotas(...rotas: string[]) {
  for (const rota of rotas) revalidatePath(rota);
}

export async function registrarTransferencia(input: {
  origemContaId: number;
  destinoContaId: number;
  valor: number;
  descricao: string;
  data: string;
}): Promise<ResultadoAcao> {
  const origem = inteiroPositivo(input.origemContaId, "Conta de origem");
  const destino = inteiroPositivo(input.destinoContaId, "Conta de destino");
  if (origem === destino) {
    return { ok: false, mensagem: "Escolha duas contas diferentes." };
  }
  const valor = Number(input.valor);
  if (!Number.isFinite(valor) || valor <= 0) {
    return { ok: false, mensagem: "Informe um valor válido." };
  }
  const descricao = String(input.descricao ?? "").trim().slice(0, 200);
  const data = String(input.data ?? "");
  if (!DATA_REGEX.test(data) || Number.isNaN(Date.parse(`${data}T12:00:00`))) {
    return { ok: false, mensagem: "Data da transferência inválida." };
  }

  try {
    const resposta = await fetch(
      `${API_BASE_URL}/api/usuarios/${USUARIO_ID}/transferencias`,
      {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          origemContaId: origem,
          destinoContaId: destino,
          valor,
          descricao: descricao || "Transferência Pix",
          data,
        }),
      },
    );

    if (!resposta.ok) {
      return { ok: false, mensagem: await mensagemDoErro(resposta) };
    }
    const criada = (await resposta.json()) as TransferenciaApi;
    revalidarRotas("/transferencias", "/extrato", "/carteira", "/");
    return {
      ok: true,
      mensagem: `Transferência de R$ ${valor.toFixed(2)} registrada no banco.`,
      id: criada.id,
    };
  } catch (erro) {
    console.error("[financeiro] Falha ao registrar transferência:", erro);
    return { ok: false, mensagem: "Não foi possível gravar no banco. Tente novamente." };
  }
}

// ---------------------------------------------------------------- CRUD da gestão

type Corpo = Record<string, unknown>;

async function salvarNoBackend(
  recurso: string,
  corpo: Corpo,
  id?: number,
): Promise<ResultadoAcao> {
  if (id !== undefined && !ID_REGEX.test(String(id))) {
    return { ok: false, mensagem: "ID inválido." };
  }
  try {
    const resposta = await fetch(
      `${API_BASE_URL}/api/usuarios/${USUARIO_ID}/${recurso}${id !== undefined ? `/${id}` : ""}`,
      {
        method: id === undefined ? "POST" : "PUT",
        cache: "no-store",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(corpo),
      },
    );
    if (!resposta.ok) {
      return { ok: false, mensagem: await mensagemDoErro(resposta) };
    }
    const salvo = (await resposta.json()) as { id?: number };
    revalidarRotas(
      "/gerenciar",
      "/carteira",
      "/extrato",
      "/transferencias",
      "/impostos-mei",
      "/",
    );
    return {
      ok: true,
      mensagem: id === undefined ? "Registro criado no banco." : "Registro atualizado no banco.",
      id: salvo.id,
    };
  } catch (erro) {
    console.error(`[financeiro] Falha ao salvar ${recurso}:`, erro);
    return { ok: false, mensagem: "Não foi possível gravar no banco. Tente novamente." };
  }
}

async function excluirDoBackend(
  recurso: string,
  id: number,
): Promise<ResultadoAcao> {
  if (!ID_REGEX.test(String(id))) {
    return { ok: false, mensagem: "ID inválido." };
  }
  try {
    const resposta = await fetch(
      `${API_BASE_URL}/api/usuarios/${USUARIO_ID}/${recurso}/${id}`,
      { method: "DELETE", cache: "no-store" },
    );
    if (!resposta.ok) {
      return { ok: false, mensagem: await mensagemDoErro(resposta) };
    }
    revalidarRotas(
      "/gerenciar",
      "/carteira",
      "/extrato",
      "/transferencias",
      "/impostos-mei",
      "/",
    );
    return { ok: true, mensagem: "Registro excluído do banco." };
  } catch (erro) {
    console.error(`[financeiro] Falha ao excluir ${recurso}:`, erro);
    return { ok: false, mensagem: "Não foi possível excluir. Tente novamente." };
  }
}

const texto = (valor: unknown, nome: string, max: number, obrigatorio = true) => {
  const resultado = String(valor ?? "").trim();
  if (obrigatorio && !resultado) throw new Error(`${nome} é obrigatório.`);
  if (resultado.length > max) throw new Error(`${nome} excede ${max} caracteres.`);
  return resultado;
};

const numero = (valor: unknown, nome: string, minimo: number) => {
  const resultado = Number(valor);
  if (!Number.isFinite(resultado) || resultado < minimo) {
    throw new Error(`${nome} inválido.`);
  }
  return resultado;
};

const chaveEstrangeira = (valor: unknown, nome: string) =>
  inteiroPositivo(Number(valor), nome);

const dataIso = (valor: unknown) => {
  const resultado = String(valor ?? "");
  if (!DATA_REGEX.test(resultado) || Number.isNaN(Date.parse(`${resultado}T12:00:00`))) {
    throw new Error("Data inválida.");
  }
  return resultado;
};

const competenciaIso = (valor: unknown) => {
  const resultado = String(valor ?? "").slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(resultado)) {
    throw new Error("Competência deve estar no formato AAAA-MM.");
  }
  const mes = Number(resultado.slice(5));
  if (mes < 1 || mes > 12) throw new Error("Mês da competência inválido.");
  return resultado;
};

async function executar(fn: () => Corpo | Promise<Corpo>, recurso: string, id?: number) {
  try {
    const corpo = await fn();
    return await salvarNoBackend(recurso, corpo, id);
  } catch (erro) {
    return {
      ok: false,
      mensagem: erro instanceof Error ? erro.message : "Dados inválidos.",
    };
  }
}

export async function salvarConta(dados: Corpo, id?: number) {
  return await executar(() => {
    const tipo = texto(dados.tipo, "Tipo", 10).toLowerCase();
    if (tipo !== "cpf" && tipo !== "cnpj") throw new Error("Tipo de conta inválido.");
    return {
      tipo,
      nome: texto(dados.nome, "Nome", 80),
      documento: texto(dados.documento, "Documento", 30, false) || null,
      saldoInicial: numero(dados.saldoInicial, "Saldo inicial", 0),
    };
  }, "contas", id);
}

export async function excluirConta(id: number) {
  return await excluirDoBackend("contas", id);
}

export async function salvarCategoria(dados: Corpo, id?: number) {
  return await executar(() => {
    const tipo = texto(dados.tipo, "Tipo", 20).toLowerCase();
    if (tipo !== "despesa" && tipo !== "receita") throw new Error("Tipo de categoria inválido.");
    return {
      contaId: chaveEstrangeira(dados.contaId, "Conta"),
      nome: texto(dados.nome, "Nome", 80),
      tipo,
    };
  }, "categorias", id);
}

export async function excluirCategoria(id: number) {
  return await excluirDoBackend("categorias", id);
}

export async function salvarTransacao(dados: Corpo, id?: number) {
  return await executar(() => {
    const tipo = texto(dados.tipo, "Tipo", 20).toLowerCase();
    if (tipo !== "receita" && tipo !== "despesa" && tipo !== "imposto") {
      throw new Error("Tipo de transação inválido.");
    }
    const categoria = texto(dados.categoriaId, "Categoria", 20, false);
    return {
      contaId: chaveEstrangeira(dados.contaId, "Conta"),
      categoriaId: categoria ? chaveEstrangeira(categoria, "Categoria") : null,
      tipo,
      valor: numero(dados.valor, "Valor", 0.01),
      descricao: texto(dados.descricao, "Descrição", 160),
      data: dataIso(dados.data),
    };
  }, "transacoes", id);
}

export async function excluirTransacao(id: number) {
  return await excluirDoBackend("transacoes", id);
}

export async function salvarOrcamento(dados: Corpo, id?: number) {
  return await executar(() => ({
    categoriaId: chaveEstrangeira(dados.categoriaId, "Categoria"),
    mes: competenciaIso(dados.mes),
    limite: numero(dados.limite, "Limite", 0.01),
  }), "orcamentos", id);
}

export async function excluirOrcamento(id: number) {
  return await excluirDoBackend("orcamentos", id);
}

export async function pagarImposto(impostoId: number): Promise<ResultadoAcao> {
  if (!ID_REGEX.test(String(impostoId))) {
    return { ok: false, mensagem: "Guia inválida." };
  }

  try {
    const base = `${API_BASE_URL}/api/usuarios/${USUARIO_ID}/impostos`;
    const consulta = await fetch(base, { cache: "no-store" });
    if (!consulta.ok) {
      return { ok: false, mensagem: await mensagemDoErro(consulta) };
    }

    // O cliente envia só o ID: todos os demais campos são relidos da API.
    const guias = (await consulta.json()) as ImpostoApi[];
    const guia = guias.find((item) => item.id === impostoId);
    if (!guia) {
      return { ok: false, mensagem: "Guia não encontrada para este usuário." };
    }
    if (guia.pago) {
      return { ok: true, mensagem: "Esta guia já estava quitada." };
    }

    const resposta = await fetch(`${base}/${impostoId}`, {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        contaId: guia.contaId,
        tipo: guia.tipo,
        competencia: guia.competencia.slice(0, 7),
        valorEstimado: guia.valorEstimado,
        vencimento: guia.vencimento,
        pagoEm: new Date().toISOString().slice(0, 10),
      }),
    });

    if (!resposta.ok) {
      return { ok: false, mensagem: await mensagemDoErro(resposta) };
    }
    revalidarRotas("/impostos-mei", "/extrato", "/carteira", "/");
    return { ok: true, mensagem: "DAS pago e registrado no banco." };
  } catch (erro) {
    console.error("[financeiro] Falha ao pagar guia:", erro);
    return { ok: false, mensagem: "Não foi possível registrar o pagamento. Tente novamente." };
  }
}
