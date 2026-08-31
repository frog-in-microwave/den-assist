import { notFound } from "next/navigation";
import { getPatient, getTreatmentsForPatient } from "@/lib/data";
import { PatientProfileView } from "@/components/patients/PatientProfileView";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patientId = Number(id);
  if (!Number.isInteger(patientId) || patientId < 1) notFound();
  const patient = await getPatient(patientId);
  if (!patient) notFound();

  const treatments = await getTreatmentsForPatient(patientId);

  return <PatientProfileView patient={patient} treatments={treatments} />;
}
