import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";

export const metadata = {
  title: "Criar conta | Mister Money",
  description: "Crie sua conta Mister Money.",
};

export default function CadastroPage() {
  return (
    <AuthShell
      title="Comece a organizar hoje."
      subtitle="Crie sua conta e tenha uma visão completa do que entra e do que sai do seu bolso."
    >
      <RegisterForm />
    </AuthShell>
  );
}
