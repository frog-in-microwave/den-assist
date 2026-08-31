import { getDashboardSummary } from "@/lib/data";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  return <DashboardView summary={summary} />;
}

