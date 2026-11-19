import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard";
import { DashboardLoading } from "@/components/dashboard-loading";
import { buscarDashboard } from "@/lib/dashboard-api";

async function ConteudoDashboard() {
  const payload = await buscarDashboard();
  return <Dashboard data={payload.data} origem={payload.origem} />;
}

export default function Home() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <ConteudoDashboard />
    </Suspense>
  );
}
