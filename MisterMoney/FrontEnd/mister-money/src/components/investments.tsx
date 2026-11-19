"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { ExpenseChart } from "@/components/expense-chart";
import { Icon } from "@/components/icons";
import { brl, shortBrl } from "@/lib/dashboard-data";
import {
  assets,
  dividendsReceived,
  goals as initialGoals,
  portfolioHistory,
  type Asset,
} from "@/lib/investments-data";

type Period = "6m" | "12m";
type Operation = "invest" | "redeem";

/* Cotações de referência da mesa — derivadas dos dados locais, sem relógio no render. */
const referenceQuotes: Record<string, number> = {
  CDB: 100,
  "IPCA+35": 340,
  IVVB11: 355.4,
  PETR4: 36.8,
  BTC: 182_500,
  MULTI: 120,
};

const quoteOf = (asset: Asset) =>
  referenceQuotes[asset.ticker] ?? Math.max(asset.amount / 100, 1);

const quantityOf = (asset: Asset) => asset.amount / quoteOf(asset);

const formatQuantity = (asset: Asset) => {
  const decimals = asset.category === "cripto" ? 4 : 2;
  return quantityOf(asset).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const signedPercent = (value: number) =>
  `${value >= 0 ? "+" : ""}${Math.abs(value).toFixed(2).replace(".", ",")}%`;

const variationTone = (value: number) =>
  value >= 0 ? "text-gold" : "text-rose-400";

export function Investments() {
  const router = useRouter();
  const [positions, setPositions] = useState<Asset[]>(assets);
  const [selectedId, setSelectedId] = useState(assets[0].id);
  const [period, setPeriod] = useState<Period>("6m");
  const [showValues, setShowValues] = useState(true);
  const [goalValues, setGoalValues] = useState<Record<string, number>>(
    Object.fromEntries(initialGoals.map((goal) => [goal.id, goal.current])),
  );
  const [operation, setOperation] = useState<Operation>("invest");
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("agora");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast(message);
  const mask = (value: number) => (showValues ? brl(value) : "R$ ••••");

  const selected = positions.find((item) => item.id === selectedId) ?? positions[0];
  const total = positions.reduce((sum, item) => sum + item.amount, 0);
  const weightedYield =
    positions.reduce((sum, item) => sum + item.amount * item.yieldPct, 0) / total;
  const monthlyReturn = (total * weightedYield) / 100;
  const history = portfolioHistory[period];
  const chartMax = Math.max(...history.map((item) => item.value)) * 1.12;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
      scrollTo("carteira-investimentos");
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

  const openOperation = (type: Operation) => {
    setOperation(type);
    setAmount("");
    setError("");
    setModalOpen(true);
  };

  const submitOperation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(amount);
    const isRedeem = operation === "redeem";

    if (!Number.isFinite(value) || value <= 0) {
      setError("Informe um valor válido.");
      return;
    }
    if (isRedeem && value > selected.amount) {
      setError(`O resgate não pode exceder ${brl(selected.amount)}.`);
      return;
    }

    setPositions((current) =>
      current.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              amount: isRedeem ? item.amount - value : item.amount + value,
            }
          : item,
      ),
    );
    notify(
      isRedeem
        ? `Resgate de ${brl(value)} de ${selected.ticker} simulado`
        : `Aporte de ${brl(value)} em ${selected.ticker} simulado`,
    );
    setModalOpen(false);
  };

  const contributeGoal = (id: string, name: string) => {
    setGoalValues((current) => ({ ...current, [id]: (current[id] ?? 0) + 100 }));
    notify(`R$ 100,00 adicionados a ${name} (demo)`);
  };

  return (
    <AppShell
      active="investments"
      title="Investimentos"
      updatedAt={updatedAt}
      toast={toast}
      theme="theme-investments"
      onNavigate={handleNav}
      onNotify={notify}
      onRefresh={refresh}
    >
      <div className="panel-in space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="module-kicker">Investimentos</p>
            <h2 className="mt-1.5 text-[22px] font-semibold tracking-tight sm:text-[26px]">
              Investimentos
            </h2>
          </div>
          <span className="text-[10px] tracking-wide text-faint">
            DADOS DEMONSTRATIVOS
          </span>
        </div>

        {/* Mercado */}
        <section
          aria-label="Mercado"
          className="hairline flex min-w-0 items-center gap-3 border-y py-2"
        >
          <span className="module-kicker shrink-0">Mercado</span>
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
          />
          <div className="flex min-w-0 flex-1 overflow-x-auto">
            {positions.slice(0, 4).map((asset) => (
              <div
                key={asset.id}
                className="ticker-item flex shrink-0 items-center gap-2.5 px-4 py-1 sm:px-5"
              >
                <span className="tabular text-[11px] font-bold tracking-wide text-content">
                  {asset.ticker}
                </span>
                <span className="tabular text-[11px] text-muted">
                  {mask(quoteOf(asset))}
                </span>
                <span
                  className={`tabular text-[11px] font-semibold ${variationTone(asset.monthChange)}`}
                >
                  {signedPercent(asset.monthChange)}
                </span>
              </div>
            ))}
          </div>
          <span className="hidden shrink-0 text-[9px] tracking-[0.16em] text-faint sm:block">
            ÚLT. FECHAMENTO
          </span>
        </section>

        {/* Gráfico em faixa ampla */}
        <section className="surface hero-market motif-grid overflow-hidden rounded-xl border border-asset/[0.06]">
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
            <div>
              <p className="module-kicker">Investimentos</p>
              <h3 className="mt-1 text-[15px] font-semibold tracking-tight">
                Patrimônio investido
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass-soft flex rounded-[10px] p-1" role="group" aria-label="Período do gráfico">
                {(["6m", "12m"] as Period[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPeriod(option)}
                    aria-pressed={period === option}
                    className={`focus-ring tabular rounded-[8px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                      period === option
                        ? "glow-button text-[#010122]"
                        : "text-muted hover:text-content"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
                onClick={() => setShowValues((value) => !value)}
                className="focus-ring rounded-md p-1.5 text-muted transition-colors hover:text-content"
              >
                <Icon name={showValues ? "eye" : "eyeOff"} size={15} />
              </button>
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 pt-2 text-[10px] text-muted">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-[2px] bg-accent" />
              Patrimônio investido
            </span>
            <span className="tabular">ÚLTIMO PONTO {mask(total)}</span>
            <span>
              Variação no período{" "}
              <strong className="tabular ml-1 text-content">+8,9%</strong>
            </span>
          </div>

          <div className="w-full px-1 pb-1 sm:px-4">
            <ExpenseChart
              data={history}
              max={chartMax}
              label="investimentos"
              key={period}
            />
          </div>

          <div className="hairline border-t px-5 py-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="module-kicker">Resumo da carteira</p>
                <p className="tabular mt-1 text-[30px] font-semibold leading-none tracking-tight text-content sm:text-[34px]">
                  {mask(total)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openOperation("invest")}
                  className="glow-button focus-ring flex items-center justify-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[11px] font-semibold text-[#010122]"
                >
                  <Icon name="plus" size={14} />
                  Aportar
                </button>
                <button
                  type="button"
                  onClick={() => openOperation("redeem")}
                  className="glass-soft focus-ring flex items-center justify-center gap-1.5 rounded-[10px] px-4 py-2.5 text-[11px] font-medium text-content transition-colors hover:text-accent"
                >
                  <Icon name="arrowDown" size={14} />
                  Resgatar
                </button>
              </div>
            </div>

            <div className="stat-strip mt-3 grid grid-cols-2 sm:grid-cols-4">
              <div className="px-3 py-2 first:pl-0">
                <p className="text-[9px] uppercase tracking-[0.12em] text-faint">
                  Rentabilidade
                </p>
                <p className="tabular mt-1 text-[13px] font-semibold text-content">
                  +8,9%
                </p>
              </div>
              <div className="px-3 py-2">
                <p className="text-[9px] uppercase tracking-[0.12em] text-faint">
                  Rentabilidade mensal
                </p>
                <p className="tabular mt-1 text-[13px] font-semibold text-content">
                  {showValues ? brl(monthlyReturn) : "R$ ••••"}
                </p>
              </div>
              <div className="px-3 py-2">
                <p className="text-[9px] uppercase tracking-[0.12em] text-faint">
                  Dividendos no mês
                </p>
                <p className="tabular mt-1 text-[13px] font-semibold text-content">
                  {mask(dividendsReceived)}
                </p>
              </div>
              <div className="px-3 py-2">
                <p className="text-[9px] uppercase tracking-[0.12em] text-faint">
                  Perfil
                </p>
                <p className="mt-1 text-[13px] font-semibold text-content">
                  Moderado
                </p>
              </div>
            </div>
            <p className="mt-2 text-[9px] tracking-[0.14em] text-faint">
              ORDENS SIMULADAS · {positions.length} POSIÇÕES
            </p>
          </div>
        </section>

        {/* Meus ativos */}
        <section
          id="carteira-investimentos"
          className="surface overflow-hidden border-y border-asset/[0.06]"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <h3 className="text-[15px] font-semibold tracking-tight">Meus ativos</h3>
            <div className="flex items-center gap-3 text-[9px] tracking-[0.14em] text-faint">
              <span className="tabular">{positions.length} INSTRUMENTOS</span>
              <span className="rounded-full border border-asset/[0.08] px-2.5 py-1">
                MERCADO ABERTO
              </span>
            </div>
          </header>

          <div className="overflow-x-auto">
            <div className="mx-auto min-w-[760px] max-w-[1100px]">
              <div className="stat-strip grid grid-cols-[80px_minmax(0,1fr)_92px_104px_88px_124px] gap-3 px-5 py-2 text-[9px] font-semibold uppercase tracking-[0.13em] text-faint">
                <span>Código</span>
                <span>Nome / classe</span>
                <span className="text-right">Qtd.</span>
                <span className="text-right">Preço</span>
                <span className="text-right">Variação</span>
                <span className="text-right">Valor total</span>
              </div>

              {positions.map((asset) => {
                const active = asset.id === selected.id;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedId(asset.id)}
                    aria-pressed={active}
                    className={`focus-ring ledger-row grid w-full grid-cols-[80px_minmax(0,1fr)_92px_104px_88px_124px] items-center gap-3 px-5 py-3 text-left transition-colors ${
                      active ? "module-soft" : ""
                    }`}
                  >
                    <span
                      className={`tabular text-[12px] font-bold tracking-wide ${active ? "module-text" : "text-content"}`}
                    >
                      {asset.ticker}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-medium text-content">
                        {asset.name}
                      </span>
                      <span className="block truncate text-[10px] text-faint">
                        {asset.categoryLabel} · rentab. {signedPercent(asset.yieldPct)}
                      </span>
                    </span>
                    <span className="tabular text-right text-[11px] text-muted">
                      {formatQuantity(asset)}
                    </span>
                    <span className="tabular text-right text-[12px] text-content">
                      {mask(quoteOf(asset))}
                    </span>
                    <span
                      className={`tabular text-right text-[12px] font-semibold ${variationTone(asset.monthChange)}`}
                    >
                      {signedPercent(asset.monthChange)}
                    </span>
                    <span
                      className={`tabular text-right text-[13px] font-semibold ${active ? "module-text" : "text-content"}`}
                    >
                      {mask(asset.amount)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hairline flex flex-wrap items-center gap-x-6 gap-y-2 border-t px-5 py-3 text-[10px] text-muted">
            <span className="module-kicker">Ficha · {selected.ticker}</span>
            <span className="min-w-[180px] flex-1 text-content">
              {selected.description}
            </span>
            <span>
              Risco <strong className="text-content">{selected.risk}</strong>
            </span>
            <span>
              Liquidez{" "}
              <strong className="text-content">{selected.liquidity}</strong>
            </span>
            <span>
              Aplicado{" "}
              <strong className="tabular text-content">{mask(selected.amount)}</strong>
            </span>
            <span>
              Rentab.{" "}
              <strong className={`tabular ${variationTone(selected.yieldPct)}`}>
                {signedPercent(selected.yieldPct)}
              </strong>
            </span>
          </div>
        </section>

        <div className="hairline grid border-y border-asset/[0.06] lg:grid-cols-2">
          {/* Alocação em barras */}
          <section className="p-5 sm:p-6 lg:border-r lg:border-asset/[0.06]">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <h3 className="text-[15px] font-semibold tracking-tight">Alocação</h3>
              <span className="tabular text-[10px] text-faint">
                TOTAL {showValues ? shortBrl(total) : "••••••"}
              </span>
            </header>

            <div className="hairline mt-4 divide-y">
              {positions.map((asset, index) => {
                const share = (asset.amount / total) * 100;
                const active = asset.id === selected.id;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedId(asset.id)}
                    className="focus-ring ledger-row grid w-full grid-cols-[68px_minmax(0,1fr)_56px] items-center gap-3 py-3 text-left"
                  >
                    <span className="tabular text-[11px] font-bold module-text">
                      {asset.ticker}
                    </span>
                    <span className="min-w-0">
                      <span className="mb-1.5 flex items-center justify-between gap-2 text-[10px] text-faint">
                        <span className="truncate">{asset.categoryLabel}</span>
                        <span className="tabular text-content">{mask(asset.amount)}</span>
                      </span>
                      <span className="block h-1.5 w-full overflow-hidden rounded-sm bg-asset/[0.07]">
                        <span
                          className="block h-full rounded-sm bg-accent"
                          style={{
                            width: `${share}%`,
                            opacity: active ? 1 : Math.max(1 - index * 0.12, 0.4),
                          }}
                        />
                      </span>
                    </span>
                    <span className="tabular text-right text-[13px] font-semibold module-text">
                      {share.toFixed(1).replace(".", ",")}%
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Objetivos como trilhas */}
          <section className="hairline border-t p-5 sm:p-6 lg:border-t-0">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <h3 className="text-[15px] font-semibold tracking-tight">Objetivos</h3>
              <span className="tabular text-[10px] text-faint">
                {initialGoals.length} METAS ATIVAS
              </span>
            </header>

            <div className="mt-5 space-y-5">
              {initialGoals.map((goal) => {
                const current = goalValues[goal.id] ?? goal.current;
                const progress = Math.min((current / goal.target) * 100, 100);
                return (
                  <div key={goal.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="module-soft module-text flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]">
                          <Icon name={goal.icon} size={14} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-semibold text-content">
                            {goal.name}
                          </p>
                          <p className="text-[10px] text-faint">
                            Prazo · {goal.deadline}
                          </p>
                        </div>
                      </div>
                      <span className="tabular text-[14px] font-semibold module-text">
                        {Math.round(progress)}%
                      </span>
                    </div>

                    <div className="relative mt-3 h-1.5 w-full rounded-full bg-asset/[0.07]">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${progress}%` }}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#010122] bg-accent"
                        style={{
                          left: `clamp(6px, ${progress}%, calc(100% - 6px))`,
                        }}
                      />
                      <span
                        aria-hidden="true"
                        className="absolute -top-1 right-0 h-3.5 w-[2px] bg-asset/40"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-faint">
                      <span className="tabular">
                        {showValues ? mask(current) : "R$ ••••"}
                        <span className="ml-1">
                          / {showValues ? brl(goal.target) : "R$ ••••"}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => contributeGoal(goal.id, goal.name)}
                        className="focus-ring module-text font-semibold hover:underline"
                      >
                        + R$ 100
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={submitOperation}
            className="glass-strong w-full max-w-sm rounded-2xl border border-primary/20 p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="module-kicker">
                  Ordem · {selected.ticker}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold">
                  {operation === "invest" ? "Aportar" : "Resgatar"}
                </h3>
                <p className="mt-1 text-[12px] text-muted">{selected.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Fechar"
                className="focus-ring rounded-lg p-1.5 text-muted hover:bg-asset/[0.06]"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <label className="mt-5 block">
              <span className="text-[11px] font-medium text-muted">Valor</span>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-faint">
                  R$
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0,00"
                  className="glass-soft focus-ring tabular w-full rounded-[10px] border border-asset/[0.06] py-2.5 pl-10 pr-3 text-[13px] text-content outline-none placeholder:text-faint"
                />
              </div>
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              {[100, 500, 1000].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(String(value))}
                  className="module-soft module-text focus-ring rounded-full px-2.5 py-1 text-[10px] font-semibold hover:brightness-125"
                >
                  {brl(value)}
                </button>
              ))}
            </div>

            <p className="mt-3 text-[11px] text-faint">
              {operation === "redeem"
                ? `Disponível para resgate: ${brl(selected.amount)}`
                : `Aplicado atualmente: ${brl(selected.amount)}`}
            </p>
            {error && (
              <p role="alert" className="mt-2 text-[11px] text-amber-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="glow-button focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-[10px] py-2.5 text-[13px] font-semibold text-[#010122]"
            >
              <Icon name={operation === "invest" ? "arrowUp" : "arrowDown"} size={16} />
              {operation === "invest" ? "Confirmar aporte" : "Confirmar resgate"}
            </button>
          </form>
        </div>
      )}
    </AppShell>
  );
}
