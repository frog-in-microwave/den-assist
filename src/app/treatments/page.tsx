import { getAllTreatments } from "@/lib/data";
import { TreatmentsView } from "@/components/treatments/TreatmentsView";

export default async function TreatmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const treatments = await getAllTreatments(query);
  return <TreatmentsView treatments={treatments} initialQuery={query ?? ""} />;
}

