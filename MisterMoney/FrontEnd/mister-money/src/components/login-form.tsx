"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Informe um e-mail válido para continuar.");
      return;
    }
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setError(null);
    setLoading(true);
    window.setTimeout(() => router.push("/"), 500);
  };

  return (
    <div className="panel glass-strong rounded-2xl p-6 sm:p-8">
      <p className="overline">Acesso à conta</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[28px]">
        Entrar no Mister Money
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Use suas credenciais para acompanhar saldo, despesas e investimentos.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="text-[12px] font-medium text-content">
            E-mail
          </label>
          <div className="glass-soft mt-1.5 flex items-center gap-2.5 rounded-[10px] px-3 focus-within:border-gold/50">
            <Icon name="mail" size={17} className="shrink-0 text-faint" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error !== null && !email.includes("@")}
              className="h-11 w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-faint"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="text-[12px] font-medium text-content">
            Senha
          </label>
          <div className="glass-soft mt-1.5 flex items-center gap-2.5 rounded-[10px] px-3 focus-within:border-gold/50">
            <Icon name="lock" size={17} className="shrink-0 text-faint" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Sua senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-faint"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              className="focus-ring shrink-0 rounded p-1 text-faint transition-colors hover:text-gold-light"
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Manter conectado
          </label>
          <button
            type="button"
            onClick={() =>
              setNotice("Recuperação de senha: envie um e-mail para suporte@mistermoney.com.br")
            }
            className="focus-ring text-[12px] font-medium text-gold-light hover:underline"
          >
            Esqueci a senha
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-rose-400/10 px-3 py-2 text-[12px] text-rose-300">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-lg bg-gold/10 px-3 py-2 text-[12px] text-gold-light">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="glow-button focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-[13px] font-semibold text-[#010122] transition-opacity disabled:opacity-70"
        >
          {loading ? "Entrando..." : "Entrar"}
          {!loading && <Icon name="arrowRight" size={16} />}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-asset/[0.08]" />
        <span className="text-[10px] uppercase tracking-[0.16em] text-faint">ou</span>
        <span className="h-px flex-1 bg-asset/[0.08]" />
      </div>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-asset/[0.09] bg-asset/[0.03] text-[13px] font-medium text-content transition-colors hover:bg-asset/[0.06]"
      >
        Explorar a conta demo
      </button>

      <p className="mt-6 text-center text-[12px] text-muted">
        Ainda não tem uma conta?{" "}
        <Link href="/cadastro" className="font-semibold text-gold-light hover:underline">
          Criar conta
        </Link>
      </p>

      <p className="mt-5 rounded-lg border border-asset/[0.06] bg-asset/[0.025] px-3 py-2.5 text-center text-[11px] leading-relaxed text-faint">
        Demonstração: informe qualquer e-mail válido e uma senha com 8 ou mais caracteres.
      </p>
    </div>
  );
}
