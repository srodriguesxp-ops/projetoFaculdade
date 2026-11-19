"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { brl } from "@/lib/dashboard-data";
import { accounts as accountsDemo, type Account } from "@/lib/wallet-data";
import {
  contacts,
  dailyPixLimit,
  dailyPixUsed,
  initialTransfers as initialTransfersDemo,
  scheduleOptions,
  type Contact,
  type Transfer,
} from "@/lib/transfers-data";

type TransfersProps = {
  accounts?: Account[];
  transfers?: Transfer[];
  origem?: "api" | "demo";
};

type Filter = "all" | "sent" | "received";

const filterLabels: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "sent", label: "Enviadas" },
  { id: "received", label: "Recebidas" },
];

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const scheduleStamp = (label: string) => {
  const [head = "", tail = ""] = label.split(",");
  const tokens = head.trim().split(/\s+/);
  return {
    day: tokens[0] ?? head.trim(),
    context: tokens.slice(1).join(" "),
    time: tail.trim(),
  };
};

export function Transfers({
  accounts: accountsDaApi,
  transfers: transfersDaApi,
  origem = "demo",
}: TransfersProps) {
  const router = useRouter();
  const contas =
    accountsDaApi && accountsDaApi.length > 0 ? accountsDaApi : accountsDemo;
  const [transfers, setTransfers] = useState<Transfer[]>(
    transfersDaApi && transfersDaApi.length > 0
      ? transfersDaApi
      : initialTransfersDemo,
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [showValues, setShowValues] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [sourceId, setSourceId] = useState(contas[0].id);
  const [schedule, setSchedule] = useState("");
  const [error, setError] = useState("");
  const [usedToday, setUsedToday] = useState(dailyPixUsed);
  const [toast, setToast] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("agora");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast(message);
  const mask = (value: number) => (showValues ? brl(value) : "R$ ••••");

  const source = contas.find((account) => account.id === sourceId) ?? contas[0];
  const term = query.trim().toLowerCase();
  const visibleTransfers = transfers.filter((item) => {
    if (item.status === "cancelled") return false;
    if (filter !== "all" && item.direction !== filter) return false;
    if (!term) return true;
    return `${item.name} ${item.note} ${item.key} ${item.detail}`
      .toLowerCase()
      .includes(term);
  });
  const scheduled = transfers.filter((item) => item.status === "scheduled");
  const sentTotal = transfers
    .filter((item) => item.direction === "sent" && item.status === "done")
    .reduce((sum, item) => sum + item.amount, 0);
  const receivedTotal = transfers
    .filter((item) => item.direction === "received" && item.status === "done")
    .reduce((sum, item) => sum + item.amount, 0);
  const limitUsage = Math.min((usedToday / dailyPixLimit) * 100, 100);

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
    } else if (item.id === "taxes") {
      router.push("/impostos-mei");
    } else if (item.id === "transfers") {
      scrollTo("transferencias");
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

  const refresh = () => {
    setUpdatedAt(
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    notify("Dados atualizados agora");
  };

  const openForm = (contact?: Contact) => {
    setRecipient(contact?.name ?? "");
    setPixKey(contact?.key ?? "");
    setDescription("");
    setAmount("");
    setSchedule("");
    setError("");
    setFormOpen(true);
  };

  const openScheduleForm = () => {
    openForm();
    setSchedule(scheduleOptions[0]?.value ?? "");
  };

  const submitTransfer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(amount);

    if (!recipient.trim() || !pixKey.trim() || !Number.isFinite(value) || value <= 0) {
      setError("Informe destinatário, chave Pix e um valor válido.");
      return;
    }
    if (value > source.balance) {
      setError(`Saldo insuficiente em ${source.name}.`);
      return;
    }
    if (!schedule && value > dailyPixLimit - usedToday) {
      setError("Valor acima do limite Pix disponível para hoje.");
      return;
    }

    const isScheduled = schedule !== "";
    const transfer: Transfer = {
      id: `t-${Date.now()}`,
      name: recipient.trim(),
      initials: initialsOf(recipient),
      key: pixKey.trim(),
      detail: isScheduled
        ? `Pix agendado · ${source.name}`
        : `Pix enviado · ${source.name}`,
      dateLabel: isScheduled ? schedule : "Agora",
      amount: value,
      direction: "sent",
      status: isScheduled ? "scheduled" : "done",
      accountId: source.id,
      note: description.trim() || "Transferência Pix",
      color: isScheduled ? "var(--muted)" : "var(--module)",
    };

    setTransfers((current) => [transfer, ...current]);
    if (!isScheduled) setUsedToday((current) => current + value);
    notify(
      isScheduled
        ? `Pix de ${brl(value)} agendado para ${schedule}`
        : `Pix de ${brl(value)} registrado${origem === "api" ? " localmente (a API ainda não faz Pix externo)" : " com sucesso"}`,
    );
    setFormOpen(false);
  };

  const cancelScheduled = (id: string) => {
    setTransfers((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "cancelled" } : item,
      ),
    );
    notify("Agendamento cancelado");
  };

  return (
    <AppShell
      active="transfers"
      title="Transferências"
      updatedAt={updatedAt}
      toast={toast}
      onNavigate={handleNav}
      onNotify={notify}
      onRefresh={refresh}
      theme="theme-transfers"
    >
      <section className="panel-in space-y-5">
        {/* HERO — fluxo horizontal */}
        <section className="surface hero-flow motif-rings panel p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="min-w-0">
              <p className="module-kicker">Transferências</p>
              <h2 className="mt-2 text-[40px] font-semibold leading-none tracking-tight sm:text-[56px]">
                Pix
              </h2>
              <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-faint">
                Pagamentos em tempo real
              </p>
              <p className="mt-4 max-w-xl text-[12px] leading-relaxed text-muted">
                Envie agora, programe o próximo passo e acompanhe cada Pix em
                uma única correntada.
              </p>
              <button
                type="button"
                onClick={() => scrollTo("agendadas")}
                className="module-text focus-ring mt-3 flex items-center gap-1.5 text-[11px] font-semibold transition-opacity hover:opacity-80"
              >
                <Icon name="calendar" size={13} />
                Ver fila de agendamentos
                <span className="tabular module-soft rounded-full px-1.5 py-0.5 text-[10px]">
                  {scheduled.length}
                </span>
                <Icon name="chevron" size={12} />
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch lg:shrink-0">
              <div className="glass-soft module-border w-full min-w-0 rounded-xl px-5 py-4 sm:w-auto sm:min-w-[215px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="overline text-[9px]">Pix disponível hoje</span>
                  <button
                    type="button"
                    aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
                    onClick={() => setShowValues((value) => !value)}
                    className="focus-ring rounded-md p-1 transition-colors module-text"
                  >
                    <Icon name={showValues ? "eye" : "eyeOff"} size={15} />
                  </button>
                </div>
                <p className="tabular module-text mt-2.5 text-[30px] font-semibold leading-none tracking-tight">
                  {mask(dailyPixLimit - usedToday)}
                </p>
                <p className="mt-2 text-[10px] text-faint">
                  Limite diário de {brl(dailyPixLimit)}
                </p>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() => openForm()}
                  className="module-button focus-ring flex w-full min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-[12px] font-semibold transition-transform hover:-translate-y-0.5 sm:w-[175px]"
                >
                  <Icon name="send" size={16} />
                  Enviar Pix
                </button>
                <button
                  type="button"
                  onClick={openScheduleForm}
                  className="glass-soft module-border focus-ring flex w-full min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-[12px] font-semibold transition-colors module-text sm:w-[175px]"
                >
                  <Icon name="calendar" size={16} />
                  Agendar Pix
                  <span className="text-[10px] opacity-60">→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Banda horizontal de leitura rápida */}
        <div className="stat-strip grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Enviado no mês",
              value: mask(sentTotal),
              caption: `${transfers.filter((item) => item.direction === "sent" && item.status === "done").length} Pix concluídos`,
              icon: "arrowUp" as const,
            },
            {
              label: "Recebido no mês",
              value: mask(receivedTotal),
              caption: `${transfers.filter((item) => item.direction === "received").length} créditos recebidos`,
              icon: "arrowDown" as const,
            },
            {
              label: "Na fila",
              value: String(scheduled.length),
              caption: "agendamentos ativos",
              icon: "calendar" as const,
            },
            {
              label: "Pix usado hoje",
              value: mask(usedToday),
              caption: `${Math.round(limitUsage)}% do limite diário`,
              icon: "transfer" as const,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-0 items-center gap-3 border-t border-asset/[0.06] px-5 py-3.5 first:border-t-0 sm:border-t-0 sm:border-r sm:even:border-r-0 sm:[&:nth-child(n+3)]:border-t lg:[&:nth-child(n+3)]:border-t-0 lg:[&:nth-child(even)]:border-r lg:last:border-r-0"
            >
              <span className="module-soft module-text flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <Icon name={stat.icon} size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] text-muted">{stat.label}</p>
                <p className="tabular mt-0.5 text-[17px] font-semibold leading-none tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 truncate text-[9px] text-faint">
                  {stat.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* SUPERFÍCIE CONTÍNUA — fundo único e divisores */}
        <div className="panel divide-y divide-asset/[0.07] overflow-hidden">
          {/* FAVORITOS */}
          <section className="px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="module-kicker">Favoritos</p>
                <h3 className="mt-1 text-base font-semibold tracking-tight">
                  Contatos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => notify("Gesture de contatos em preparação")}
                className="focus-ring module-text flex items-center gap-1 text-[11px] font-medium transition-opacity hover:opacity-80"
              >
                Gerenciar contatos
                <Icon name="chevron" size={13} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3 pb-1 sm:flex sm:gap-7">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => openForm(contact)}
                  className="focus-ring group flex w-full min-w-0 flex-col items-center gap-2 text-center sm:w-[92px] sm:shrink-0"
                >
                  <span className="module-soft module-text relative flex aspect-square w-14 items-center justify-center rounded-full text-[13px] font-bold ring-1 ring-asset/10 transition-transform group-hover:scale-105 sm:w-16">
                    {contact.initials}
                  </span>
                  <span className="w-full truncate text-[11px] font-medium">
                    {contact.name.split(" ")[0] ?? contact.name}
                  </span>
                  <span className="w-full truncate text-[9px] text-faint">
                    {contact.bank}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* LINHA DO TEMPO */}
          <section id="transferencias" className="px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="module-soft module-text flex h-9 w-9 items-center justify-center rounded-lg">
                  <Icon name="transfer" size={17} />
                </span>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">
                    Últimas transferências
                  </h3>
                  <p className="text-[11px] text-muted">
                    Acompanhe cada movimentação Pix
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-muted">
                {origem === "api" ? "Dados do banco" : "Dados demonstrativos"}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-y border-asset/[0.07] py-3">
              <div
                className="flex items-center rounded-lg bg-black/25 p-1"
                role="group"
                aria-label="Filtrar transferências"
              >
                {filterLabels.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFilter(option.id)}
                    aria-pressed={filter === option.id}
                    className={`focus-ring flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      filter === option.id
                        ? "module-button"
                        : "text-muted hover:text-content"
                    }`}
                  >
                    <Icon
                      name={
                        option.id === "sent"
                          ? "arrowUp"
                          : option.id === "received"
                            ? "arrowDown"
                            : "list"
                      }
                      size={12}
                    />
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="glass-soft flex min-w-[190px] flex-1 items-center gap-2 rounded-lg px-3 py-2 sm:max-w-md">
                <Icon name="list" size={14} className="text-faint" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por nome, chave ou descrição"
                  aria-label="Buscar transferências"
                  className="focus-ring w-full bg-transparent text-[12px] text-content outline-none placeholder:text-faint"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Limpar busca"
                    className="focus-ring rounded p-1 text-faint hover:text-content"
                  >
                    <Icon name="close" size={13} />
                  </button>
                )}
              </div>

              <button
                type="button"
                aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
                onClick={() => setShowValues((value) => !value)}
                className="module-soft module-text focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              >
                <Icon name={showValues ? "eye" : "eyeOff"} size={15} />
              </button>
            </div>

            <ul className="mt-1">
              {visibleTransfers.map((item, index) => (
                <li
                  key={item.id}
                  className="ledger-row relative flex gap-4 py-4 pl-1 sm:gap-5"
                >
                  {index !== visibleTransfers.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-px left-[26px] top-12 w-px bg-gradient-to-b from-[rgba(var(--module-rgb),0.5)] via-asset/10 to-transparent"
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-4 ring-app-bg ${
                      item.status === "scheduled"
                        ? "bg-asset/[0.06] text-muted"
                        : "module-soft module-text"
                    }`}
                  >
                    {item.initials}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p className="min-w-0 break-words text-[13px] font-medium">
                        {item.name}
                      </p>
                      <p
                        className={`tabular shrink-0 text-[14px] font-semibold ${
                          item.direction === "received" ? "module-text" : "text-content"
                        }`}
                      >
                        {showValues
                          ? `${item.direction === "received" ? "+ " : "- "}${brl(item.amount)}`
                          : "R$ ••••"}
                      </p>
                    </div>
                    <p className="mt-1 break-words text-[11px] leading-snug text-faint">
                      {item.detail} · {item.note}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="tabular text-[10px] text-muted">
                        {item.dateLabel}
                      </span>
                      <span className="rounded-full bg-asset/[0.05] px-2 py-0.5 text-[9px] text-muted">
                        {item.direction === "received" ? "Entrada" : "Saída"}
                      </span>
                      {item.status === "scheduled" && (
                        <span className="module-soft module-text rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                          Agendado
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {visibleTransfers.length === 0 && (
                <li className="py-10 text-center text-[12px] text-muted">
                  Nenhuma transferência encontrada para este filtro.
                </li>
              )}
            </ul>
          </section>

          {/* FILA + MEDIDOR */}
          <section id="agendadas" className="px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="flex shrink-0 items-center gap-5 lg:w-[290px]">
                <div
                  className="relative aspect-square w-[116px] shrink-0 rounded-full sm:w-[132px]"
                  style={{
                    background: `conic-gradient(from -90deg, var(--module) 0% ${limitUsage}%, rgba(var(--module-rgb), 0.12) ${limitUsage}% 100%)`,
                  }}
                  role="img"
                  aria-label={`${Math.round(limitUsage)}% do limite Pix diário utilizado`}
                >
                  <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-app-bg">
                    <span className="tabular text-[21px] font-semibold leading-none tracking-tight">
                      {Math.round(limitUsage)}%
                    </span>
                    <span className="overline mt-1.5 text-[9px]">usado</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13px] font-semibold tracking-tight">
                    Limite Pix diário
                  </h3>
                  <p className="tabular mt-1.5 text-[18px] font-semibold leading-none tracking-tight">
                    {mask(usedToday)}
                  </p>
                  <p className="mt-1.5 text-[10px] text-faint">
                    de {brl(dailyPixLimit)}
                  </p>
                  <div className="divider-module my-3" />
                  <p className="text-[10px] text-muted">Disponível</p>
                  <p className="tabular module-text mt-0.5 text-[12px] font-semibold">
                    {mask(dailyPixLimit - usedToday)}
                  </p>
                </div>
              </div>

              <div className="hidden w-px self-stretch bg-asset/[0.07] lg:block" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold tracking-tight">
                    Agendamentos
                  </h3>
                  <span className="module-text tabular rounded-full px-2.5 py-1 text-[10px] font-semibold module-soft">
                    {scheduled.length} na fila
                  </span>
                </div>

                <ul className="mt-4 divide-y divide-asset/[0.06]">
                  {scheduled.map((item) => {
                    const stamp = scheduleStamp(item.dateLabel);
                    return (
                      <li
                        key={item.id}
                        className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-2 px-1 py-3 sm:flex sm:flex-wrap sm:items-center"
                      >
                        <span className="module-soft module-text flex aspect-square w-12 shrink-0 flex-col items-center justify-center rounded-lg">
                          <span className="tabular text-[15px] font-bold leading-none">
                            {stamp.day}
                          </span>
                          <span className="mt-0.5 max-w-[44px] truncate text-[8px] uppercase leading-none opacity-80">
                            {stamp.context || (stamp.time ? " Pix" : "Agendado")}
                          </span>
                        </span>
                        <div className="min-w-0 max-w-lg flex-1">
                          <p className="min-w-0 break-words text-[12px] font-medium">
                            {item.name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="tabular text-[10px] text-faint">
                              {stamp.time || item.dateLabel}
                            </span>
                            <span className="break-words text-[10px] text-faint">
                              · {item.note}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2 flex min-w-0 flex-wrap items-center justify-between gap-2 sm:ml-auto sm:justify-end">
                          <p className="tabular shrink-0 text-[12px] font-semibold">
                            {mask(item.amount)}
                          </p>
                          <button
                            type="button"
                            onClick={() => cancelScheduled(item.id)}
                            aria-label={`Cancelar agendamento de ${item.name}`}
                            className="focus-ring flex shrink-0 items-center gap-1 rounded-lg border border-rose-400/25 bg-rose-400/10 px-2.5 py-1.5 text-[10px] font-semibold text-rose-200 transition-colors hover:bg-rose-400/20"
                          >
                            <Icon name="close" size={12} />
                            Cancelar agendamento
                          </button>
                        </div>
                      </li>
                    );
                  })}
                  {scheduled.length === 0 && (
                    <li className="px-1 py-6 text-center text-[12px] text-muted">
                      Nenhuma transferência agendada.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
            <Icon name="sparkles" size={16} className="module-text mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-muted">
              <span className="font-semibold text-content">Pix com segurança.</span>{" "}
              Confira sempre o nome do destinatário antes de confirmar.
              Transferências agendadas podem ser canceladas até o horário do envio.
            </p>
          </div>
        </div>
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={submitTransfer}
            className="glass-strong max-h-[92vh] w-full max-w-[420px] overflow-y-auto rounded-2xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="module-kicker">Pix</p>
                <h3 className="mt-1 text-lg font-semibold">Enviar Pix</h3>
                <p className="mt-1 text-[12px] text-muted">
                  Preencha os dados do Pix
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Fechar"
                className="focus-ring rounded-lg p-1.5 text-muted hover:bg-asset/[0.06]"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="divider-module mt-5" />

            <div className="mt-5 space-y-4">
              <label className="block min-w-0">
                <span className="text-[11px] font-medium text-muted">
                  Conta de origem
                </span>
                <select
                  value={sourceId}
                  onChange={(event) =>
                    setSourceId(event.target.value as typeof sourceId)
                  }
                  className="focus-ring mt-1.5 w-full rounded-[10px] border border-asset/[0.06] bg-[#010122] px-3 py-2.5 text-[12px] text-content outline-none"
                >
                  {contas.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} · {brl(account.balance)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block min-w-0">
                <span className="text-[11px] font-medium text-muted">
                  Nome do destinatário
                </span>
                <input
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder="Ex.: Maria Oliveira"
                  className="glass-soft focus-ring mt-1.5 w-full rounded-[10px] border border-asset/[0.06] px-3 py-2.5 text-[12px] text-content outline-none placeholder:text-faint"
                />
              </label>

              <label className="block min-w-0">
                <span className="text-[11px] font-medium text-muted">
                  Chave Pix
                </span>
                <input
                  value={pixKey}
                  onChange={(event) => setPixKey(event.target.value)}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  className="glass-soft focus-ring mt-1.5 w-full rounded-[10px] border border-asset/[0.06] px-3 py-2.5 text-[12px] text-content outline-none placeholder:text-faint"
                />
              </label>

              <label className="block min-w-0">
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
                <div className="mt-2 flex flex-wrap gap-2">
                  {[100, 250, 500].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(String(value))}
                      className="module-soft module-text focus-ring rounded-full px-2.5 py-1 text-[10px] font-medium"
                    >
                      {brl(value)}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block min-w-0">
                <span className="text-[11px] font-medium text-muted">
                  Descrição (opcional)
                </span>
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ex.: Pagamento de serviço"
                  className="glass-soft focus-ring mt-1.5 w-full rounded-[10px] border border-asset/[0.06] px-3 py-2.5 text-[12px] text-content outline-none placeholder:text-faint"
                />
              </label>

              <label className="block min-w-0">
                <span className="text-[11px] font-medium text-muted">
                  Quando enviar
                </span>
                <select
                  value={schedule}
                  onChange={(event) => setSchedule(event.target.value)}
                  className="focus-ring mt-1.5 w-full rounded-[10px] border border-asset/[0.06] bg-[#010122] px-3 py-2.5 text-[12px] text-content outline-none"
                >
                  <option value="">Enviar agora</option>
                  {scheduleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {error && (
                <p role="alert" className="text-[11px] text-rose-300">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="module-button focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-[10px] py-2.5 text-[13px] font-semibold"
            >
              <Icon name="send" size={16} />
              Confirmar transferência
            </button>
          </form>
        </div>
      )}
    </AppShell>
  );
}
