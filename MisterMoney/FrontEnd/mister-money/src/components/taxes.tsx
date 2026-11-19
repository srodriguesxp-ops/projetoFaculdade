"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { brl } from "@/lib/dashboard-data";
import {
  installments as installmentsDemo,
  paidHistory as paidHistoryDemo,
  type TaxInstallment,
  type TaxStatus,
} from "@/lib/taxes-data";

type TaxesProps = {
  installments?: TaxInstallment[];
  history?: TaxInstallment[];
  origem?: "api" | "demo";
};

const statusLabel: Record<TaxStatus, string> = {
  open: "Em aberto",
  scheduled: "Programado",
  paid: "Pago",
};

// Data de referência dos dados demonstrativos (fixa para manter o render puro).
const REFERENCE_DATE = new Date("2026-11-18T12:00:00").getTime();

const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];

const steps = [
  "Acesse o portal do MEI com seu CNPJ",
  "Gere a guia DAS da competência",
  "Pague e guarde o comprovante aqui",
];

const barcodeLines = Array.from({ length: 56 }, (_, index) => ({
  wide: index % 7 === 0 || index % 11 === 0,
  strong: index % 5 === 0,
}));

export function Taxes({
  installments: guiasDaApi,
  history: historicoDaApi,
  origem = "demo",
}: TaxesProps) {
  const router = useRouter();
  const guias = guiasDaApi && guiasDaApi.length > 0 ? guiasDaApi : installmentsDemo;
  const historico =
    historicoDaApi && historicoDaApi.length > 0 ? historicoDaApi : paidHistoryDemo;
  const totalPagoAno = historico.reduce((sum, item) => sum + item.value, 0);
  const [selectedId, setSelectedId] = useState(guias[0].id);
  const [showValues, setShowValues] = useState(true);
  const [paidIds, setPaidIds] = useState<string[]>([]);
  const [alertsOn, setAlertsOn] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("agora");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast(message);

  const allInstallments = [...guias, ...historico];
  const selected =
    allInstallments.find((item) => item.id === selectedId) ?? guias[0];
  const paidNow = paidIds.includes(selected.id) || selected.status === "paid";
  const next = guias[0];
  const nextPaid = paidIds.includes(next.id);
  const paidThisYear =
    totalPagoAno +
    paidIds.reduce((sum, id) => {
      const item = allInstallments.find((entry) => entry.id === id);
      return sum + (item?.value ?? 0);
    }, 0);

  const dueTime = new Date(`${selected.dueDate}T23:59:59`).getTime();
  const daysLeft = Math.max(0, Math.ceil((dueTime - REFERENCE_DATE) / 86_400_000));

  const bars = [...historico]
    .reverse()
    .slice(0, 6)
    .map((item) => ({ label: item.short, value: item.value, paid: true }));
  bars.push({
    label: next.short,
    value: next.value,
    paid: nextPaid,
  });

  const mask = (value: number) => (showValues ? brl(value) : "R$ ••••");

  const [calendarYear, calendarMonth] = selected.dueDate.split("-").map(Number);
  const firstWeekday = new Date(calendarYear, calendarMonth - 1, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
  const dueDay = Number(selected.dueDate.slice(-2));

  const receiptRows = [
    {
      id: next.id,
      date: next.dueLabel,
      competence: next.competence,
      value: next.value,
      paid: nextPaid,
    },
    ...historico.map((item) => ({
      id: item.id,
      date: item.paidAt ?? item.dueLabel,
      competence: item.competence,
      value: item.value,
      paid: true,
    })),
  ];

  const handleNav = (item: NavItem) => {
    if (item.id === "overview") {
      router.push("/");
    } else if (item.id === "wallet") {
      router.push("/carteira");
    } else if (item.id === "transfers") {
      router.push("/transferencias");
    } else if (item.id === "cards") {
      router.push("/cartoes");
    } else if (item.id === "investments") {
      router.push("/investimentos");
    } else if (item.id === "taxes") {
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  const markAsPaid = () => {
    if (paidNow) {
      notify("Esta guia já está marcada como paga");
      return;
    }
    setPaidIds((current) => [...current, selected.id]);
    notify(`DAS de ${selected.month} marcado como pago (demo)`);
  };

  const statusTone = (status: TaxStatus, paid: boolean) => {
    if (paid || status === "paid") {
      return "module-soft module-text module-border";
    }
    if (status === "open") {
      return "bg-amber-400/10 text-amber-300 border-amber-400/30";
    }
    return "bg-asset/[0.04] text-muted border-asset/[0.08]";
  };

  return (
    <AppShell
      active="taxes"
      title="Impostos e taxas"
      updatedAt={updatedAt}
      toast={toast}
      onNavigate={handleNav}
      onNotify={notify}
      onRefresh={refresh}
      theme="theme-taxes"
    >
      <section className="panel-in w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="module-kicker">Impostos e taxas</p>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-[28px]">
              Guia DAS
            </h2>
          </div>
          <span className="glass-soft rounded-full px-3 py-1.5 text-[11px] text-muted">
            {origem === "api" ? "Dados do banco" : "Dados demonstrativos"}
          </span>
        </div>

        <section className="surface hero-das motif-grid mt-5 border-y border-asset/[0.07] py-6 pl-5 pr-11 sm:pl-7 sm:pr-14">
          <span
            className="pointer-events-none absolute -right-1 top-10 h-5 w-5 rounded-full bg-app-bg"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -right-1 bottom-10 h-5 w-5 rounded-full bg-app-bg"
            aria-hidden="true"
          />

          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_286px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="module-kicker">Guia DAS</p>
                <span className="h-px w-10 bg-asset/10" />
                <p className="overline text-[9px]">{next.year}</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
                <div>
                  <p className="overline text-[9px]">Competência</p>
                  <p className="mt-1 text-[13px] font-semibold sm:text-[15px]">
                    {next.competence}
                  </p>
                </div>
                <div>
                  <p className="overline text-[9px]">Vencimento</p>
                  <p className="module-text tabular mt-1 text-[13px] font-semibold sm:text-[15px]">
                    {next.dueLabel}
                  </p>
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <p className="overline text-[9px]">Código da guia</p>
                  <p className="tabular mt-1 text-[13px] font-semibold">
                    {next.id.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-y border-asset/[0.07] py-5">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-muted">
                    Próximo vencimento
                  </p>
                  <button
                    type="button"
                    aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
                    onClick={() => setShowValues((value) => !value)}
                    className="focus-ring rounded-md p-1 text-muted transition-colors hover:text-content"
                  >
                    <Icon name={showValues ? "eye" : "eyeOff"} size={15} />
                  </button>
                </div>
                <p className="tabular module-text mt-3 text-[42px] font-semibold leading-none tracking-tight sm:text-[52px]">
                  {mask(next.value)}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={markAsPaid}
                  className="module-button focus-ring flex items-center gap-2 rounded-[4px] px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em]"
                >
                  <Icon name={nextPaid ? "check" : "send"} size={16} />
                  {nextPaid ? "Pago" : "Pagar DAS"}
                </button>
                <span className="module-soft module-text module-border flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5 text-[11px]">
                  <Icon name={nextPaid ? "check" : "sparkles"} size={12} />
                  {nextPaid ? "Pago" : "Em dia"}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted">
                  <Icon name="calendar" size={12} />
                  Vence em {next.dueLabel}
                </span>
              </div>
            </div>

            <aside className="min-w-0 md:border-l md:border-asset/[0.07] md:pl-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="module-kicker">Próximo vencimento</p>
                  <p className="tabular mt-2 text-4xl font-semibold leading-none">
                    {nextPaid ? "0" : daysLeft}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-faint">
                    {nextPaid
                      ? "concluído"
                      : daysLeft === 1
                        ? "dia restante"
                        : "dias restantes"}
                  </p>
                </div>
                <span className="module-soft module-text module-border -rotate-6 rounded-[3px] border px-2 py-1.5 text-[9px] font-bold tracking-[0.14em]">
                  {nextPaid ? "QUITADO" : "EM DIA"}
                </span>
              </div>

              <div className="divider-module my-4" />

              <div className="flex items-center justify-between">
                <p className="overline text-[9px]">Código de barras</p>
                <p className="tabular text-[9px] text-faint">DAS / {next.year}</p>
              </div>
              <div
                className="mt-3 flex h-12 w-full max-w-[240px] items-stretch justify-between gap-[1px] overflow-hidden"
                aria-hidden="true"
              >
                {barcodeLines.map((line, index) => (
                  <span
                    key={index}
                    className={`${line.wide ? "w-[2px]" : "w-[1px]"} shrink-0 ${
                      line.strong ? "bg-[var(--module)]" : "bg-asset/40"
                    }`}
                  />
                ))}
              </div>
              <p className="tabular mt-2 max-w-[240px] text-[9px] leading-[1.5] tracking-[0.08em] text-faint">
                34191.79001 01043.510047 91020.150008 1 00000000012000
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-asset/[0.07] pt-3">
                <div>
                  <p className="overline text-[8px]">Contribuinte</p>
                  <p className="mt-1 text-[10px] text-muted">MEI · Jay Jododa Silva</p>
                </div>
                <div>
                  <p className="overline text-[8px]">Competência</p>
                  <p className="tabular mt-1 text-[10px] text-muted">
                    {next.year} · {next.month}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <div className="mt-5 grid grid-cols-2 border-y border-asset/[0.07] lg:grid-cols-4">
          {[
            {
              label: "Pago em 2026",
              value: mask(paidThisYear),
              caption: `${historico.length + paidIds.length} guias quitadas`,
              accent: true,
            },
            {
              label: "Valor do DAS",
              value: mask(120),
              caption: "Fixo por competência",
            },
            {
              label: "Vencimento",
              value: next.dueLabel,
              caption: `${next.month} de ${next.year}`,
            },
            {
              label: "Situação fiscal",
              value: "Em dia",
              caption: "Nenhuma pendência",
              accent: true,
            },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`border-b border-asset/[0.06] px-4 py-4 lg:border-b-0 lg:border-r ${
                index === 3 ? "lg:border-r-0" : ""
              }`}
            >
              <p className="overline text-[9px]">{item.label}</p>
              <p
                className={`tabular mt-2 text-xl font-semibold tracking-tight ${
                  item.accent ? "module-text" : "text-content"
                }`}
              >
                {item.value}
              </p>
              <p className="mt-1.5 text-[10px] text-faint">{item.caption}</p>
            </div>
          ))}
        </div>

        <section className="mt-5 border-b border-asset/[0.07] pb-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="module-kicker">Guia DAS</p>
              <h3 className="mt-1 text-base font-semibold tracking-tight">
                3 passos para ficar em dia
              </h3>
            </div>
            <span className="overline text-[9px]">Passo 1 a 3</span>
          </div>
          <ol className="mt-4 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="relative flex items-start gap-3">
                <span className="module-soft module-border flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold module-text">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold leading-snug">{step}</p>
                  <p className="mt-1 text-[10px] text-faint">
                    Etapa {index + 1} de 3
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-full top-4 hidden h-px w-4 bg-[var(--module)] opacity-40 md:block"
                  />
                )}
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-5 grid grid-cols-1 border-y border-asset/[0.07] md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 divide-y divide-asset/[0.07] md:border-r md:border-asset/[0.07]">
            <section className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="module-kicker">Vencimentos</p>
                  <h3 className="mt-1 text-base font-semibold tracking-tight">
                    Calendário
                  </h3>
                  <p className="mt-1 text-[12px] text-muted">
                    Selecione uma competência para ver os detalhes
                  </p>
                </div>
                <span className="glass-soft rounded-full px-2.5 py-1 text-[10px] text-muted">
                  Próximos 6 meses
                </span>
              </div>

              <div className="mt-4 border-y border-asset/[0.07] py-4">
                <div className="flex items-center justify-between">
                  <p className="module-kicker uppercase">
                    {selected.month} / {selected.year}
                  </p>
                  <p className="tabular text-[10px] text-faint">
                    Venc. {selected.dueLabel}
                  </p>
                </div>

                <div className="mt-4 grid max-w-[336px] grid-cols-7 gap-1 sm:gap-1.5">
                  {weekdays.map((day, index) => (
                    <span
                      key={`${day}-${index}`}
                      className="text-center text-[9px] font-semibold text-faint"
                    >
                      {day}
                    </span>
                  ))}
                  {Array.from({ length: firstWeekday }, (_, index) => (
                    <span key={`pad-${index}`} aria-hidden="true" />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, index) => {
                    const day = index + 1;
                    const isDue = day === dueDay;
                    return (
                      <span
                        key={day}
                        aria-current={isDue ? "date" : undefined}
                        className={`flex aspect-square items-center justify-center rounded-[2px] text-[10px] ${
                          isDue
                            ? "module-button tabular font-bold"
                            : "tabular border border-asset/[0.05] bg-asset/[0.02] text-muted"
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>

              <p className="overline mt-4 text-[9px]">Competências</p>
              <div className="mt-2 divide-y divide-asset/[0.06]">
                {guias.map((item) => {
                  const active = item.id === selected.id;
                  const paid = paidIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      aria-pressed={active}
                      className={`focus-ring flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-2 py-2.5 text-left transition-colors ${
                        active
                          ? "bg-asset/[0.04] module-text"
                          : "text-muted hover:bg-asset/[0.025] hover:text-content"
                      }`}
                    >
                      <span className="tabular w-14 shrink-0 text-[12px] font-semibold">
                        {item.dueLabel}
                      </span>
                      <span className="min-w-0 flex-1 text-[11px]">
                        {item.competence}
                      </span>
                      <span
                        className={`rounded-[3px] border px-2 py-0.5 text-[9px] font-medium ${statusTone(item.status, paid)}`}
                      >
                        {paid ? "Pago" : statusLabel[item.status]}
                      </span>
                      <span className="tabular w-20 text-right text-[11px] font-semibold">
                        {mask(item.value)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-asset/[0.07] pt-4">
                <div>
                  <p className="overline text-[9px]">Competência selecionada</p>
                  <p className="mt-1 text-[13px] font-semibold">
                    {selected.competence}
                    <span className="module-text tabular ml-2">
                      · {mask(selected.value)}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={markAsPaid}
                  className="focus-ring flex items-center gap-2 px-3 py-2 text-[11px] font-semibold module-text hover:bg-asset/[0.06]"
                >
                  <Icon name={paidNow ? "check" : "send"} size={14} />
                  {paidNow ? "Guia quitada" : "Pagar DAS"}
                </button>
              </div>
            </section>

            <section className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="module-kicker">Comprovantes</p>
                  <h3 className="mt-1 text-base font-semibold tracking-tight">
                    Histórico de pagamentos
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleNav({ id: "statement", label: "Extrato", icon: "list" })}
                  className="focus-ring text-[11px] font-medium module-text hover:underline"
                >
                  Ver extrato completo
                </button>
              </div>

              <div className="mt-4 overflow-x-auto border-t border-asset/[0.07]">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-asset/[0.07] bg-asset/[0.02] text-[9px] uppercase tracking-[0.14em] text-faint">
                      <th className="px-3 py-2.5 font-semibold">Data</th>
                      <th className="px-3 py-2.5 font-semibold">
                        Competência / código
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold">Valor</th>
                      <th className="px-3 py-2.5 font-semibold">Situação</th>
                      <th className="px-3 py-2.5 text-right font-semibold">
                        Recibo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptRows.map((row) => (
                      <tr key={row.id} className="ledger-row">
                        <td className="tabular px-3 py-3 text-[11px] text-muted">
                          {row.date}
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-[12px] font-medium">
                            DAS · {row.competence}
                          </p>
                          <p className="tabular mt-1 text-[9px] tracking-[0.12em] text-faint">
                            COD. {row.id.toUpperCase()}-
                            {Math.round(row.value * 100).toString().padStart(5, "0")}
                          </p>
                        </td>
                        <td className="tabular px-3 py-3 text-right text-[12px] font-semibold">
                          {mask(row.value)}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex -rotate-2 rounded-[3px] border px-2 py-1 text-[9px] font-bold tracking-[0.14em] ${
                              row.paid
                                ? "module-soft module-text module-border"
                                : "border-amber-400/40 bg-amber-400/10 text-amber-300"
                            }`}
                          >
                            {row.paid ? "CONCLUÍDO" : "PENDENTE"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          {row.id === next.id && !row.paid ? (
                            <span className="text-[10px] text-faint">—</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                notify(
                                  `Comprovante de ${row.competence.split(" / ")[0]} disponível`,
                                )
                              }
                              className="focus-ring rounded-[3px] px-2 py-1.5 text-[11px] text-muted hover:bg-asset/[0.06] hover:text-content"
                            >
                              Comprovante
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="min-w-0 divide-y divide-asset/[0.07]">
            <section className="p-6">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="module-kicker">Exercício</p>
                  <h3 className="mt-1 text-base font-semibold tracking-tight">
                    Resumo do ano
                  </h3>
                  <p className="mt-1 text-[12px] text-muted">
                    Guias de maio a novembro
                  </p>
                </div>
                <span className="tabular text-[11px] text-faint">2026</span>
              </div>

              <div className="mt-5 max-w-[320px]">
                <div className="mb-2 flex justify-between text-[9px] uppercase tracking-[0.1em] text-faint">
                  <span>0</span>
                  <span>{showValues ? brl(60) : "••••"}</span>
                  <span>{showValues ? brl(120) : "••••"}</span>
                </div>
                <div className="space-y-2.5">
                  {bars.map((bar, index) => (
                    <div
                      key={`${bar.label}-${index}`}
                      className="grid grid-cols-[36px_minmax(0,1fr)_54px] items-center gap-2"
                    >
                      <span className="text-[10px] uppercase text-muted">
                        {showValues ? bar.label : "•••"}
                      </span>
                      <div className="relative h-2 overflow-hidden rounded-[2px] bg-asset/[0.05]">
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-asset/10"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-asset/10"
                        />
                        <span
                          className={`absolute inset-y-0 left-0 ${
                            bar.paid ? "bg-[var(--module)]" : "bg-asset/15"
                          }`}
                          style={{ width: `${(bar.value / 120) * 100}%` }}
                        />
                      </div>
                      <span className="tabular text-right text-[10px] text-muted">
                        {showValues ? brl(bar.value) : "••••"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-asset/[0.07] pt-3 text-[11px]">
                <span className="text-muted">Total quitado</span>
                <strong className="tabular module-text">{mask(paidThisYear)}</strong>
              </div>
            </section>

            <section className="p-6">
              <div className="flex items-start justify-between gap-3 border-l-2 border-l-[var(--module)] pl-4">
                <div>
                  <p className="module-kicker">Aviso</p>
                  <h3 className="mt-1 text-base font-semibold tracking-tight">
                    Lembretes
                  </h3>
                  <p className="mt-1 text-[12px] text-muted">
                    Aviso 3 dias antes do vencimento
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={alertsOn}
                  aria-label="Ativar lembretes"
                  onClick={() => {
                    setAlertsOn((value) => !value);
                    notify(alertsOn ? "Lembretes desativados" : "Lembretes ativados");
                  }}
                  className={`focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    alertsOn ? "bg-[var(--module)]" : "bg-asset/10"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full transition-all ${
                      alertsOn ? "left-6 bg-[#010122]" : "left-1 bg-asset"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 border-l-2 border-l-[var(--module)] pl-4">
                <p className="text-[11px] leading-relaxed text-muted">
                  {alertsOn
                    ? `Aviso programado para ${next.competence}.`
                    : "Avisos desativados. Reative para acompanhar o vencimento."}
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
