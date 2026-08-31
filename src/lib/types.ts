export type { PatientWithStats, TreatmentRecord as Treatment, TreatmentWithPatient, ActivePatientSummary } from "@/lib/data";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type NewPatientInput = { firstName: string; lastName: string; birthDate?: string; notes?: string };
export type NewTreatmentInput = { patientId: number; type: string; diagnosis: string; notes?: string; date: string; totalPayment: number; totalPayed: number; isActive?: boolean };
export type UpdateTreatmentInput = Omit<NewTreatmentInput, "patientId" | "totalPayed"> & { id: number; isActive?: boolean };


