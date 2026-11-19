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
