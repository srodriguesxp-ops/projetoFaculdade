"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { brl } from "@/lib/dashboard-data";
import { accounts } from "@/lib/wallet-data";
import {
  statementEntries,
  type StatementAccount,
  type StatementEntry,
  type StatementType,
} from "@/lib/statement-data";

type PeriodKey = "7d" | "30d" | "90d";
type TypeFilter = "all" | StatementType;
type AccountFilter = "all" | StatementAccount;

const periods: { id: PeriodKey; label: string; days: number }[] = [
  { id: "7d", label: "7 dias", days: 7 },
  { id: "30d", label: "30 dias", days: 30 },
  { id: "90d", label: "90 dias", days: 90 },
];

const typeFilters: { id: TypeFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "income", label: "Entradas" },
  { id: "expense", label: "Saídas" },
  { id: "transfer", label: "Transferências" },
];

const typeLabels: Record<StatementType, string> = {
  income: "Entrada",
  expense: "Saída",
  transfer: "Transferência",
};

const normalize = (value: string) =>
  value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function Statement() {
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [accountFilter, setAccountFilter] = useState<AccountFilter>("all");
  const [query, setQuery] = useState("");
  const [showValues, setShowValues] = useState(true);
  const [selected, setSelected] = useState<StatementEntry | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("agora");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast(message);
  const mask = (value: number) => (showValues ? brl(value) : "R$ ••••");
  const signedAmount = (value: number) =>
    showValues ? `${value > 0 ? "+ " : "- "}${brl(Math.abs(value))}` : "R$ ••••";
  const signedTotal = (value: number) =>
    showValues ? `${value >= 0 ? "+ " : "- "}${brl(Math.abs(value))}` : "R$ ••••";

  const periodDays = periods.find((item) => item.id === period)?.days ?? 30;

  const periodEntries = useMemo(
    () => statementEntries.filter((entry) => entry.daysAgo <= periodDays),
    [periodDays],
  );

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    return periodEntries.filter((entry) => {
      if (typeFilter !== "all" && entry.type !== typeFilter) return false;
      if (accountFilter !== "all" && entry.accountId !== accountFilter) return false;
      if (!term) return true;
      return normalize(
        `${entry.title} ${entry.detail} ${entry.category} ${entry.method}`,
      ).includes(term);
    });
  }, [periodEntries, typeFilter, accountFilter, query]);

  const summary = useMemo(
    () =>
      filtered.reduce(
        (acc, entry) => {
          if (entry.type === "income") acc.income += entry.amount;
          else if (entry.type === "expense") acc.expense += Math.abs(entry.amount);
          else acc.transfer += Math.abs(entry.amount);
          return acc;
        },
        { income: 0, expense: 0, transfer: 0 },
      ),
    [filtered],
  );

  const balance = summary.income - summary.expense;

  const groups = useMemo(() => {
    const map = new Map<string, StatementEntry[]>();
    filtered.forEach((entry) => {
      map.set(entry.group, [...(map.get(entry.group) ?? []), entry]);
    });
    return Array.from(map, ([label, entries]) => ({ label, entries }));
  }, [filtered]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    filtered
      .filter((entry) => entry.type === "expense")
      .forEach((entry) => {
        map.set(entry.category, (map.get(entry.category) ?? 0) + Math.abs(entry.amount));
      });
    return Array.from(map, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filtered]);

  const maxCategory = Math.max(...categoryTotals.map((item) => item.value), 1);

  const accountSummary = useMemo(
    () =>
      accounts.map((account) => {
        const entries = periodEntries.filter((entry) => entry.accountId === account.id);
        const income = entries
          .filter((entry) => entry.type === "income")
          .reduce((sum, entry) => sum + entry.amount, 0);
        const expense = entries
          .filter((entry) => entry.type === "expense")
          .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
        return { ...account, movement: income - expense, count: entries.length };
      }),
    [periodEntries],
  );

  const pendingCount = periodEntries.filter(
    (entry) => entry.status === "pending",
  ).length;

  const clearFilters = () => {
    setTypeFilter("all");
    setAccountFilter("all");
    setQuery("");
  };

  const handleNav = (item: NavItem) => {
    if (item.id === "overview") {
      router.push("/");
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
      document.getElementById("extrato-lancamentos")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
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

  const exportCsv = () => {
    const rows = [
      ["Data", "Descrição", "Categoria", "Conta", "Tipo", "Valor"],
      ...filtered.map((entry) => [
        entry.date,
        entry.title,
        entry.category,
        accounts.find((account) => account.id === entry.accountId)?.name ?? "",
        typeLabels[entry.type],
        brl(entry.amount),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "extrato-mister-money.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify(`${filtered.length} lançamentos exportados em CSV`);
  };

  return (
    <AppShell
      active="statement"
      title="Extrato"
      updatedAt={updatedAt}
      toast={toast}
      onNavigate={handleNav}
      onNotify={notify}
      onRefresh={refresh}
      theme="theme-statement"
    >
      <div className="panel-in w-full min-w-0 space-y-5">
        <section
          className="surface hero-ledger motif-grid panel min-w-0 overflow-hidden px-5 py-6 sm:px-8 sm:py-7"
          style={{ borderRadius: 6 }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[30px] font-semibold leading-none tracking-tight sm:text-[38px]">
                Extrato
              </h2>
              <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-muted">
                Entradas, saídas e transferências de todas as suas contas,
                registradas linha a linha.
              </p>
            </div>
            <span className="glass-soft shrink-0 rounded-[4px] px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] text-muted">
              Dados demonstrativos
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div
              className="glass-soft inline-flex rounded-[4px] p-1"
              role="group"
              aria-label="Período do extrato"
            >
              {periods.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPeriod(option.id)}
                  aria-pressed={period === option.id}
                  className={`focus-ring rounded-[3px] px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    period === option.id
                      ? "glow-button text-[#010122]"
                      : "text-muted hover:bg-asset/[0.05] hover:text-content"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="overline">ÚLTIMOS {periodDays} DIAS</p>
          </div>

          <div className="divider-module mt-5" />

          <div className="mt-5 grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="overline">Saldo do período</p>
                <button
                  type="button"
                  aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
                  onClick={() => setShowValues((value) => !value)}
                  className="focus-ring shrink-0 rounded-[4px] p-1 text-muted transition-colors hover:text-content"
                >
                  <Icon name={showValues ? "eye" : "eyeOff"} size={15} />
                </button>
              </div>
              <p
                className={`font-mono tabular mt-2 text-[34px] font-semibold leading-none tracking-tight sm:text-[50px] ${
                  balance >= 0 ? "text-accent" : "text-content"
                }`}
              >
                {showValues
                  ? signedTotal(balance)
                  : "R$ ••••"}
              </p>
              <p className="mt-3 max-w-md text-[11px] leading-relaxed text-faint">
                {filtered.length} lançamentos conciliados · {pendingCount}{" "}
                aguardando confirmação
              </p>
            </div>

            <div className="stat-strip grid min-w-0 grid-cols-1 divide-y divide-asset/[0.07] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                {
                  label: "Entradas",
                  value: mask(summary.income),
                  caption: `${filtered.filter((entry) => entry.type === "income").length} créditos`,
                  tone: "text-accent",
                },
                {
                  label: "Saídas",
                  value: mask(summary.expense),
                  caption: `${filtered.filter((entry) => entry.type === "expense").length} débitos`,
                  tone: "text-content",
                },
                {
                  label: "Transferências",
                  value: mask(summary.transfer),
                  caption: `${filtered.filter((entry) => entry.type === "transfer").length} movimentações`,
                  tone: "text-content",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 py-3 sm:px-4 sm:py-2 lg:px-5"
                >
                  <p className="overline truncate">{item.label}</p>
                  <p
                    className={`font-mono tabular mt-2 text-[16px] font-semibold leading-none ${item.tone}`}
                  >
                    {item.value}
                  </p>
                  <p className="mt-2 truncate text-[10px] text-faint">
                    {item.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div
          className="panel flex flex-wrap items-center gap-2 p-2"
          style={{ borderRadius: 6 }}
        >
          <div className="relative min-w-0 flex-1 basis-[190px]">
            <Icon
              name="list"
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar lançamentos"
              placeholder="Buscar por nome, categoria ou método..."
              className="w-full bg-transparent py-2 pl-9 pr-8 text-[12px] text-content outline-none placeholder:text-faint"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
                className="focus-ring absolute right-1.5 top-1/2 -translate-y-1/2 rounded-[4px] p-1 text-muted hover:text-content"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
          <span className="hidden h-6 w-px bg-asset/[0.08] md:block" aria-hidden="true" />
          <div className="relative">
            <Icon
              name="wallet"
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint"
            />
            <select
              value={accountFilter}
              onChange={(event) =>
                setAccountFilter(event.target.value as AccountFilter)
              }
              aria-label="Filtrar por conta"
              className="focus-ring max-w-[190px] truncate appearance-none rounded-[4px] bg-asset/[0.04] py-2 pl-8 pr-3 text-[11px] text-content outline-none"
            >
              <option value="all">Todas as contas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          <span className="hidden h-6 w-px bg-asset/[0.08] md:block" aria-hidden="true" />
          <div
            className="flex flex-wrap items-center gap-1"
            role="group"
            aria-label="Filtrar por tipo"
          >
            {typeFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setTypeFilter(filter.id)}
                aria-pressed={typeFilter === filter.id}
                className={`focus-ring flex items-center gap-1.5 whitespace-nowrap rounded-[4px] border border-transparent px-2.5 py-2 text-[11px] font-medium transition-colors ${
                  typeFilter === filter.id
                    ? "border-primary/30 bg-primary/10 text-accent"
                    : "text-muted hover:bg-asset/[0.04] hover:text-content"
                }`}
              >
                <Icon
                  name={
                    filter.id === "all"
                      ? "list"
                      : filter.id === "income"
                        ? "arrowDown"
                        : filter.id === "expense"
                          ? "arrowUp"
                          : "transfer"
                  }
                  size={13}
                />
                {filter.label}
              </button>
            ))}
          </div>
          <span className="hidden h-6 w-px bg-asset/[0.08] md:block" aria-hidden="true" />
          <button
            type="button"
            onClick={clearFilters}
            aria-label="Limpar filtros"
            title="Limpar filtros"
            className="focus-ring rounded-[4px] p-2 text-muted transition-colors hover:bg-asset/[0.05] hover:text-content"
          >
            <Icon name="refresh" size={15} />
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="glow-button focus-ring flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[4px] px-3 py-2 text-[11px] font-semibold text-[#010122]"
          >
            <Icon name="arrowDown" size={14} />
            Exportar CSV
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section
            id="extrato-lancamentos"
            className="panel min-w-0 overflow-hidden"
            style={{ borderRadius: 6 }}
          >
            <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-4">
              <div>
                <p className="module-kicker">Movimentações</p>
                <h3 className="mt-1.5 text-[17px] font-semibold tracking-tight">
                  Lançamentos
                </h3>
              </div>
              <p className="tabular text-[11px] text-muted">
                {filtered.length}{" "}
                {filtered.length === 1 ? "resultado" : "resultados"} no período
                selecionado
              </p>
            </div>
            <div className="divider-module" />

            {groups.length === 0 ? (
              <div className="m-5 flex flex-col items-center rounded-[4px] border border-dashed border-asset/[0.14] px-4 py-12 text-center">
                <Icon name="list" size={22} className="text-accent" />
                <p className="mt-3 text-[13px] font-semibold">
                  Nenhum lançamento encontrado
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Tente ajustar a busca ou os filtros aplicados.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="focus-ring mt-4 text-[11px] font-semibold text-accent hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto overscroll-x-contain">
                <table className="w-full min-w-[560px] table-fixed border-collapse text-left sm:min-w-[640px]">
                  <thead>
                    <tr className="border-b border-asset/[0.08]">
                      <th
                        scope="col"
                        className="w-[88px] px-3 py-3 overline sm:w-[120px] sm:px-5"
                      >
                        DATA
                      </th>
                      <th scope="col" className="py-3 pr-2 overline sm:pr-3">
                        LANÇAMENTO
                      </th>
                      <th
                        scope="col"
                        className="w-[124px] px-2 py-3 overline sm:w-[180px] sm:px-3"
                      >
                        Categoria/Conta
                      </th>
                      <th
                        scope="col"
                        className="w-[124px] px-3 py-3 text-right overline sm:w-[150px] sm:px-5"
                      >
                        VALOR
                      </th>
                    </tr>
                  </thead>
                  {groups.map((group, groupIndex) => {
                    const total = group.entries.reduce(
                      (sum, entry) => sum + entry.amount,
                      0,
                    );
                    return (
                      <tbody key={group.label}>
                        <tr>
                          <td
                            colSpan={4}
                            className={`px-5 pb-2 ${groupIndex === 0 ? "pt-4" : "pt-6"}`}
                          >
                            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                              <span
                                className="h-1.5 w-1.5 shrink-0 rotate-45 border border-primary/40 bg-primary/20"
                                aria-hidden="true"
                              />
                              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-content">
                                {group.label}
                              </span>
                              <span
                                className="h-px min-w-4 flex-1 bg-asset/[0.07]"
                                aria-hidden="true"
                              />
                              <span className="font-mono tabular text-right text-[10px] text-faint sm:whitespace-nowrap">
                                {group.entries.length}{" "}
                                {group.entries.length === 1
                                  ? "lançamento"
                                  : "lançamentos"}{" "}
                                · {signedTotal(total)}
                              </span>
                            </div>
                          </td>
                        </tr>
                        {group.entries.map((entry) => {
                          const account = accounts.find(
                            (item) => item.id === entry.accountId,
                          );
                          return (
                            <tr key={entry.id} className="ledger-row">
                              <td className="font-mono tabular whitespace-nowrap px-3 py-3 text-[11px] text-faint sm:px-5">
                                {entry.date}
                              </td>
                              <td className="py-3 pr-2 sm:pr-3">
                                <button
                                  type="button"
                                  onClick={() => setSelected(entry)}
                                  aria-label={`Ver detalhes de ${entry.title}`}
                                  className="focus-ring flex w-full items-center gap-3 text-left"
                                >
                                  <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] ${
                                      entry.type === "income"
                                        ? "border border-primary/25 bg-primary/10 text-accent"
                                        : "bg-asset/[0.04] text-muted"
                                    }`}
                                  >
                                    <Icon name={entry.icon} size={15} />
                                  </span>
                                  <span className="block min-w-0">
                                    <span className="flex min-w-0 flex-wrap items-center gap-2">
                                      <span
                                        className="truncate text-[13px] font-medium"
                                        title={entry.title}
                                      >
                                        {entry.title}
                                      </span>
                                      {entry.status === "pending" && (
                                        <span className="-rotate-2 rounded-[2px] border border-amber-300/30 bg-amber-300/[0.06] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-amber-200/90">
                                          Pendente
                                        </span>
                                      )}
                                    </span>
                                    <span
                                      className="mt-0.5 block truncate text-[11px] text-faint"
                                      title={entry.detail}
                                    >
                                      {entry.detail}
                                    </span>
                                  </span>
                                </button>
                              </td>
                              <td className="min-w-0 px-2 py-3 text-[11px] text-muted sm:px-3">
                                <span className="block truncate" title={entry.category}>
                                  {entry.category}
                                </span>
                                <span
                                  className="block truncate text-[10px] text-faint"
                                  title={account?.name}
                                >
                                  {account?.name}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-right sm:px-5">
                                <span
                                  className={`font-mono tabular text-[13px] font-semibold ${
                                    entry.amount > 0 ? "text-accent" : "text-content"
                                  }`}
                                >
                                  {signedAmount(entry.amount)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    );
                  })}
                </table>
              </div>
            )}

            <div className="divider-module" />
            <div className="flex items-center justify-between gap-3 px-5 py-3 text-[10px] text-faint">
              <span>Extrato · Mister Money</span>
              <span className="tabular">
                {groups.length}{" "}
                {groups.length === 1 ? "agrupamento" : "agrupamentos"}
              </span>
            </div>
          </section>

          <aside className="min-w-0 space-y-3">
            <p className="module-kicker">Resumo do período</p>

            <div className="min-w-0 divide-y divide-asset/[0.07] border border-asset/[0.06] bg-asset/[0.02]">
              <div className="h-[2px] bg-primary" aria-hidden="true" />

              <section className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[14px] font-semibold tracking-tight">
                      Saídas por categoria
                    </h3>
                    <p className="mt-1 text-[11px] text-muted">Onde o dinheiro foi</p>
                  </div>
                  <Icon name="chart" size={17} className="text-accent" />
                </div>

                {categoryTotals.length === 0 ? (
                  <p className="mt-4 text-[11px] text-faint">
                    Nenhuma saída no período selecionado.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {categoryTotals.map((category) => (
                      <div key={category.name}>
                        <div className="flex items-baseline justify-between gap-2 text-[11px]">
                          <span className="min-w-0 truncate text-muted">
                            {category.name}
                          </span>
                          <span className="font-mono tabular shrink-0 text-accent">
                            {mask(category.value)}
                          </span>
                        </div>
                        <div className="mt-2 h-[3px] w-full bg-asset/[0.06]">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(category.value / maxCategory) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[14px] font-semibold tracking-tight">
                      Movimento por conta
                    </h3>
                    <p className="mt-1 text-[11px] text-muted">
                      Entradas menos saídas no período
                    </p>
                  </div>
                  <Icon name="wallet" size={17} className="text-accent" />
                </div>

                <div className="mt-2 divide-y divide-asset/[0.06]">
                  {accountSummary.map((account) => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => setAccountFilter(account.id)}
                      className="focus-ring flex w-full min-w-0 items-center gap-3 py-3 text-left transition-colors hover:bg-asset/[0.03]"
                    >
                      <span
                        className="h-7 w-[2px] shrink-0"
                        style={{ backgroundColor: account.color }}
                        aria-hidden="true"
                      />
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-asset/[0.05]"
                        style={{ color: account.color }}
                      >
                        <Icon name={account.icon} size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium">
                          {account.name}
                        </span>
                        <span className="block text-[10px] text-faint">
                          {account.count}{" "}
                          {account.count === 1 ? "lançamento" : "lançamentos"}
                        </span>
                      </span>
                      <span
                        className={`font-mono tabular shrink-0 whitespace-nowrap text-right text-[12px] font-semibold ${
                          account.movement >= 0 ? "text-accent" : "text-content"
                        }`}
                      >
                        {signedTotal(account.movement)}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[14px] font-semibold tracking-tight">
                      Exportar CSV
                    </h3>
                    <p className="mt-1 text-[11px] text-muted">
                      {filtered.length}{" "}
                      {filtered.length === 1
                        ? "lançamento exportado"
                        : "lançamentos exportados"}{" "}
                      com os filtros atuais.
                    </p>
                  </div>
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-primary/40 text-[9px] font-bold text-accent"
                    aria-hidden="true"
                  >
                    CSV
                  </span>
                </div>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="glow-button focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-[4px] py-2 text-[11px] font-semibold text-[#010122]"
                >
                  <Icon name="arrowDown" size={14} />
                  Exportar CSV
                </button>
              </section>
            </div>
          </aside>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div
            className="glass-strong max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-x-hidden overflow-y-auto"
            style={{ borderRadius: 6 }}
          >
            <div className="surface motif-scan border-b border-dashed border-asset/[0.14] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] ${
                      selected.type === "income"
                        ? "border border-primary/25 bg-primary/10 text-accent"
                        : "bg-asset/[0.05] text-muted"
                    }`}
                  >
                    <Icon name={selected.icon} size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="module-kicker">Detalhes do lançamento</p>
                    <h3 className="mt-1 text-[15px] font-semibold leading-snug break-words">
                      {selected.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-muted break-words">
                      {selected.detail}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Fechar"
                  className="focus-ring shrink-0 rounded-[4px] p-1.5 text-muted hover:bg-asset/[0.06]"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <p
                className={`font-mono tabular mt-5 text-[32px] font-semibold leading-none tracking-tight ${
                  selected.amount > 0 ? "text-accent" : "text-content"
                }`}
              >
                {signedAmount(selected.amount)}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-faint">
                {typeLabels[selected.type]} · {selected.date}
              </p>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <div className="hairline divide-y border-y">
                {[
                  ["Tipo", typeLabels[selected.type]],
                  ["Data", selected.date],
                  ["Categoria", selected.category],
                  ["Forma de pagamento", selected.method],
                  [
                    "Conta",
                    accounts.find((account) => account.id === selected.accountId)?.name ?? "",
                  ],
                  [
                    "Status",
                    selected.status === "done" ? "Concluído" : "Pendente",
                  ],
                  ["Identificador", selected.id.toUpperCase()],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-faint">
                      {label}
                    </span>
                    <span className="min-w-0 flex-1 break-words text-right text-[11px] font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  notify("Comprovante gerado (demo)");
                  setSelected(null);
                }}
                className="glow-button focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-[4px] py-2.5 text-[12px] font-semibold text-[#010122]"
              >
                <Icon name="receipt" size={15} />
                Comprovante
              </button>
              <p className="mt-3 text-center text-[9px] uppercase tracking-[0.12em] text-faint">
                Documento simulado · Mister Money
              </p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
