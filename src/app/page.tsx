import { getDashboardSummary } from "@/lib/data";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const summary = await getDashboardSummary(query);
  return <DashboardView summary={summary} initialQuery={query ?? ""} />;
}


