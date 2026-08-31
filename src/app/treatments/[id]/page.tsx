import { notFound } from "next/navigation";
import { TreatmentDetailView } from "@/components/treatments/TreatmentDetailView";
import { getTreatment } from "@/lib/data";

export default async function TreatmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const treatmentId = Number(id);
  if (!Number.isInteger(treatmentId) || treatmentId < 1) notFound();
  const treatment = await getTreatment(treatmentId);
  if (!treatment) notFound();
  return <TreatmentDetailView treatment={treatment} />;
}
