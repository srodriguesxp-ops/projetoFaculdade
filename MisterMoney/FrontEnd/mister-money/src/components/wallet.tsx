"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import {
  brl,
  shortBrl,
  transactions,
  type Transaction,
} from "@/lib/dashboard-data";
import { accounts as accountsDemo, type Account } from "@/lib/wallet-data";

type WalletProps = {
  accounts?: Account[];
  movements?: Transaction[];
  origem?: "api" | "demo";
};

export function Wallet({
  accounts: contasDaApi,
  movements: movimentacoesDaApi,
  origem = "demo",
}: WalletProps) {
  const router = useRouter();
  const contas =
    contasDaApi && contasDaApi.length > 0 ? contasDaApi : accountsDemo;
  const movimentacoes = movimentacoesDaApi ?? transactions;
  const total = contas.reduce((sum, item) => sum + item.balance, 0) || 1;
  const [selectedId, setSelectedId] = useState(contas[0].id);
  const [showBalances, setShowBalances] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("agora");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast(message);

  const selected = contas.find((account) => account.id === selectedId) ?? contas[0];
  const accountTransactions = movimentacoes.filter(
    (item) => item.accountId === selected.id,
  );
  // A tabela contas não guarda limite de crédito; com dados reais mostramos a
  // participação da conta no saldo total em vez de inventar um limite.
  const usage =
    origem === "api"
      ? (selected.balance / total) * 100
      : Math.min((selected.balance / selected.limit) * 100, 100);
  const available =
    origem === "api" ? total - selected.balance : selected.limit - selected.balance;

  const stops = contas.map((account, index) => {
    const start =
      (contas.slice(0, index).reduce((sum, item) => sum + item.balance, 0) /
        total) *
      100;
    const end = start + (account.balance / total) * 100;
    return `${account.color} ${start.toFixed(1)}% ${end.toFixed(1)}%`;
  });
  const donutGradient = `conic-gradient(${stops.join(", ")})`;

  const mask = (value: number) => (showBalances ? brl(value) : "R$ ••••••");

  const tabLabel: Record<string, string> = {
    corrente: "Corrente",
    mei: "MEI",
    reserva: "Reserva",
  };

  const handleNav = (item: NavItem) => {
    if (item.id === "overview") {
      router.push("/");
    } else if (item.id === "wallet") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (item.id === "transfers") {
      router.push("/transferencias");
    } else if (item.id === "cards") {
      router.push("/cartoes");
    } else if (item.id === "investments") {
      router.push("/investimentos");
    } else if (item.id === "taxes") {
      router.push("/impostos-mei");
    } else if (item.id === "statement") {
      router.push("/extrato");
    } else {
      notify(`${item.label}: painel em preparação`);
    }
  };

  const refresh = () => {
    setUpdatedAt(
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    notify("Dados atualizados agora");
  };

  return (
    <AppShell
      theme="theme-wallet"
      active="wallet"
      title="Minha carteira"
      updatedAt={updatedAt}
      toast={toast}
      onNavigate={handleNav}
      onNotify={notify}
      onRefresh={refresh}
    >
      <div className="panel-in w-full">
        <section className="border-b hairline pb-7">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="min-w-0">
              <p className="overline">Saldo total</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <p className="tabular text-[34px] font-semibold leading-none tracking-[-0.035em] sm:text-[44px]">
                  {mask(total)}
                </p>
                <button
                  type="button"
                  aria-label={showBalances ? "Ocultar saldos" : "Mostrar saldos"}
                  onClick={() => setShowBalances((value) => !value)}
                  className="focus-ring rounded p-1 text-muted transition-colors hover:text-accent"
                >
                  <Icon name={showBalances ? "eye" : "eyeOff"} size={16} />
                </button>
              </div>
              <p className="mt-3 text-[11px] text-muted">
                {origem === "api"
                  ? "Saldo consolidado das contas do usuário"
                  : "Variação demonstrativa em relação a outubro"}
              </p>
              {origem === "demo" && (
                <p className="mt-2 inline-flex rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-light">
                  API indisponível · dados demonstrativos
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => notify("Cadastro de conta: painel em preparação")}
                className="module-button focus-ring flex items-center gap-2 rounded-[4px] px-3.5 py-2 text-[11px] font-semibold"
              >
                <Icon name="plus" size={14} />
                Nova conta
              </button>
              <button
                type="button"
                onClick={() => notify("Transferências: painel em preparação")}
                className="focus-ring flex items-center gap-1.5 rounded-[4px] px-1 py-2 text-[11px] font-medium text-muted transition-colors hover:text-content"
              >
                Transferir
                <Icon name="chevron" size={13} />
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-10">
          <div className="min-w-0 space-y-8">
            <section>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b hairline pb-3">
                <h2 className="text-[14px] font-semibold tracking-tight">
                  Distribuição por conta
                </h2>
                <span className="text-[10px] text-faint">
                  {contas.length} contas
                </span>
              </div>

              <div className="flex flex-col items-center gap-8 py-8 sm:flex-row sm:justify-center sm:gap-10">
                <div
                  className="relative aspect-square w-full max-w-40 shrink-0 rounded-full"
                  style={{ background: donutGradient }}
                >
                  <div className="absolute inset-[13px] rounded-full bg-[#010122] shadow-[inset_0_0_0_1px_rgba(249,249,249,0.06)]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="overline">Total</span>
                    <span className="tabular mt-1 text-[12px] font-semibold text-content">
                      {showBalances ? shortBrl(total) : "••••••"}
                    </span>
                  </div>
                </div>

                <ul className="w-full min-w-0 max-w-[520px] flex-1">
                  {contas.map((account) => (
                    <li key={account.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(account.id)}
                        aria-pressed={account.id === selected.id}
                        className={`ledger-row focus-ring grid w-full grid-cols-[10px_minmax(0,1fr)_auto_36px] items-center gap-3 px-1 py-3 text-left transition-colors hover:bg-asset/[0.03] ${
                          account.id === selected.id ? "bg-asset/[0.03]" : ""
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-[2px]"
                          style={{ backgroundColor: account.color }}
                        />
                        <span className="min-w-0 truncate text-[12px] text-muted">
                          {account.name}
                        </span>
                        <span className="tabular whitespace-nowrap text-right text-[11px] font-medium">
                          {mask(account.balance)}
                        </span>
                        <span className="tabular w-9 text-right text-[10px] text-faint">
                          {Math.round((account.balance / total) * 100)}%
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section id="cartoes-carteira" className="border-t hairline pt-6">
              <div className="mx-auto w-full max-w-[720px]">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold tracking-tight">Cartões</h2>
                  <Icon name="card" size={16} className="text-faint" />
                </div>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] text-muted">
                      {selected.institution}
                    </p>
                    <p className="tabular mt-1 whitespace-nowrap text-[14px] tracking-[0.16em]">
                      •••• {selected.number.replace("•• ", "")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-faint">
                      {origem === "api" ? "Participação" : "Comprometido"}
                    </p>
                    <p className="tabular mt-1 text-[12px] font-semibold text-accent">
                      {Math.round(usage)}%
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-asset/10">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${usage}%` }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-y hairline bg-asset/[0.02]">
                  <div className="min-w-0 px-3 py-3 sm:px-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-faint">
                      {origem === "api" ? "Saldo da conta" : "Limite total"}
                    </p>
                    <p className="tabular mt-1 truncate text-[12px] font-medium">
                      {mask(origem === "api" ? selected.balance : selected.limit)}
                    </p>
                  </div>
                  <div className="min-w-0 border-l hairline px-3 py-3 sm:px-4">
                    <p className="text-[9px] uppercase tracking-[0.16em] text-faint">
                      {origem === "api" ? "Demais contas" : "Disponível"}
                    </p>
                    <p className="tabular mt-1 truncate text-[12px] font-medium text-accent">
                      {mask(available)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => notify("Gerenciamento de cartões: painel em preparação")}
                  className="focus-ring mt-4 flex w-full items-center justify-between text-[11px] font-medium text-muted transition-colors hover:text-content"
                >
                  Gerenciar cartões
                  <Icon name="chevron" size={14} />
                </button>
              </div>
            </section>
          </div>

          <section className="mx-auto w-full max-w-[520px]">
            <div className="flex items-center justify-between gap-3 border-b hairline pb-3">
              <h2 className="text-[14px] font-semibold tracking-tight">Contas</h2>
              <span className="text-[10px] text-faint">
                {contas.length} ativas
              </span>
            </div>

            <div className="flex gap-1 border-b hairline">
              {contas.map((account) => {
                const active = account.id === selected.id;
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setSelectedId(account.id)}
                    aria-pressed={active}
                    className={`focus-ring relative min-w-0 flex-1 truncate pb-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                      active ? "text-accent" : "text-faint hover:text-content"
                    }`}
                  >
                    {tabLabel[account.id] ?? account.name}
                    {active && (
                      <span className="absolute inset-x-0 -bottom-px h-px bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-1">
              {contas.map((account) => {
                const active = account.id === selected.id;
                const progress = Math.min((account.balance / account.limit) * 100, 100);
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setSelectedId(account.id)}
                    aria-pressed={active}
                    className={`ledger-row focus-ring flex w-full items-center gap-3 px-1 py-4 text-left transition-colors ${
                      active ? "bg-asset/[0.03]" : "hover:bg-asset/[0.02]"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: account.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium">
                        {account.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-faint">
                        {account.institution} · {account.number}
                      </span>
                      <span className="mt-2 block h-0.5 w-full max-w-40 overflow-hidden rounded-full bg-asset/[0.07]">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${progress}%`, backgroundColor: account.color }}
                        />
                      </span>
                    </span>
                    <span className="tabular shrink-0 text-right text-[11px] font-semibold">
                      {mask(account.balance)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section id="movimentacoes-carteira" className="mt-8 border-t hairline pt-6">
          <div className="mx-auto w-full max-w-[980px]">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[14px] font-semibold tracking-tight">
                  Movimentações
                </h2>
                <p className="mt-1 truncate text-[10px] text-faint">
                  {selected.name} · últimos lançamentos
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNav({ id: "statement", label: "Extrato", icon: "list" })}
                className="focus-ring flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-accent hover:underline"
              >
                Ver extrato
                <Icon name="chevron" size={13} />
              </button>
            </div>

            <div className="mt-5 hidden grid-cols-[84px_minmax(0,1fr)_110px_112px] gap-4 border-b hairline pb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-faint md:grid">
              <span>Data</span>
              <span>Descrição</span>
              <span>Categoria</span>
              <span className="text-right">Valor</span>
            </div>

            <ul className="mt-1">
              {accountTransactions.map((item) => {
                const category = item.detail.split("•").pop()?.trim() || item.detail;
                return (
                  <li
                    key={item.id}
                    className="ledger-row grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 py-4 md:grid-cols-[84px_minmax(0,1fr)_110px_112px] md:items-center"
                  >
                    <span className="hidden whitespace-nowrap text-[10px] text-faint md:block">
                      {item.date}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium">{item.title}</p>
                      <p className="mt-0.5 truncate text-[10px] text-faint md:hidden">
                        {item.date} · {category}
                      </p>
                      <p className="mt-0.5 hidden truncate text-[10px] text-faint md:block">
                        {item.detail}
                      </p>
                    </div>
                    <span className="hidden min-w-0 truncate text-[10px] text-muted md:block">
                      {category}
                    </span>
                    <p
                      className={`tabular whitespace-nowrap text-right text-[12px] font-semibold ${
                        item.kind === "income" ? "text-accent" : "text-content"
                      }`}
                    >
                      {showBalances
                        ? `${item.amount > 0 ? "+ " : "- "}${brl(Math.abs(item.amount))}`
                        : "R$ ••••"}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
