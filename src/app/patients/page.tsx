import { getPatients } from "@/lib/data";
import { PatientsView } from "@/components/patients/PatientsView";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const patients = await getPatients(query);
  return <PatientsView patients={patients} initialQuery={query ?? ""} />;
}

