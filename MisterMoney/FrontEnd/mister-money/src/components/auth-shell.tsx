import type { ReactNode } from "react";
import { LogoLockup } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

const highlights: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "wallet",
    title: "Tudo em um só lugar",
    description: "Saldo, contas e movimentações atualizados em tempo real.",
  },
  {
    icon: "chart",
    title: "Decisões com contexto",
    description: "Acompanhe despesas, investimentos e o imposto do seu MEI.",
  },
  {
    icon: "shield",
    title: "Seus dados protegidos",
    description: "Acesso reservado e informações apenas para você.",
  },
];

export function AuthShell({ children, title, subtitle }: AuthShellProps) {
  return (
    <div className="relative min-h-screen bg-app-bg text-content">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(70%_55%_at_15%_0%,rgba(242,155,41,0.09),transparent_70%),radial-gradient(55%_45%_at_95%_100%,rgba(242,155,41,0.06),transparent_70%)]" />

      <div className="relative grid min-h-screen w-full grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="surface relative hidden flex-col justify-between overflow-hidden border-r hairline px-8 py-8 lg:flex xl:px-14 xl:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(242,155,41,0.10),transparent_45%)]" />
          <div className="motif-grid pointer-events-none absolute inset-0 opacity-70" />

          <div className="relative z-10">
            <LogoLockup className="h-auto w-[150px]" preload />
          </div>

          <div className="relative z-10 max-w-[560px] py-10">
            <p className="overline">Mister Money</p>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] xl:text-5xl">
              {title}
            </h2>
            <p className="mt-4 max-w-[460px] text-[14px] leading-relaxed text-muted">
              {subtitle}
            </p>

            <div className="mt-9 space-y-5">
              {highlights.map((item) => (
                <div key={item.title} className="flex items-start gap-3.5">
                  <span className="glass-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-accent">
                    <Icon name={item.icon} size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-[11px] text-faint">
            <Icon name="lock" size={13} />
            Ambiente demonstrativo · nenhum dado real é enviado
          </div>
        </section>

        <section className="flex min-h-screen flex-col px-4 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-8 xl:px-14">
          <div className="flex items-center justify-between gap-4">
            <LogoLockup className="h-auto w-[132px] lg:hidden" preload />
            <span className="hidden text-[12px] text-muted lg:block">
              Acesse sua conta
            </span>
          </div>

          <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
            <div className="panel-in w-full max-w-[440px]">{children}</div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-faint">
            <span>© 2026 Mister Money</span>
            <span>Uma visão clara do seu dinheiro</span>
          </div>
        </section>
      </div>
    </div>
  );
}
