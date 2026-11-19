export function FinanceiroLoading({
  titulo = "Carregando dados...",
}: {
  titulo?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg text-content">
      <div className="text-center" role="status" aria-live="polite">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-asset/15 border-t-gold" />
        <p className="mt-3 text-[12px] text-muted">{titulo}</p>
      </div>
    </div>
  );
}
