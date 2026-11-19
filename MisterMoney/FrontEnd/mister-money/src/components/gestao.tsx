"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  excluirCategoria,
  excluirConta,
  excluirOrcamento,
  excluirTransacao,
  salvarCategoria,
  salvarConta,
  salvarOrcamento,
  salvarTransacao,
  type ResultadoAcao,
} from "@/app/financeiro-actions";
import { AppShell, type NavItem } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { brl } from "@/lib/dashboard-data";
import type {
  CategoriaApi,
  ContaApi,
  OrcamentoApi,
  TransacaoApi,
} from "@/lib/financeiro-api";

type Aba = "contas" | "categorias" | "transacoes" | "orcamentos";

type GestaoProps = {
  contas: ContaApi[];
  categorias: CategoriaApi[];
  transacoes: TransacaoApi[];
  orcamentos: OrcamentoApi[];
  origem: "api" | "demo";
};

type Formulario = {
  tipo: string;
  nome: string;
  documento: string;
  saldoInicial: string;
  contaId: string;
  categoriaId: string;
  valor: string;
  descricao: string;
  data: string;
  mes: string;
  limite: string;
};

const abas: { id: Aba; label: string; icon: "wallet" | "list" | "transfer" | "chart" }[] = [
  { id: "contas", label: "Contas", icon: "wallet" },
  { id: "categorias", label: "Categorias", icon: "list" },
  { id: "transacoes", label: "Transações", icon: "transfer" },
  { id: "orcamentos", label: "Orçamentos", icon: "chart" },
];

const formularioVazio: Formulario = {
  tipo: "despesa",
  nome: "",
  documento: "",
  saldoInicial: "",
  contaId: "",
  categoriaId: "",
  valor: "",
  descricao: "",
  data: "",
  mes: "",
  limite: "",
};

const inputCls =
  "focus-ring w-full rounded-[10px] border border-asset/[0.06] bg-[#010122] px-3 py-2 text-[12px] text-content outline-none placeholder:text-faint";
const botaoCls =
  "focus-ring rounded-[4px] border border-asset/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-gold/30 hover:text-content disabled:cursor-wait disabled:opacity-50";
const rodapeCls =
  "grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 border-y hairline px-5 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-faint sm:px-7";

const numero = (valor: string) => Number(valor.replace(",", "."));
const hoje = () => new Date().toISOString().slice(0, 10);
const competenciaAtual = () => hoje().slice(0, 7);

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="text-[11px] font-medium text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function Gestao({
  contas,
  categorias,
  transacoes,
  orcamentos,
  origem,
}: GestaoProps) {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("contas");
  const [formulario, setFormulario] = useState<Formulario>(formularioVazio);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [confirmacaoId, setConfirmacaoId] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("agora");

  // As listas vêm direto das props: revalidatePath na Server Action já traz
  // o RSC atualizado na mesma resposta, sem estado espelho no cliente.
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (mensagem: string) => setToast(mensagem);
  const atualizar = (campo: keyof Formulario, valor: string) =>
    setFormulario((atual) => ({ ...atual, [campo]: valor }));

  const handleNav = (item: NavItem) => {
    const rotas: Record<string, string> = {
      overview: "/",
      wallet: "/carteira",
      taxes: "/impostos-mei",
      transfers: "/transferencias",
      cards: "/cartoes",
      investments: "/investimentos",
      statement: "/extrato",
      manage: "/gerenciar",
    };
    const rota = rotas[item.id];
    if (rota) router.push(rota);
    else notify(`${item.label}: painel em preparação`);
  };

  const refresh = () => {
    setUpdatedAt(
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    router.refresh();
    notify("Dados atualizados agora");
  };

  const abrirNovo = () => {
    if (origem === "demo") {
      notify("A API está indisponível: não é possível gravar dados.");
      return;
    }
    setFormulario({
      ...formularioVazio,
      data: hoje(),
      mes: competenciaAtual(),
      contaId: String(contas[0]?.id ?? ""),
      categoriaId: String(categorias[0]?.id ?? ""),
    });
    setEditandoId(null);
    setErro("");
    setFormAberto(true);
  };

  const abrirEdicao = (registro: ContaApi | CategoriaApi | TransacaoApi | OrcamentoApi) => {
    if (origem === "demo") {
      notify("A API está indisponível: não é possível editar dados.");
      return;
    }
    setEditandoId(registro.id);
    setErro("");
    if (aba === "contas") {
      const item = registro as ContaApi;
      setFormulario({
        ...formularioVazio,
        tipo: item.tipo,
        nome: item.nome,
        documento: item.documento ?? "",
        saldoInicial: String(item.saldoInicial),
      });
    } else if (aba === "categorias") {
      const item = registro as CategoriaApi;
      setFormulario({
        ...formularioVazio,
        tipo: item.tipo,
        nome: item.nome,
        contaId: String(item.contaId),
      });
    } else if (aba === "transacoes") {
      const item = registro as TransacaoApi;
      setFormulario({
        ...formularioVazio,
        tipo: item.tipo,
        contaId: String(item.contaId),
        categoriaId: item.categoriaId === null ? "" : String(item.categoriaId),
        valor: String(item.valor),
        descricao: item.descricao,
        data: item.data,
      });
    } else {
      const item = registro as OrcamentoApi;
      setFormulario({
        ...formularioVazio,
        categoriaId: String(item.categoriaId),
        mes: item.mes.slice(0, 7),
        limite: String(item.limite),
      });
    }
    setFormAberto(true);
  };

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      let resultado: ResultadoAcao;
      if (aba === "contas") {
        resultado = await salvarConta(
          {
            tipo: formulario.tipo,
            nome: formulario.nome,
            documento: formulario.documento,
            saldoInicial: numero(formulario.saldoInicial),
          },
          editandoId ?? undefined,
        );
      } else if (aba === "categorias") {
        resultado = await salvarCategoria(
          { contaId: numero(formulario.contaId), nome: formulario.nome, tipo: formulario.tipo },
          editandoId ?? undefined,
        );
      } else if (aba === "transacoes") {
        resultado = await salvarTransacao(
          {
            contaId: numero(formulario.contaId),
            categoriaId: formulario.categoriaId || null,
            tipo: formulario.tipo,
            valor: numero(formulario.valor),
            descricao: formulario.descricao,
            data: formulario.data,
          },
          editandoId ?? undefined,
        );
      } else {
        resultado = await salvarOrcamento(
          {
            categoriaId: numero(formulario.categoriaId),
            mes: formulario.mes,
            limite: numero(formulario.limite),
          },
          editandoId ?? undefined,
        );
      }
      if (!resultado.ok) throw new Error(resultado.mensagem);
      notify(resultado.mensagem);
      setFormAberto(false);
      setFormulario(formularioVazio);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id: number) => {
    if (confirmacaoId !== id) {
      setConfirmacaoId(id);
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      let resultado: ResultadoAcao;
      if (aba === "contas") {
        resultado = await excluirConta(id);
      } else if (aba === "categorias") {
        resultado = await excluirCategoria(id);
      } else if (aba === "transacoes") {
        resultado = await excluirTransacao(id);
      } else {
        resultado = await excluirOrcamento(id);
      }
      if (!resultado.ok) throw new Error(resultado.mensagem);
      notify(resultado.mensagem);
      setConfirmacaoId(null);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível excluir.");
    } finally {
      setSalvando(false);
    }
  };

  const acoes = (id: number) => (
    <div className="flex items-center justify-end gap-1.5">
      <button type="button" onClick={() => abrirEdicao(
        (aba === "contas" ? contas : aba === "categorias" ? categorias : aba === "transacoes" ? transacoes : orcamentos)
          .find((item) => item.id === id)!,
      )} className={botaoCls} aria-label={`Editar registro ${id}`}>
        Editar
      </button>
      <button
        type="button"
        onClick={() => excluir(id)}
        disabled={salvando}
        className={`${botaoCls} ${confirmacaoId === id ? "border-red-400/50 text-red-300" : ""}`}
        aria-label={`Excluir registro ${id}`}
      >
        {confirmacaoId === id ? "Confirmar" : "Excluir"}
      </button>
    </div>
  );

  const cabecalhoAcoes = <span className="text-right">Ações</span>;

  return (
    <AppShell
      active="manage"
      title="Gestão financeira"
      updatedAt={updatedAt}
      toast={toast}
      onNavigate={handleNav}
      onNotify={notify}
      onRefresh={refresh}
    >
      <div className="panel-in w-full">
        <section className="border-b hairline px-5 py-6 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="overline">Banco de dados</p>
              <h1 className="mt-2 text-[26px] font-semibold tracking-tight sm:text-[32px]">
                Gestão financeira
              </h1>
              <p className="mt-1.5 max-w-xl text-[12px] leading-relaxed text-muted">
                Cadastre, edite e exclua contas, categorias, lançamentos e
                orçamentos diretamente no banco via API.
              </p>
            </div>
            <span className="glass-soft shrink-0 rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-muted">
              {origem === "api" ? "Dados do banco" : "API indisponível"}
            </span>
          </div>
        </section>

        <section className="px-5 py-5 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Recursos">
              {abas.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={aba === item.id}
                  onClick={() => {
                    setAba(item.id);
                    setFormAberto(false);
                    setErro("");
                    setConfirmacaoId(null);
                  }}
                  className={`focus-ring flex items-center gap-1.5 rounded-[4px] border px-3 py-2 text-[11px] font-medium transition-colors ${
                    aba === item.id
                      ? "module-soft module-text module-border"
                      : "border-asset/[0.06] text-muted hover:text-content"
                  }`}
                >
                  <Icon name={item.icon} size={13} />
                  {item.label}
                  <span className="tabular text-[10px] opacity-60">
                    {item.id === "contas"
                      ? contas.length
                      : item.id === "categorias"
                        ? categorias.length
                        : item.id === "transacoes"
                          ? transacoes.length
                          : orcamentos.length}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={abrirNovo}
              className="module-button focus-ring flex items-center gap-1.5 rounded-[4px] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em]"
            >
              <Icon name="plus" size={14} />
              Novo
            </button>
          </div>

          {formAberto && (
            <form
              onSubmit={enviar}
              className="glass-soft mt-4 rounded-[10px] border border-asset/[0.07] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[13px] font-semibold">
                  {editandoId === null ? "Novo registro" : `Editando #${editandoId}`}
                </h2>
                <button
                  type="button"
                  onClick={() => setFormAberto(false)}
                  className="focus-ring rounded p-1 text-muted hover:text-content"
                  aria-label="Fechar formulário"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {aba === "contas" && (
                  <>
                    <Campo label="Tipo">
                      <select className={inputCls} value={formulario.tipo}
                        onChange={(event) => atualizar("tipo", event.target.value)}>
                        <option value="cpf">Pessoal (CPF)</option>
                        <option value="cnpj">Empresa (CNPJ)</option>
                      </select>
                    </Campo>
                    <Campo label="Nome">
                      <input className={inputCls} value={formulario.nome} required
                        placeholder="Ex.: Conta de reserva"
                        onChange={(event) => atualizar("nome", event.target.value)} />
                    </Campo>
                    <Campo label="Documento (opcional)">
                      <input className={inputCls} value={formulario.documento}
                        placeholder="Só dígitos"
                        onChange={(event) => atualizar("documento", event.target.value)} />
                    </Campo>
                    <Campo label="Saldo inicial (R$)">
                      <input className={inputCls} type="number" step="0.01" min="0" required
                        value={formulario.saldoInicial}
                        onChange={(event) => atualizar("saldoInicial", event.target.value)} />
                    </Campo>
                  </>
                )}

                {aba === "categorias" && (
                  <>
                    <Campo label="Conta">
                      <select className={inputCls} value={formulario.contaId} required
                        onChange={(event) => atualizar("contaId", event.target.value)}>
                        {contas.map((conta) => (
                          <option key={conta.id} value={conta.id}>{conta.nome}</option>
                        ))}
                      </select>
                    </Campo>
                    <Campo label="Nome">
                      <input className={inputCls} value={formulario.nome} required
                        placeholder="Ex.: Alimentação"
                        onChange={(event) => atualizar("nome", event.target.value)} />
                    </Campo>
                    <Campo label="Tipo">
                      <select className={inputCls} value={formulario.tipo}
                        onChange={(event) => atualizar("tipo", event.target.value)}>
                        <option value="despesa">Despesa</option>
                        <option value="receita">Receita</option>
                      </select>
                    </Campo>
                  </>
                )}

                {aba === "transacoes" && (
                  <>
                    <Campo label="Conta">
                      <select className={inputCls} value={formulario.contaId} required
                        onChange={(event) => atualizar("contaId", event.target.value)}>
                        {contas.map((conta) => (
                          <option key={conta.id} value={conta.id}>{conta.nome}</option>
                        ))}
                      </select>
                    </Campo>
                    <Campo label="Categoria (opcional)">
                      <select className={inputCls} value={formulario.categoriaId}
                        onChange={(event) => atualizar("categoriaId", event.target.value)}>
                        <option value="">Sem categoria</option>
                        {categorias.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                        ))}
                      </select>
                    </Campo>
                    <Campo label="Tipo">
                      <select className={inputCls} value={formulario.tipo}
                        onChange={(event) => atualizar("tipo", event.target.value)}>
                        <option value="despesa">Despesa</option>
                        <option value="receita">Receita</option>
                        <option value="imposto">Imposto</option>
                      </select>
                    </Campo>
                    <Campo label="Valor (R$)">
                      <input className={inputCls} type="number" step="0.01" min="0.01" required
                        value={formulario.valor}
                        onChange={(event) => atualizar("valor", event.target.value)} />
                    </Campo>
                    <Campo label="Data">
                      <input className={inputCls} type="date" required value={formulario.data}
                        onChange={(event) => atualizar("data", event.target.value)} />
                    </Campo>
                    <Campo label="Descrição">
                      <input className={inputCls} value={formulario.descricao} required
                        placeholder="Ex.: Supermercado"
                        onChange={(event) => atualizar("descricao", event.target.value)} />
                    </Campo>
                  </>
                )}

                {aba === "orcamentos" && (
                  <>
                    <Campo label="Categoria">
                      <select className={inputCls} value={formulario.categoriaId} required
                        onChange={(event) => atualizar("categoriaId", event.target.value)}>
                        {categorias.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                        ))}
                      </select>
                    </Campo>
                    <Campo label="Competência">
                      <input className={inputCls} type="month" required value={formulario.mes}
                        onChange={(event) => atualizar("mes", event.target.value)} />
                    </Campo>
                    <Campo label="Limite (R$)">
                      <input className={inputCls} type="number" step="0.01" min="0.01" required
                        value={formulario.limite}
                        onChange={(event) => atualizar("limite", event.target.value)} />
                    </Campo>
                  </>
                )}
              </div>

              {erro && <p className="mt-3 text-[11px] text-red-300" role="alert">{erro}</p>}

              <div className="mt-4 flex items-center gap-2">
                <button type="submit" disabled={salvando} className={botaoCls}>
                  {salvando ? "Gravando..." : "Salvar no banco"}
                </button>
                <button type="button" onClick={() => setFormAberto(false)} className={botaoCls}>
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {erro && !formAberto && (
            <p className="mt-3 text-[11px] text-red-300" role="alert">{erro}</p>
          )}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[12px]">
              {aba === "contas" && (
                <>
                  <thead>
                    <tr className={rodapeCls}>
                      <th className="text-left">Nome</th>
                      <th className="text-left">Tipo</th>
                      <th className="text-left">Documento</th>
                      <th className="text-right">Saldo</th>
                      <th className="text-right">{cabecalhoAcoes}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-asset/[0.06]">
                    {contas.map((item) => (
                      <tr key={item.id} className="py-2.5">
                        <td className="py-2.5 pr-3 font-medium">{item.nome}</td>
                        <td className="py-2.5 pr-3 text-muted">{item.tipo.toUpperCase()}</td>
                        <td className="py-2.5 pr-3 text-muted">{item.documento ?? "—"}</td>
                        <td className="tabular py-2.5 pr-3 text-right">{brl(item.saldo)}</td>
                        <td className="py-2.5 text-right">{acoes(item.id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {aba === "categorias" && (
                <>
                  <thead>
                    <tr className={rodapeCls}>
                      <th className="text-left">Nome</th>
                      <th className="text-left">Tipo</th>
                      <th className="text-left">Conta</th>
                      <th className="text-right">{cabecalhoAcoes}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-asset/[0.06]">
                    {categorias.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 pr-3 font-medium">{item.nome}</td>
                        <td className="py-2.5 pr-3 text-muted">{item.tipo}</td>
                        <td className="py-2.5 pr-3 text-muted">
                          {contas.find((conta) => conta.id === item.contaId)?.nome ?? "—"}
                        </td>
                        <td className="py-2.5 text-right">{acoes(item.id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {aba === "transacoes" && (
                <>
                  <thead>
                    <tr className={rodapeCls}>
                      <th className="text-left">Data</th>
                      <th className="text-left">Descrição</th>
                      <th className="text-left">Conta / categoria</th>
                      <th className="text-right">Valor</th>
                      <th className="text-right">{cabecalhoAcoes}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-asset/[0.06]">
                    {transacoes.map((item) => (
                      <tr key={item.id}>
                        <td className="tabular py-2.5 pr-3 text-muted">{item.data}</td>
                        <td className="py-2.5 pr-3 font-medium">
                          {item.descricao}
                          <span className="ml-2 text-[10px] uppercase text-faint">{item.tipo}</span>
                        </td>
                        <td className="py-2.5 pr-3 text-muted">
                          {item.contaNome} · {item.categoriaNome ?? "Sem categoria"}
                        </td>
                        <td className="tabular py-2.5 pr-3 text-right">
                          {item.tipo === "receita" ? "+" : "-"}
                          {brl(item.valor)}
                        </td>
                        <td className="py-2.5 text-right">{acoes(item.id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {aba === "orcamentos" && (
                <>
                  <thead>
                    <tr className={rodapeCls}>
                      <th className="text-left">Competência</th>
                      <th className="text-left">Categoria</th>
                      <th className="text-right">Limite</th>
                      <th className="text-right">Gasto</th>
                      <th className="text-right">Uso</th>
                      <th className="text-right">{cabecalhoAcoes}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-asset/[0.06]">
                    {orcamentos.map((item) => (
                      <tr key={item.id}>
                        <td className="tabular py-2.5 pr-3 text-muted">{item.mes.slice(0, 7)}</td>
                        <td className="py-2.5 pr-3 font-medium">{item.categoria}</td>
                        <td className="tabular py-2.5 pr-3 text-right">{brl(item.limite)}</td>
                        <td className="tabular py-2.5 pr-3 text-right">{brl(item.gasto)}</td>
                        <td className="tabular py-2.5 pr-3 text-right">
                          {Number(item.percentual).toFixed(0)}%
                        </td>
                        <td className="py-2.5 text-right">{acoes(item.id)}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
            {((aba === "contas" && contas.length === 0) ||
              (aba === "categorias" && categorias.length === 0) ||
              (aba === "transacoes" && transacoes.length === 0) ||
              (aba === "orcamentos" && orcamentos.length === 0)) && (
              <p className="py-6 text-center text-[12px] text-muted">
                Nenhum registro encontrado para este recurso.
              </p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
