"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { Icon, type IconName } from "@/components/icons";
import { ExpenseChart } from "@/components/expense-chart";
import {
  brl,
  expenseSeries,
  transactions,
  type Period,
} from "@/lib/dashboard-data";
import { totalBalance } from "@/lib/wallet-data";

const stats = [
  {
    label: "Gastos mensais",
    value: 4250,
    icon: "arrowDown" as const,
    highlight: false,
  },
  {
    label: "Imposto MEI",
    value: 120,
    icon: "calendar" as const,
    highlight: false,
  },
  {
    label: "Retorno do mês",
    value: 1450,
    icon: "arrowUp" as const,
    highlight: true,
  },
];

const summaryLabels = ["Despesas do mês", "MEI", "Rentabilidade"];

const quickActions: { label: string; icon: IconName; id: string }[] = [
  { label: "Saldo", icon: "wallet", id: "balance" },
  { label: "Cartões", icon: "card", id: "cards" },
  { label: "Investir", icon: "chart", id: "investments" },
  { label: "Extrato", icon: "list", id: "statement" },
];

export function Dashboard() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("6m");
  const [showBalances, setShowBalances] = useState(true);
  const [expandedStatement, setExpandedStatement] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");
  const [toast, setToast] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("agora");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast(message);

  const handleNav = (item: NavItem) => {
    setActiveNav(item.id);
    if (item.id === "overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (item.id === "wallet") {
      router.push("/carteira");
    } else if (item.id === "transfers") {
      router.push("/transferencias");
    } else if (item.id === "taxes") {
      router.push("/impostos-mei");
    } else if (item.id === "cards") {
      router.push("/cartoes");
    } else if (item.id === "investments") {
      router.push("/investimentos");
    } else if (item.id === "statement") {
      router.push("/extrato");
    } else {
      notify(`${item.label}: painel em preparação`);
    }
  };

  const handleAction = (id: string) => {
    if (id === "balance") {
      setShowBalances((value) => !value);
      notify(showBalances ? "Saldos ocultados" : "Saldos visíveis");
    } else if (id === "cards") {
      router.push("/cartoes");
    } else if (id === "investments") {
      router.push("/investimentos");
    } else if (id === "statement") {
      router.push("/extrato");
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

  const mask = (value: number) => (showBalances ? brl(value) : "R$ ••••••");
  const series = expenseSeries[period];
  const periodTotal = series.reduce((sum, item) => sum + item.value, 0);
  const visibleTransactions = expandedStatement
    ? transactions
    : transactions.slice(0, 3);

  return (
    <AppShell
      active={activeNav}
      title="Visão geral"
      updatedAt={updatedAt}
      toast={toast}
      onNavigate={handleNav}
      onNotify={notify}
      onRefresh={refresh}
      theme="theme-overview"
    >
      <div className="panel-in">
        <section className="border-y border-asset/[0.08] bg-asset/[0.02]">
          <div className="flex flex-col gap-5 px-5 py-6 sm:px-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Visão geral
              </p>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                Saldo total
              </p>
              <p className="tabular mt-1 text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-none tracking-tight text-content">
                {mask(totalBalance)}
              </p>
              <p className="mt-3 text-[11px] text-faint">Dados demonstrativos</p>
            </div>

            <div className="flex w-full flex-wrap border-y border-asset/[0.06] sm:w-auto sm:border-0">
              <div className="ticker-item min-w-[96px] flex-1 px-3 py-2.5 sm:min-w-[118px] sm:flex-none sm:px-4">
                <p className="text-[9px] font-semibold uppercase leading-tight tracking-[0.14em] text-faint min-h-[23px] sm:min-h-0 sm:text-[10px]">
                  Despesas do mês
                </p>
                <p className="tabular mt-1.5 text-[13px] font-semibold leading-none text-content sm:text-[15px]">
                  {mask(stats[0].value)}
                </p>
              </div>
              <div className="ticker-item min-w-[96px] flex-1 px-3 py-2.5 sm:min-w-[118px] sm:flex-none sm:px-4">
                <p className="text-[9px] font-semibold uppercase leading-tight tracking-[0.14em] text-faint min-h-[23px] sm:min-h-0 sm:text-[10px]">
                  MEI
                </p>
                <p className="tabular mt-1.5 text-[13px] font-semibold leading-none text-content sm:text-[15px]">
                  {mask(stats[1].value)}
                </p>
              </div>
              <div className="ticker-item min-w-[96px] flex-1 px-3 py-2.5 sm:min-w-[118px] sm:flex-none sm:px-4">
                <p className="text-[9px] font-semibold uppercase leading-tight tracking-[0.14em] text-faint min-h-[23px] sm:min-h-0 sm:text-[10px]">
                  Rentabilidade
                </p>
                <p className="tabular mt-1.5 text-[13px] font-semibold leading-none text-gold-light sm:text-[15px]">
                  {mask(stats[2].value)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="resumo"
          className="mt-4 grid grid-cols-1 border-y border-asset/[0.08] bg-asset/[0.02] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:divide-x lg:divide-asset/[0.08]"
        >
          <div className="px-5 py-5 sm:px-7">
            <h2 className="text-[13px] font-semibold tracking-tight">Resumo</h2>
            <ul className="mt-3 divide-y divide-asset/[0.06]">
              {stats.map((stat, index) => (
                <li key={stat.label} className="flex items-center gap-3 py-2.5">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      stat.highlight
                        ? "bg-gold/10 text-gold-light"
                        : "bg-asset/[0.04] text-muted"
                    }`}
                  >
                    <Icon name={stat.icon} size={14} />
                  </span>
                  <span className="flex-1 truncate text-[12px] text-muted">
                    {summaryLabels[index]}
                  </span>
                  <span
                    className={`tabular text-[13px] font-semibold ${
                      stat.highlight ? "text-gold-light" : "text-content"
                    }`}
                  >
                    {mask(stat.value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-5 py-5 sm:px-7">
            <h2 className="text-[13px] font-semibold tracking-tight">
              Ações rápidas
            </h2>
            <div className="mt-3 divide-y divide-asset/[0.06]">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleAction(action.id)}
                  className="focus-ring flex w-full items-center gap-3 py-2.5 text-left text-[12px] text-muted transition-colors hover:text-content"
                >
                  <Icon name={action.icon} size={15} />
                  <span className="flex-1">{action.label}</span>
                  <Icon name="chevron" size={13} className="text-faint" />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 border-y border-asset/[0.08] bg-asset/[0.02]">
          <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-7">
            <div>
              <h2 className="text-[13px] font-semibold tracking-tight">
                Despesas do mês
              </h2>
              <p className="mt-0.5 text-[11px] text-muted">
                Últimos {period === "6m" ? "6" : "12"} meses
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Despesa
              </span>
              <div className="glass-soft flex rounded-lg p-1">
                {(["6m", "12m"] as Period[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPeriod(option)}
                    className={`focus-ring rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      period === option
                        ? "bg-gold text-[#010122]"
                        : "text-muted hover:text-content"
                    }`}
                    aria-pressed={period === option}
                  >
                    {option === "6m" ? "6 meses" : "12 meses"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-asset/[0.06] px-5 pb-2 sm:px-7">
            <ExpenseChart data={series} key={period} />
          </div>

          <div className="grid grid-cols-1 gap-2 border-t border-asset/[0.06] px-5 py-3 text-[11px] text-muted sm:grid-cols-2 sm:px-7">
            <span>
              Total no período{" "}
              <strong className="tabular ml-1 text-[12px] font-semibold text-content">
                {mask(periodTotal)}
              </strong>
            </span>
            <span>
              Média mensal{" "}
              <strong className="tabular ml-1 text-[12px] font-semibold text-gold-light">
                {mask(periodTotal / series.length)}
              </strong>
            </span>
          </div>
        </section>

        <section
          id="movimentacoes"
          className="mt-4 border-y border-asset/[0.08] bg-asset/[0.02]"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-4 sm:px-7">
            <h2 className="text-[13px] font-semibold tracking-tight">
              Últimas movimentações
            </h2>
            <button
              type="button"
              onClick={() => setExpandedStatement((value) => !value)}
              className="focus-ring flex items-center gap-1 text-[11px] font-medium text-gold-light hover:underline"
            >
              {expandedStatement ? "Mostrar menos" : "Ver extrato"}
              <Icon
                name="chevron"
                size={13}
                className={expandedStatement ? "-rotate-90" : ""}
              />
            </button>
          </div>

          <div className="grid grid-cols-[70px_28px_minmax(0,1fr)_104px] gap-3 border-y border-asset/[0.06] bg-asset/[0.015] px-5 py-2 text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-faint sm:px-7">
            <span>Hora</span>
            <span aria-hidden="true" />
            <span>Operação</span>
            <span className="text-right">Valor</span>
          </div>

          <ul className="divide-y divide-asset/[0.06] px-5 sm:px-7">
            {visibleTransactions.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2.5">
                <span className="tabular font-mono w-[70px] shrink-0 text-[9px] text-faint">
                  {item.date}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    item.kind === "income"
                      ? "bg-gold/10 text-gold-light"
                      : "bg-asset/[0.04] text-muted"
                  }`}
                >
                  <Icon name={item.icon} size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-content">
                    {item.title}
                  </p>
                  <p className="truncate text-[10px] text-faint">{item.detail}</p>
                </div>
                <p
                  className={`tabular w-[104px] shrink-0 text-right text-[12px] font-semibold ${
                    item.kind === "income" ? "text-gold-light" : "text-rose-300"
                  }`}
                >
                  {showBalances
                    ? `${item.amount > 0 ? "+ " : "- "}${brl(Math.abs(item.amount))}`
                    : "R$ ••••"}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4 grid grid-cols-1 border-y border-asset/[0.08] bg-asset/[0.02] lg:grid-cols-[minmax(0,1fr)_379px] lg:divide-x lg:divide-asset/[0.08]">
          <div id="cartao" className="px-5 py-5 sm:px-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[13px] font-semibold tracking-tight">
                  Meu cartão
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">Final 4829</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-light">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Ativo
              </span>
            </div>

            <div className="relative mx-auto mt-4 aspect-[1.586/1] w-full max-w-[360px] overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-[#6b3d08] via-[#3a2106] to-[#000014] p-4 shadow-[0_20px_55px_-25px_rgba(242,155,41,0.65)] sm:p-5">
              <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border border-asset/10" />
              <div className="absolute -bottom-16 -left-6 h-44 w-44 rounded-full border border-asset/10" />
              <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_10%_0%,rgba(255,208,138,0.18),transparent_60%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-semibold tracking-wide text-asset/85">
                    Mister Money
                  </span>
                  <Icon name="wallet" size={20} className="text-asset/80" />
                </div>
                <div>
                  <div className="mb-3 h-7 w-10 rounded-md bg-gradient-to-br from-asset/85 to-gold-light/40 opacity-80" />
                  <p className="tabular text-[15px] tracking-[0.18em] text-asset">
                    •••• •••• •••• 4829
                  </p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-asset/60">
                      Titular
                    </p>
                    <p className="text-[11px] font-semibold text-asset">
                      JAY JODODA SILVA
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-asset/60">
                      Validade
                    </p>
                    <p className="tabular text-[11px] font-semibold text-asset">
                      08/29
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => notify("Gerenciamento de cartão em preparação")}
              className="focus-ring mt-4 flex w-full items-center justify-between border-t border-asset/[0.06] pt-3 text-[12px] font-medium text-muted transition-colors hover:text-content"
            >
              Gerenciar cartão
              <Icon name="chevron" size={15} />
            </button>
          </div>

          <div id="mei" className="px-5 py-5 sm:px-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[13px] font-semibold tracking-tight">MEI</h2>
                <p className="mt-0.5 text-[11px] text-muted">
                  DAS · Novembro de 2026
                </p>
              </div>
              <Icon name="receipt" size={16} className="text-faint" />
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <p className="tabular text-[30px] font-semibold leading-none tracking-tight text-content">
                {mask(120)}
              </p>
              <span className="rounded-full bg-asset/[0.04] px-2.5 py-1 text-[10px] text-muted">
                Vence em 20/11
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-y border-asset/[0.06] py-3 text-[11px]">
              <div>
                <p className="text-faint">Competência</p>
                <p className="mt-1 font-medium">Novembro / 2026</p>
              </div>
              <div>
                <p className="text-faint">Status</p>
                <p className="mt-1 font-medium text-gold-light">Em dia</p>
              </div>
            </div>

            <div className="mt-4 h-1 overflow-hidden rounded-full bg-asset/[0.07]">
              <div className="h-full w-full rounded-full bg-gold" />
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
