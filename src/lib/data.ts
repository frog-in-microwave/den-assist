import "server-only";

import prisma from "@/lib/prisma";

export type PatientWithStats = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  notes: string | null;
  lastTreatmentDate: string | null;
  totalPayment: number;
  totalPayed: number;
  balance: number;
  hasActiveTreatment: boolean;
  activeTreatmentsCount: number;
};

export type TreatmentRecord = {
  id: number;
  patientId: number;
  type: string;
  diagnosis: string;
  notes: string;
  date: string;
  totalPayment: number;
  totalPayed: number;
  isActive: boolean;
};

export type TreatmentWithPatient = TreatmentRecord & {
  patient: Pick<PatientWithStats, "id" | "firstName" | "lastName">;
};

const toIso = (date: Date | null) => date?.toISOString() ?? null;

function toTreatmentRecord(treatment: {
  id: number;
  patientId: number;
  type: string;
  diagnosis: string;
  notes: string;
  date: Date;
  totalPayment: number;
  totalPayed: number;
  isActive: boolean;
}): TreatmentRecord {
  return { ...treatment, date: treatment.date.toISOString() };
}

function toPatientWithStats(patient: {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  notes: string | null;
  treatments: { date: Date; totalPayment: number; totalPayed: number; isActive: boolean }[];
}): PatientWithStats {
  const totalPayment = patient.treatments.reduce((sum, treatment) => sum + treatment.totalPayment, 0);
  const totalPayed = patient.treatments.reduce((sum, treatment) => sum + treatment.totalPayed, 0);
  const lastTreatmentDate = patient.treatments.reduce<Date | null>(
    (latest, treatment) => (!latest || treatment.date > latest ? treatment.date : latest),
    null
  );
  const activeTreatmentsCount = patient.treatments.filter((t) => t.isActive).length;

  return {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    birthDate: toIso(patient.birthDate),
    notes: patient.notes,
    lastTreatmentDate: toIso(lastTreatmentDate),
    totalPayment,
    totalPayed,
    balance: totalPayment - totalPayed,
    activeTreatmentsCount,
    hasActiveTreatment: activeTreatmentsCount > 0,
  };
}


export async function getPatients(query?: string): Promise<PatientWithStats[]> {
  const q = query?.trim();
  if (!q) {
    const patients = await prisma.patient.findMany({
      include: { treatments: { select: { date: true, totalPayment: true, totalPayed: true, isActive: true } } },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
    return patients.map(toPatientWithStats);
  }

  // Ensure PostgreSQL pg_trgm extension is created on Supabase
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

  // Perform database-level fuzzy matching using similarity scores and ILIKE
  const matchedPatients: Array<{ id: number }> = await prisma.$queryRaw`
    SELECT p.id
    FROM "Patient" p
    WHERE 
       p."firstName" ILIKE ${'%' + q + '%'}
    OR p."lastName" ILIKE ${'%' + q + '%'}
    OR (p."firstName" || ' ' || p."lastName") ILIKE ${'%' + q + '%'}
    OR similarity(p."firstName" || ' ' || p."lastName", ${q}) > 0.15
    OR similarity(p."firstName", ${q}) > 0.15
    OR similarity(p."lastName", ${q}) > 0.15
    ORDER BY 
      CASE WHEN (p."firstName" || ' ' || p."lastName") ILIKE ${q + '%'} THEN 1 ELSE 2 END,
      GREATEST(
        similarity(p."firstName", ${q}),
        similarity(p."lastName", ${q}),
        similarity(p."firstName" || ' ' || p."lastName", ${q})
      ) DESC,
      p."lastName" ASC,
      p."firstName" ASC;
  `;

  if (matchedPatients.length === 0) return [];

  const patientIds = matchedPatients.map((p) => p.id);

  // Retrieve patient entities along with treatment stats
  const patients = await prisma.patient.findMany({
    where: { id: { in: patientIds } },
    include: { treatments: { select: { date: true, totalPayment: true, totalPayed: true, isActive: true } } },
  });

  // Preserve the database relevance sorting order
  const patientMap = new Map(patients.map((p) => [p.id, p]));
  const orderedPatients = patientIds
    .map((id) => patientMap.get(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return orderedPatients.map(toPatientWithStats);
}

export async function getPatient(id: number): Promise<PatientWithStats | null> {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { treatments: { select: { date: true, totalPayment: true, totalPayed: true, isActive: true } } },
  });
  return patient ? toPatientWithStats(patient) : null;
}

export async function getTreatmentsForPatient(patientId: number): Promise<TreatmentRecord[]> {
  const treatments = await prisma.treatment.findMany({ where: { patientId }, orderBy: { date: "desc" } });
  return treatments.map(toTreatmentRecord);
}

export async function getAllTreatments(): Promise<TreatmentWithPatient[]> {
  const treatments = await prisma.treatment.findMany({
    include: { patient: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { date: "desc" },
  });
  return treatments.map((treatment) => ({ ...toTreatmentRecord(treatment), patient: treatment.patient }));
}

export async function getTreatment(id: number): Promise<TreatmentWithPatient | null> {
  const treatment = await prisma.treatment.findUnique({
    where: { id },
    include: { patient: { select: { id: true, firstName: true, lastName: true } } },
  });
  return treatment ? { ...toTreatmentRecord(treatment), patient: treatment.patient } : null;
}

export type ActivePatientSummary = PatientWithStats & {
  activeTreatments: TreatmentRecord[];
};

export async function getDashboardSummary(query?: string) {
  const q = query?.trim();
  let activePatientsRaw;

  if (!q) {
    activePatientsRaw = await prisma.patient.findMany({
      where: {
        treatments: {
          some: { isActive: true },
        },
      },
      include: {
        treatments: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  } else {
    // Ensure PostgreSQL pg_trgm extension exists on database
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    // Database-level fuzzy search for active patients
    const matchedPatients: Array<{ id: number }> = await prisma.$queryRaw`
      SELECT p.id
      FROM "Patient" p
      JOIN "Treatment" t ON t."patientId" = p.id
      WHERE t."isActive" = true
        AND (
             p."firstName" ILIKE ${'%' + q + '%'}
          OR p."lastName" ILIKE ${'%' + q + '%'}
          OR (p."firstName" || ' ' || p."lastName") ILIKE ${'%' + q + '%'}
          OR similarity(p."firstName" || ' ' || p."lastName", ${q}) > 0.15
          OR similarity(p."firstName", ${q}) > 0.15
          OR similarity(p."lastName", ${q}) > 0.15
        )
      GROUP BY p.id, p."firstName", p."lastName"
      ORDER BY 
        CASE WHEN (p."firstName" || ' ' || p."lastName") ILIKE ${q + '%'} THEN 1 ELSE 2 END,
        GREATEST(
          similarity(p."firstName", ${q}),
          similarity(p."lastName", ${q}),
          similarity(p."firstName" || ' ' || p."lastName", ${q})
        ) DESC,
        p."lastName" ASC,
        p."firstName" ASC;
    `;

    const patientIds = matchedPatients.map((p) => p.id);

    if (patientIds.length === 0) {
      return { activePatients: [] };
    }

    const fetched = await prisma.patient.findMany({
      where: { id: { in: patientIds } },
      include: {
        treatments: {
          orderBy: { date: "desc" },
        },
      },
    });

    const patientMap = new Map(fetched.map((p) => [p.id, p]));
    activePatientsRaw = patientIds
      .map((id) => patientMap.get(id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }

  const activePatients: ActivePatientSummary[] = activePatientsRaw.map((patient) => {
    const stats = toPatientWithStats(patient);
    const activeTreatments = patient.treatments
      .filter((t) => t.isActive)
      .map(toTreatmentRecord);
    return {
      ...stats,
      activeTreatments,
    };
  });

  return {
    activePatients,
  };
}


