"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LogoLockup, LogoMark } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";

export type NavItem = { id: string; label: string; icon: IconName };

export const mainNav: NavItem[] = [
  { id: "overview", label: "Visão geral", icon: "grid" },
  { id: "wallet", label: "Minha carteira", icon: "wallet" },
  { id: "taxes", label: "Impostos MEI", icon: "receipt" },
];

export const financeNav: NavItem[] = [
  { id: "transfers", label: "Transferências", icon: "transfer" },
  { id: "cards", label: "Cartões", icon: "card" },
  { id: "investments", label: "Investimentos", icon: "chart" },
  { id: "statement", label: "Extrato", icon: "list" },
  { id: "manage", label: "Gerenciar", icon: "settings" },
];

type AppShellProps = {
  active: string;
  title: string;
  updatedAt: string;
  toast: string | null;
  theme?: string;
  children: ReactNode;
  onNavigate: (item: NavItem) => void;
  onNotify: (message: string) => void;
  onRefresh: () => void;
};

function NavButton({
  item,
  active,
  onClick,
  variant = "tab",
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  variant?: "tab" | "menu";
}) {
  const isTab = variant === "tab";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`focus-ring relative shrink-0 transition-colors ${
        isTab
          ? `whitespace-nowrap px-2.5 py-3 text-[12px] font-medium ${
              active
                ? "text-accent"
                : "text-muted hover:text-content"
            }`
          : `flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] ${
              active
                ? "bg-primary/[0.09] font-semibold text-accent"
                : "text-muted hover:bg-asset/[0.045] hover:text-content"
            }`
      }`}
    >
      {!isTab && (
        <Icon name={item.icon} size={17} className="shrink-0" />
      )}
      <span className="truncate">{item.label}</span>
      {isTab && active && (
        <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
      )}
      {!isTab && active && (
        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_10px_rgba(242,155,41,0.8)]" />
      )}
    </button>
  );
}

export function AppShell({
  active,
  title,
  updatedAt,
  toast,
  theme,
  children,
  onNavigate,
  onNotify,
  onRefresh,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const router = useRouter();

  const navigate = (item: NavItem) => {
    setMobileNavOpen(false);
    // A gestão é uma rota comum a todos os módulos, então o shell cuida dela
    // e as páginas seguem responsáveis apenas pelos seus próprios destinos.
    if (item.id === "manage") {
      router.push("/gerenciar");
      return;
    }
    onNavigate(item);
  };

  const navItems = [...mainNav, ...financeNav];

  return (
    <div className="min-h-screen bg-app-bg text-content">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(60%_70%_at_50%_0%,rgba(242,155,41,0.07),transparent_70%)]" />

      <div className="relative w-full px-3 pt-3 sm:px-5 sm:pt-4 lg:px-6">
        <div className="glass-strong sticky top-3 z-50 rounded-xl border border-asset/[0.07] shadow-[0_24px_70px_-40px_rgba(0,0,0,0.9)] sm:top-4">
          <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          <div className="flex items-center justify-between gap-4 px-3 py-2.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <LogoLockup
                className="h-auto w-[120px] shrink-0 sm:w-[148px]"
                preload
              />
              <span className="hidden h-6 w-px shrink-0 bg-asset/[0.08] sm:block" />
              <span className="hidden whitespace-nowrap text-[11px] text-faint sm:block">
                Seu painel financeiro
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="focus-ring hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:bg-asset/[0.06] hover:text-content lg:flex"
              >
                <Icon name="help" size={16} />
                Ajuda
              </button>
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                aria-label="Falar com o suporte"
                className="focus-ring rounded-lg p-1.5 text-muted transition-colors hover:bg-asset/[0.06] hover:text-content lg:hidden"
              >
                <Icon name="help" size={18} />
              </button>
              <button
                type="button"
                onClick={() => onNotify("Configurações: painel em preparação")}
                aria-label="Configurações"
                className="focus-ring hidden rounded-lg p-1.5 text-muted transition-colors hover:bg-asset/[0.06] hover:text-content sm:block"
              >
                <Icon name="settings" size={18} />
              </button>
              <button
                type="button"
                onClick={() => onNotify("Você não tem novas notificações")}
                aria-label="Notificações"
                className="focus-ring relative rounded-lg p-1.5 text-muted transition-colors hover:bg-asset/[0.06] hover:text-content"
              >
                <Icon name="bell" size={18} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  aria-expanded={accountOpen}
                  aria-label="Abrir menu da conta"
                  className="focus-ring flex items-center gap-2 rounded-full p-1 pr-1.5 hover:bg-asset/[0.06]"
                >
                  <span className="glass-soft flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-accent ring-1 ring-primary/25">
                    JS
                  </span>
                  <span className="hidden text-[12px] font-medium xl:block">
                    Jay Jododa Silva
                  </span>
                  <Icon
                    name="chevron"
                    size={13}
                    className="hidden text-muted xl:block"
                  />
                </button>
                {accountOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Fechar menu da conta"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setAccountOpen(false)}
                    />
                    <div className="glass-strong absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-xl border border-asset/[0.08] p-2">
                      <div className="border-b hairline px-2 pb-2 pt-1">
                        <p className="text-[12px] font-semibold">Conta pessoal</p>
                        <p className="mt-0.5 text-[10px] text-faint">
                          Jay Jododa Silva
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          onNotify("Jay Jododa Silva • Conta pessoal");
                        }}
                        className="focus-ring mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-muted hover:bg-asset/[0.05] hover:text-content"
                      >
                        <Icon name="user" size={15} />
                        Minha conta
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/cadastro")}
                        className="focus-ring flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-muted hover:bg-asset/[0.05] hover:text-content"
                      >
                        <Icon name="plus" size={15} />
                        Criar nova conta
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="focus-ring flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-gold-light hover:bg-asset/[0.05]"
                      >
                        <Icon name="logout" size={15} />
                        Sair da conta
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                aria-label={mobileNavOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={mobileNavOpen}
                onClick={() => setMobileNavOpen((value) => !value)}
                className="focus-ring rounded-lg p-1.5 text-muted transition-colors hover:bg-asset/[0.06] hover:text-content md:hidden"
              >
                <Icon name={mobileNavOpen ? "close" : "menu"} size={20} />
              </button>
            </div>
          </div>

          <div className="hidden border-t border-asset/[0.06] px-2 sm:px-4 md:block">
            <nav
              aria-label="Navegação principal"
              className="nav-scroll flex min-w-0 items-center gap-1 overflow-x-auto"
            >
              {navItems.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  active={active === item.id}
                  onClick={() => navigate(item)}
                />
              ))}
            </nav>
          </div>

          {mobileNavOpen && (
            <>
              <button
                type="button"
                aria-label="Fechar menu"
                className="fixed inset-0 z-40 bg-black/60 md:hidden"
                onClick={() => setMobileNavOpen(false)}
              />
              <div className="glass-strong absolute left-2 right-2 top-[calc(100%+8px)] z-50 rounded-xl border border-asset/[0.08] p-3 md:hidden">
                <p className="overline px-3 pb-2 pt-1">Navegação</p>
                <nav
                  aria-label="Navegação principal (mobile)"
                  className="space-y-0.5"
                >
                  {mainNav.map((item) => (
                    <NavButton
                      key={item.id}
                      item={item}
                      active={active === item.id}
                      onClick={() => navigate(item)}
                      variant="menu"
                    />
                  ))}
                  <p className="overline px-3 pb-2 pt-4">Suas finanças</p>
                  {financeNav.map((item) => (
                    <NavButton
                      key={item.id}
                      item={item}
                      active={active === item.id}
                      onClick={() => navigate(item)}
                      variant="menu"
                    />
                  ))}
                </nav>
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    setSupportOpen(true);
                  }}
                  className="focus-ring mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] text-muted hover:bg-asset/[0.05] hover:text-content"
                >
                  <Icon name="help" size={17} />
                  Falar com o suporte
                </button>
                <div className="mt-2 grid grid-cols-2 gap-2 border-t hairline pt-3">
                  <button
                    type="button"
                    onClick={() => router.push("/cadastro")}
                    className="focus-ring flex items-center justify-center gap-1.5 rounded-lg border border-asset/[0.07] px-2 py-2 text-[12px] text-muted hover:bg-asset/[0.05] hover:text-content"
                  >
                    <Icon name="plus" size={14} />
                    Criar conta
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="focus-ring flex items-center justify-center gap-1.5 rounded-lg border border-gold/25 px-2 py-2 text-[12px] text-gold-light hover:bg-gold/10"
                  >
                    <Icon name="logout" size={14} />
                    Entrar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 px-1 pb-2 pt-6">
          <div className="min-w-0">
            <p className="text-[11px] text-muted">
              Meu painel <span className="mx-1 text-faint">/</span>{" "}
              <span className="text-content">{title}</span>
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] text-muted">
                Quinta-feira, 18 de novembro de 2026
              </p>
              <p className="text-[11px] text-faint">Atualizado {updatedAt}</p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Atualizar dados"
              className="focus-ring flex items-center gap-2 rounded-lg border border-asset/[0.07] bg-asset/[0.03] px-3 py-2 text-[11px] font-medium text-muted transition-colors hover:bg-asset/[0.06] hover:text-content"
            >
              <Icon name="refresh" size={16} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>

        <main className={`scroll-mt-44 pb-16 ${theme ?? "theme-overview"}`}>
          {children}
        </main>
      </div>

      {supportOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="glass-strong w-full max-w-sm rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-accent">
                  <Icon name="help" size={20} />
                </span>
                <LogoMark className="h-7 w-auto opacity-80" />
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setSupportOpen(false)}
                className="focus-ring rounded-lg p-1.5 text-muted hover:bg-asset/[0.06]"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <h3 className="mt-4 text-lg font-semibold">Falar com o suporte</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Nossa equipe está pronta para ajudar com suas finanças. Envie uma mensagem
              e responderemos em breve.
            </p>
            <button
              type="button"
              onClick={() => {
                setSupportOpen(false);
                onNotify("Mensagem enviada! Retornaremos em breve.");
              }}
              className="glow-button focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-[10px] py-2.5 text-[13px] font-semibold text-[#010122]"
            >
              <Icon name="send" size={16} />
              Enviar mensagem
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="glass-strong panel-in fixed bottom-6 right-6 z-[70] flex items-center gap-2.5 rounded-xl px-4 py-3 text-[12px] font-medium shadow-2xl"
        >
          <Icon name="check" size={16} className="text-accent" />
          {toast}
        </div>
      )}
    </div>
  );
}
