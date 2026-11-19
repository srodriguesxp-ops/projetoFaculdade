"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, type NavItem } from "@/components/app-shell";
import { LogoMark } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { brl } from "@/lib/dashboard-data";
import {
  cardTransactions,
  cards as initialCards,
  defaultHistory,
  invoiceHistory,
  type CardTransaction,
  type PaymentCard,
} from "@/lib/cards-data";

type ControlKey = "online" | "contactless" | "international" | "notifications";

const controlLabels: Record<ControlKey, string> = {
  online: "Compras online",
  contactless: "Pagamento por aproximação",
  international: "Transações internacionais",
  notifications: "Avisos de compra",
};

const controlInfo: Record<ControlKey, { description: string; icon: IconName }> = {
  online: { description: "Autorize compras na internet", icon: "cart" },
  contactless: { description: "Pague aproximando o cartão", icon: "card" },
  international: { description: "Use o cartão fora do país", icon: "transfer" },
  notifications: { description: "Avisos a cada autorização", icon: "bell" },
};

const initialsOf = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const categoryOf = (detail: string) => {
  const parts = detail.split("·").map((part) => part.trim());
  return parts[parts.length - 1] || detail;
};

const timeOf = (date: string) => date.split(",")[1]?.trim() ?? date;

function ChipMark() {
  return (
    <div className="relative h-7 w-9 rounded-[6px] bg-gradient-to-br from-[#ffd08a] via-[#f29b29] to-[#4a2c08] shadow-[inset_0_0_0_1px_rgba(249,249,249,0.45),0_2px_6px_rgba(1,1,34,0.4)] sm:h-8 sm:w-11">
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#000014]/45" />
      <span className="absolute inset-y-0 left-1/3 w-px -translate-x-1/2 bg-[#000014]/35" />
      <span className="absolute inset-y-0 left-2/3 w-px -translate-x-1/2 bg-[#000014]/35" />
      <span className="absolute inset-x-1/3 inset-y-1 rounded-[3px] border border-[#000014]/35" />
    </div>
  );
}

function CardVisual({
  card,
  showNumbers,
}: {
  card: PaymentCard;
  showNumbers: boolean;
}) {
  return (
    <div className="relative aspect-[1.586/1] w-full min-w-0 max-w-[360px] overflow-hidden rounded-[22px] border border-asset/15 shadow-[0_28px_70px_-30px_rgba(74,44,8,0.9)] ring-1 ring-asset/10">
      <div className="absolute inset-0" style={{ background: card.gradient }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(242,155,41,0.26), transparent 42%, rgba(1,1,34,0.45))",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 12% 0%, rgba(249,249,249,0.24), transparent 55%)",
        }}
      />
      <div className="absolute -right-[14%] -top-[30%] h-[75%] w-[75%] rounded-full border border-asset/10" />
      <div className="absolute -bottom-[38%] -left-[18%] h-[80%] w-[80%] rounded-full border border-asset/10" />
      <div
        className="absolute inset-y-0 -left-1/3 w-1/2 rotate-12"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(249,249,249,0.12), transparent)",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <LogoMark className="h-5 w-auto brightness-0 invert opacity-95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] sm:h-6" />
          <span className="rounded-full border border-asset/20 bg-asset/10 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-asset/80 sm:text-[9px]">
            {card.kind === "virtual"
              ? "Virtual"
              : (card.category.split(" · ")[1] ?? "Platinum")}
          </span>
        </div>

        <div>
          <ChipMark />
          <p className="tabular mt-3 whitespace-nowrap text-[clamp(10px,1.45vw,15px)] font-medium tracking-[0.12em] text-asset/95 sm:mt-4">
            {showNumbers
              ? `•••• •••• •••• ${card.last4}`
              : "•••• •••• •••• ••••"}
          </p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-[0.18em] text-asset/55 sm:text-[9px]">
              Titular
            </p>
            <p className="mt-0.5 truncate text-[9px] font-semibold text-asset/95 sm:text-[10px]">
              {card.holder}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[8px] uppercase tracking-[0.18em] text-asset/55 sm:text-[9px]">
              Validade
            </p>
            <p className="tabular mt-0.5 text-[9px] font-semibold text-asset/95 sm:text-[10px]">
              {card.expiry}
            </p>
          </div>
          <div className="flex shrink-0 items-center" aria-hidden="true">
            <span className="h-4 w-4 rounded-full bg-[#f29b29]/90 sm:h-5 sm:w-5" />
            <span className="-ml-1.5 h-4 w-4 rounded-full bg-[#ffd08a]/80 mix-blend-screen sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>

      {card.status === "blocked" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#000014]/75">
          <span className="flex items-center gap-1.5 rounded-full border border-asset/20 bg-black/55 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-asset sm:text-[10px]">
            <Icon name="close" size={12} />
            Bloqueado
          </span>
        </div>
      )}
    </div>
  );
}

function CardThumbnail({
  card,
  active,
  showNumbers,
  onSelect,
}: {
  card: PaymentCard;
  active: boolean;
  showNumbers: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`Selecionar ${card.name}`}
      className="focus-ring group relative flex min-w-0 w-full items-center gap-3 px-1 py-3 text-left transition-colors hover:bg-asset/[0.03]"
    >
      <span className="relative aspect-[1.586/1] w-[72px] shrink-0">
        <span
          className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-lg border border-asset/10 bg-asset/[0.04]"
          aria-hidden="true"
        />
        <span
          className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-lg border border-asset/10 bg-asset/[0.05]"
          aria-hidden="true"
        />
        <span
          className={`relative flex h-full w-full overflow-hidden rounded-lg border ${
            active
              ? "border-[#f29b29]/60 ring-1 ring-[#f29b29]/30"
              : "border-asset/20"
          }`}
          style={{ backgroundImage: card.gradient }}
          aria-hidden="true"
        >
          <span className="absolute inset-0 bg-gradient-to-br from-[#f29b29]/20 via-transparent to-[#000014]/55" />
          <span className="absolute left-2 top-2 h-2.5 w-3.5 rounded-[2px] bg-gradient-to-br from-[#ffd08a] to-[#f29b29]/70" />
          <span className="absolute bottom-2 left-2 h-px w-9 bg-asset/45" />
          {card.status === "blocked" && (
            <span className="absolute right-1 top-1 rounded-full bg-rose-500/90 px-1.5 py-0.5 text-[7px] font-bold uppercase text-asset">
              Bloq.
            </span>
          )}
        </span>
        {active && (
          <span
            className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#f29b29] text-[#000014]"
            aria-hidden="true"
          >
            <Icon name="check" size={12} strokeWidth={2.4} />
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12px] font-semibold">{card.name}</span>
        <span className="mt-0.5 block truncate text-[10px] text-faint">
          {card.kind === "virtual" ? "Virtual" : "Físico"} ·{" "}
          {showNumbers ? `•••• ${card.last4}` : "••••••"}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
              card.status === "blocked"
                ? "bg-rose-400/10 text-rose-300"
                : "module-soft module-text"
            }`}
          >
            {card.status === "blocked" ? "Bloqueado" : "Ativo"}
          </span>
          <span className="tabular text-[9px] text-faint">
            {showNumbers ? brl(card.used) : "R$ ••••"}
          </span>
        </span>
      </span>
    </button>
  );
}

export function Cards() {
  const router = useRouter();
  const [cards, setCards] = useState<PaymentCard[]>(initialCards);
  const [selectedId, setSelectedId] = useState(initialCards[0].id);
  const [paidIds, setPaidIds] = useState<string[]>([]);
  const [showNumbers, setShowNumbers] = useState(true);
  const [controls, setControls] = useState<Record<ControlKey, boolean>>({
    online: true,
    contactless: true,
    international: false,
    notifications: true,
  });
  const [toast, setToast] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("agora");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = (message: string) => setToast(message);
  const mask = (value: number) => (showNumbers ? brl(value) : "R$ ••••");

  const selected = cards.find((card) => card.id === selectedId) ?? cards[0];
  const usage = Math.min((selected.used / selected.limit) * 100, 100);
  const available = selected.limit - selected.used;
  const invoicePaid = paidIds.includes(selected.id);
  const transactions = cardTransactions.filter(
    (item) => item.cardId === selected.id,
  );
  const history = invoiceHistory[selected.id] ?? defaultHistory;
  const maxHistory = Math.max(...history.map((item) => item.value), 1);

  const groupedTransactions = transactions.reduce<
    { label: string; items: CardTransaction[] }[]
  >((groups, item) => {
    const label = item.date.split(",")[0];
    const existing = groups.find((group) => group.label === label);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
    return groups;
  }, []);

  const stripItems = [
    {
      label: "Limite disponível",
      value: mask(available),
      caption: `de ${mask(selected.limit)}`,
      icon: "wallet" as const,
    },
    {
      label: "Limite utilizado",
      value: `${Math.round(usage)}%`,
      caption: "da fatura aberta",
      icon: "chart" as const,
    },
    {
      label: "Fechamento",
      value: selected.closing,
      caption: "próximo ciclo",
      icon: "calendar" as const,
    },
    {
      label: "Cartões ativos",
      value: String(cards.filter((card) => card.status === "active").length),
      caption: `${cards.length} cartões no total`,
      icon: "card" as const,
      highlight: true,
    },
  ];

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
      scrollTo("cartoes");
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

  const toggleBlock = () => {
    const blocked = selected.status === "blocked";
    setCards((current) =>
      current.map((card) =>
        card.id === selected.id
          ? { ...card, status: blocked ? "active" : "blocked" }
          : card,
      ),
    );
    notify(blocked ? "Cartão desbloqueado" : "Cartão bloqueado temporariamente");
  };

  const payInvoice = () => {
    if (invoicePaid) {
      notify("Esta fatura já foi paga");
      return;
    }
    setPaidIds((current) => [...current, selected.id]);
    notify(`Fatura de ${brl(selected.used)} paga (demo)`);
  };

  const createVirtualCard = () => {
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const newCard: PaymentCard = {
      id: `virtual-${Date.now()}`,
      name: `Cartão virtual ${cards.filter((card) => card.kind === "virtual").length + 1}`,
      category: "Cartão virtual · Compras na internet",
      kind: "virtual",
      status: "active",
      last4,
      holder: "JAY JODODA SILVA",
      expiry: "11/29",
      limit: 2000,
      used: 0,
      invoiceDue: "10/12",
      closing: "03/12",
      color: "#f29b29",
      gradient: "linear-gradient(135deg, #4a2c08 0%, #000014 55%, #000014 100%)",
    };
    setCards((current) => [...current, newCard]);
    setSelectedId(newCard.id);
    setShowNumbers(true);
    notify("Cartão virtual criado com sucesso");
  };

  const toggleControl = (key: ControlKey) => {
    setControls((current) => ({ ...current, [key]: !current[key] }));
    notify(`${controlLabels[key]} ${controls[key] ? "desativado" : "ativado"}`);
  };

  return (
    <AppShell
      active="cards"
      title="Cartões"
      updatedAt={updatedAt}
      toast={toast}
      theme="theme-cards"
      onNavigate={handleNav}
      onNotify={notify}
      onRefresh={refresh}
    >
      <section className="panel-in space-y-5">
        <div
          className="surface motif-rings panel overflow-hidden p-5 sm:p-7"
          style={{
            background:
              "linear-gradient(120deg, rgba(74,44,8,0.42), rgba(0,0,20,0.94) 52%, rgba(242,155,41,0.10))",
          }}
        >
          <div className="relative">
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                  Cartões
                </h2>
                <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-muted">
                  Acompanhe fatura, limite, controles e compras do seu cartão.
                </p>
              </div>
              <span className="glass-soft rounded-full px-3 py-1.5 text-[11px] text-muted">
                Dados demonstrativos
              </span>
            </div>

            <div className="relative mt-6 grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="flex min-w-0 flex-col items-center gap-3 lg:items-start">
                <CardVisual card={selected} showNumbers={showNumbers} />
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] lg:justify-start">
                  <span className="module-soft module-text rounded-full px-2.5 py-1 font-semibold">
                    {selected.kind === "virtual" ? "Cartão virtual" : "Cartão físico"}
                  </span>
                  <span className="text-muted">
                    Final {showNumbers ? selected.last4 : "••••"}
                  </span>
                  <span className="text-faint">·</span>
                  <span className="text-muted">{selected.holder}</span>
                </div>
              </div>

              <div className="flex min-w-0 flex-col justify-between gap-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[12px] font-medium text-muted">
                      Fatura atual · {selected.name}
                    </p>
                    <button
                      type="button"
                      aria-label={showNumbers ? "Ocultar valores" : "Mostrar valores"}
                      onClick={() => setShowNumbers((value) => !value)}
                      className="focus-ring rounded-md p-1 text-muted transition-colors hover:text-[#f29b29]"
                    >
                      <Icon name={showNumbers ? "eye" : "eyeOff"} size={15} />
                    </button>
                  </div>

                  <p className="tabular mt-3 text-[clamp(32px,5vw,52px)] font-semibold leading-none tracking-tight text-content">
                    {mask(selected.used)}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="glass-soft flex items-center gap-1.5 rounded-full px-2.5 py-1 text-muted">
                      <Icon name="calendar" size={12} />
                      Vence em {selected.invoiceDue}
                    </span>
                    <span
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                        invoicePaid
                          ? "bg-gold/10 text-gold-light ring-1 ring-gold/20"
                          : "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20"
                      }`}
                    >
                      <Icon name={invoicePaid ? "check" : "sparkles"} size={12} />
                      {invoicePaid ? "Fatura paga" : "Em aberto"}
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-end justify-between gap-3">
                      <p className="overline">Limite utilizado</p>
                      <p className="tabular text-[11px] font-semibold text-[#f29b29]">
                        {Math.round(usage)}%
                      </p>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-asset/[0.07]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#4a2c08] via-[#f29b29] to-[#ffd08a]"
                        style={{ width: `${usage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap justify-between gap-2 text-[10px] text-faint">
                      <span className="tabular">{mask(selected.used)} faturados</span>
                      <span className="tabular">{mask(available)} disponíveis</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={payInvoice}
                    className="module-button focus-ring flex items-center gap-2 rounded-xl px-4 py-3 text-[12px] font-semibold"
                  >
                    <Icon name={invoicePaid ? "check" : "send"} size={16} />
                    {invoicePaid ? "Fatura paga" : "Pagar fatura"}
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTo("fatura")}
                    className="glass-soft focus-ring flex items-center gap-2 rounded-xl px-4 py-3 text-[12px] font-medium text-muted transition-colors hover:text-content"
                  >
                    <Icon name="chevron" size={16} />
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hairline flex flex-wrap items-center gap-x-4 gap-y-4 border-y py-4 sm:gap-x-6">
          {stripItems.map((item, index) => (
            <div
              key={item.label}
              className={`flex min-h-[60px] min-w-[132px] flex-1 items-center gap-2.5 sm:gap-3 ${
                index > 0 ? "sm:border-l sm:border-asset/10 sm:pl-4 xl:pl-6" : ""
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  item.highlight
                    ? "bg-[#f29b29]/12 text-[#f29b29]"
                    : "glass-soft text-muted"
                }`}
              >
                <Icon name={item.icon} size={14} />
              </span>
              <div className="min-w-0">
                <p className="overline leading-tight">{item.label}</p>
                <p
                  className={`tabular mt-1 truncate text-[15px] font-semibold leading-none ${
                    item.highlight ? "text-[#f29b29]" : "text-content"
                  }`}
                >
                  {item.value}
                </p>
                <p className="mt-1 truncate text-[9px] text-faint">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
        <div className="min-w-0 space-y-5">
          <section id="cartoes" className="hairline">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-2">
              <div>
                <h3 className="text-base font-semibold tracking-tight">Cartões</h3>
                <p className="mt-1 text-[11px] text-muted">
                  Selecione um cartão para ver os detalhes
                </p>
              </div>
              <button
                type="button"
                onClick={createVirtualCard}
                className="focus-ring flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#f29b29] transition-colors hover:bg-asset/[0.05]"
              >
                <Icon name="plus" size={14} />
                Novo cartão virtual
              </button>
            </div>
            <div className="divide-y divide-asset/[0.06]">
              {cards.map((card) => (
                <CardThumbnail
                  key={card.id}
                  card={card}
                  active={card.id === selected.id}
                  showNumbers={showNumbers}
                  onSelect={() => setSelectedId(card.id)}
                />
              ))}
            </div>
          </section>

          <section id="lancamentos" className="hairline">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Últimas compras
                </h3>
                <p className="mt-1 text-[11px] text-muted">
                  Movimentações de {selected.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNav({ id: "statement", label: "Extrato", icon: "list" })}
                className="focus-ring flex items-center gap-1 text-[11px] font-medium text-[#f29b29] hover:underline"
              >
                Ver extrato completo
                <Icon name="chevron" size={13} />
              </button>
            </div>

            <div>
              {groupedTransactions.map((group) => (
                <div key={group.label} className="mt-4 first:mt-0">
                  <div className="flex items-center gap-3">
                    <p className="overline">{group.label}</p>
                    <span className="divider-module flex-1" aria-hidden="true" />
                    <span className="text-[9px] text-faint">
                      {group.items.length} lanç.
                    </span>
                  </div>
                  <ul className="mt-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item.id}
                        className="ledger-row flex items-center gap-3 py-3"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ${
                            item.amount > 0
                              ? "bg-gold/10 text-gold-light ring-1 ring-gold/20"
                              : "module-soft module-text module-ring"
                          }`}
                          aria-hidden="true"
                        >
                          {initialsOf(item.title)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium">
                            {item.title}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-faint">
                            {categoryOf(item.detail)}
                          </p>
                        </div>
                        <span className="tabular hidden shrink-0 text-[10px] text-muted sm:block">
                          {timeOf(item.date)}
                        </span>
                        <p
                          className={`tabular w-24 shrink-0 text-right text-[12px] font-semibold sm:w-28 ${
                            item.amount > 0 ? "text-gold-light" : "text-content"
                          }`}
                        >
                          {mask(item.amount)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-asset/[0.06] pt-4">
              <div>
                <p className="text-[10px] text-faint">Total dos lançamentos</p>
                <p className="tabular mt-1 text-[13px] font-semibold">
                  {mask(transactions.reduce((sum, item) => sum + item.amount, 0))}
                </p>
              </div>
              <span className="text-[10px] text-muted">
                {transactions.length} lançamentos nesta fatura
              </span>
            </div>
          </section>
        </div>

        <div className="divide-y divide-asset/[0.06]">
          <section id="fatura" className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="module-kicker">Ciclo atual</p>
                <h3 className="mt-1.5 text-base font-semibold tracking-tight">
                  Evolução da fatura
                </h3>
                <p className="mt-1 text-[11px] text-muted">Últimos 6 meses</p>
              </div>
              <Icon name="chart" size={18} className="text-[#f29b29]" />
            </div>

            <div className="mt-5 flex h-36 items-end justify-between gap-2">
              {history.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="tabular text-[10px] text-faint">
                    {showNumbers ? item.label : "•••"}
                  </span>
                  <div
                    className={`w-full rounded-t-md ${
                      index === history.length - 1
                        ? "bg-gradient-to-t from-[#4a2c08] via-[#f29b29] to-[#ffd08a]"
                        : "module-soft"
                    }`}
                    style={{ height: `${(item.value / maxHistory) * 76}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="hairline mt-3 space-y-2 border-t pt-3 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted">Fechamento</span>
                <strong className="tabular text-content">{selected.closing}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Vencimento</span>
                <strong className="tabular text-content">{selected.invoiceDue}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Valor da fatura</span>
                <strong className="tabular text-[#f29b29]">{mask(selected.used)}</strong>
              </div>
            </div>
          </section>

          <section className="py-5 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="module-kicker">Segurança</p>
                <h3 className="mt-1.5 text-base font-semibold tracking-tight">
                  Controles do cartão
                </h3>
                <p className="mt-1 text-[11px] text-muted">
                  Ajustes para {selected.name}
                </p>
              </div>
              <span className="module-soft module-text flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                <Icon name="settings" size={17} />
              </span>
            </div>

            <div className="hairline mt-4 divide-y divide-asset/[0.06]">
              {(Object.keys(controlLabels) as ControlKey[]).map((key) => {
                const info = controlInfo[key];
                return (
                  <div key={key} className="flex items-center gap-3 py-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        controls[key]
                          ? "module-soft module-text"
                          : "glass-soft text-muted"
                      }`}
                    >
                      <Icon name={info.icon} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium">{controlLabels[key]}</p>
                      <p className="mt-0.5 truncate text-[10px] text-faint">
                        {info.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={controls[key]}
                      aria-label={controlLabels[key]}
                      onClick={() => toggleControl(key)}
                      className={`focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                        controls[key] ? "module-button" : "bg-asset/10"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-asset transition-all ${
                          controls[key] ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div
              className={`mt-4 rounded-2xl border p-4 transition-colors ${
                selected.status === "blocked"
                  ? "border-rose-400/55 bg-rose-500/15 ring-1 ring-rose-400/25"
                  : "border-rose-400/25 bg-rose-500/[0.06]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    selected.status === "blocked"
                      ? "bg-rose-400/20 text-rose-200"
                      : "bg-rose-400/10 text-rose-300"
                  }`}
                >
                  <Icon
                    name={selected.status === "blocked" ? "close" : "card"}
                    size={17}
                  />
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold">Bloqueio temporário</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-muted">
                    {selected.status === "blocked"
                      ? "Compras pausadas. Nenhuma autorização será aprovada."
                      : "Pause todas as compras em um toque."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleBlock}
                className={`focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-colors ${
                  selected.status === "blocked"
                    ? "module-button"
                    : "border border-rose-400/35 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                }`}
              >
                <Icon
                  name={selected.status === "blocked" ? "check" : "close"}
                  size={15}
                />
                {selected.status === "blocked"
                  ? "Desbloquear cartão"
                  : "Bloquear temporariamente"}
              </button>
            </div>
          </section>

          <section className="py-5 last:pb-0">
            <div className="flex items-start gap-3">
              <span className="module-soft module-text flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                <Icon name="sparkles" size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-semibold">Cartões virtuais</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                  Crie cartões com limites próprios para compras online com mais
                  segurança.
                </p>
                <button
                  type="button"
                  onClick={createVirtualCard}
                  className="focus-ring mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#f29b29] hover:underline"
                >
                  Novo cartão virtual
                  <Icon name="chevron" size={13} />
                </button>
              </div>
              <div className="relative hidden aspect-[1.586/1] w-[72px] shrink-0 sm:block" aria-hidden="true">
                <span className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-lg border border-asset/10 bg-asset/[0.04]" />
                <span
                  className="relative flex h-full w-full items-center justify-center rounded-lg border border-asset/20"
                  style={{
                    background: "linear-gradient(135deg, #4a2c08 0%, #000014 100%)",
                  }}
                >
                  <LogoMark className="h-4 w-auto brightness-0 invert opacity-90" />
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
