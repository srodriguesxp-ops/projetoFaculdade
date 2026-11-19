"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function maskCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function passwordScore(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  return Math.min(score, 4);
}

const scoreLabels = ["Fraca", "Razoável", "Boa", "Forte"];

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const score = passwordScore(password);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (name.trim().length < 3) {
      setError("Informe seu nome completo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (onlyDigits(cpf).length !== 11) {
      setError("Informe um CPF com 11 dígitos.");
      return;
    }
    if (onlyDigits(phone).length < 10) {
      setError("Informe um telefone com DDD.");
      return;
    }
    if (score < 2) {
      setError("Use uma senha com pelo menos 8 caracteres, letras e números.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas informadas não coincidem.");
      return;
    }
    if (!accepted) {
      setError("Aceite os termos para continuar.");
      return;
    }

    setError(null);
    setLoading(true);
    window.setTimeout(() => router.push("/"), 500);
  };

  return (
    <div className="panel glass-strong rounded-2xl p-6 sm:p-8">
      <p className="overline">Nova conta</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[28px]">
        Criar sua conta
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Leva menos de um minuto. Seus dados ficam apenas nesta demonstração.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="text-[12px] font-medium text-content">
            Nome completo
          </label>
          <div className="glass-soft mt-1.5 flex items-center gap-2.5 rounded-[10px] px-3 focus-within:border-gold/50">
            <Icon name="user" size={17} className="shrink-0 text-faint" />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Como você se chama"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-faint"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cpf" className="text-[12px] font-medium text-content">
              CPF
            </label>
            <div className="glass-soft mt-1.5 flex items-center gap-2.5 rounded-[10px] px-3 focus-within:border-gold/50">
              <Icon name="shield" size={17} className="shrink-0 text-faint" />
              <input
                id="cpf"
                name="cpf"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(event) => setCpf(maskCpf(event.target.value))}
                className="tabular h-11 w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-faint"
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="text-[12px] font-medium text-content">
              Celular
            </label>
            <div className="glass-soft mt-1.5 flex items-center gap-2.5 rounded-[10px] px-3 focus-within:border-gold/50">
              <Icon name="phone" size={17} className="shrink-0 text-faint" />
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(event) => setPhone(maskPhone(event.target.value))}
                className="tabular h-11 w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-faint"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="text-[12px] font-medium text-content">
            E-mail
          </label>
          <div className="glass-soft mt-1.5 flex items-center gap-2.5 rounded-[10px] px-3 focus-within:border-gold/50">
            <Icon name="mail" size={17} className="shrink-0 text-faint" />
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-faint"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-password" className="text-[12px] font-medium text-content">
              Senha
            </label>
            <div className="glass-soft mt-1.5 flex items-center gap-2.5 rounded-[10px] px-3 focus-within:border-gold/50">
              <Icon name="lock" size={17} className="shrink-0 text-faint" />
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
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
          <div>
            <label htmlFor="confirm-password" className="text-[12px] font-medium text-content">
              Confirmar senha
            </label>
            <div className="glass-soft mt-1.5 flex items-center gap-2.5 rounded-[10px] px-3 focus-within:border-gold/50">
              <Icon name="lock" size={17} className="shrink-0 text-faint" />
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repita a senha"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="h-11 w-full min-w-0 bg-transparent text-[13px] outline-none placeholder:text-faint"
              />
            </div>
          </div>
        </div>

        <div aria-hidden={password.length === 0}>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((step) => (
              <span
                key={step}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step < score ? "bg-gold" : "bg-asset/[0.08]"
                }`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-faint">
            Força da senha: {password.length ? scoreLabels[score - 1] : "—"}
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-[12px] leading-relaxed text-muted">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
          />
          Li e aceito os termos de uso e a política de privacidade do Mister Money.
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-rose-400/10 px-3 py-2 text-[12px] text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="glow-button focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-[13px] font-semibold text-[#010122] transition-opacity disabled:opacity-70"
        >
          {loading ? "Criando conta..." : "Criar conta"}
          {!loading && <Icon name="arrowRight" size={16} />}
        </button>
      </form>

      <p className="mt-6 text-center text-[12px] text-muted">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-semibold text-gold-light hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
