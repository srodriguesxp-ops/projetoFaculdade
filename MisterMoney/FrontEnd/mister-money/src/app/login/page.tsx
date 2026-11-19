import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Entrar | Mister Money",
  description: "Acesse sua conta Mister Money.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Seu dinheiro, com clareza."
      subtitle="Acompanhe contas, cartões e investimentos em um painel feito para decisões melhores."
    >
      <LoginForm />
    </AuthShell>
  );
}
