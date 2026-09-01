"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import type { ActionResult, NewPatientInput, UpdatePatientInput, NewTreatmentInput, UpdateTreatmentInput } from "@/lib/types";
import { createAuthToken, setAuthCookie, removeAuthCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit";

export async function loginAction(usernameInput: string, passwordInput: string): Promise<ActionResult> {
  try {
    const clientIp = await getClientIp();
    const rateCheck = checkRateLimit(clientIp, 5, 15 * 60 * 1000);

    if (!rateCheck.allowed) {
      return {
        ok: false,
        error: `Too many failed login attempts from your IP. Please try again in ${rateCheck.retryAfterMinutes} minute(s).`,
      };
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error("ADMIN_USERNAME or ADMIN_PASSWORD environment variables are missing.");
      return { ok: false, error: "Server misconfiguration. Cannot process login." };
    }

    const username = usernameInput?.trim();
    const password = passwordInput?.trim();

    if (!username || !password) {
      return { ok: false, error: "Username and password are required." };
    }

    if (username.toLowerCase() !== adminUsername.toLowerCase() || password !== adminPassword) {
      const remainingMsg =
        rateCheck.remainingAttempts > 0
          ? ` (${rateCheck.remainingAttempts} attempt(s) remaining)`
          : "";
      return { ok: false, error: `Invalid username or password.${remainingMsg}` };
    }

    // Reset rate limit store upon successful login
    resetRateLimit(clientIp);

    const token = await createAuthToken(username);
    await setAuthCookie(token);

    try { revalidatePath("/"); } catch {}
    return { ok: true };
  } catch (err: any) {
    console.error("Error in loginAction:", err);
    return { ok: false, error: err?.message || "Failed to log in." };
  }
}


export async function logoutAction(): Promise<ActionResult> {
  try {
    await removeAuthCookie();
    try { revalidatePath("/"); } catch {}
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to log out." };
  }
}


export async function createPatientAction(input: NewPatientInput): Promise<{ ok: true; id: number } | { ok: false; error: string }> {
  try {
    if (!input.firstName.trim() || !input.lastName.trim()) return { ok: false, error: "First and last name are required." };

    const patient = await prisma.patient.create({
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        birthDate: input.birthDate ? new Date(`${input.birthDate}T00:00:00.000Z`) : null,
        notes: input.notes?.trim() || null,
      },
    });
    try { revalidatePath("/"); } catch {}
    try { revalidatePath("/patients"); } catch {}
    return { ok: true, id: patient.id };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to create patient." };
  }
}

export async function updatePatientAction(input: UpdatePatientInput): Promise<ActionResult> {
  try {
    const id = Number(input.id);
    if (!Number.isInteger(id) || id < 1) return { ok: false, error: "Patient not found." };
    if (!input.firstName.trim() || !input.lastName.trim()) return { ok: false, error: "First and last name are required." };

    await prisma.patient.update({
      where: { id },
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        birthDate: input.birthDate ? new Date(`${input.birthDate}T00:00:00.000Z`) : null,
        notes: input.notes?.trim() || null,
      },
    });

    try { revalidatePath("/"); } catch {}
    try { revalidatePath("/patients"); } catch {}
    try { revalidatePath(`/patients/${id}`); } catch {}
    return { ok: true };
  } catch (err: any) {
    console.error("Error in updatePatientAction:", err);
    return { ok: false, error: err?.message || "Failed to update patient." };
  }
}


export async function createTreatmentAction(input: NewTreatmentInput): Promise<ActionResult> {
  try {
    if (!Number.isInteger(input.patientId) || input.patientId < 1) return { ok: false, error: "Patient not found." };
    if (!input.type.trim() || !input.diagnosis.trim()) return { ok: false, error: "Treatment type and diagnosis are required." };
    if (!input.date || Number.isNaN(new Date(input.date).getTime())) return { ok: false, error: "Select a valid date." };
    if (!Number.isFinite(input.totalPayment) || input.totalPayment < 0) return { ok: false, error: "Enter a valid total amount." };
    if (!Number.isFinite(input.totalPayed) || input.totalPayed < 0) return { ok: false, error: "Enter a valid amount paid." };
    if (input.totalPayed > input.totalPayment) return { ok: false, error: "Amount paid can't exceed the total amount." };

    await prisma.treatment.create({
      data: {
        patientId: input.patientId,
        type: input.type.trim(),
        diagnosis: input.diagnosis.trim(),
        notes: input.notes?.trim() || "",
        date: new Date(`${input.date}T00:00:00.000Z`),
        totalPayment: input.totalPayment,
        totalPayed: input.totalPayed,
        isActive: input.isActive ?? true,
      },
    });
    try { revalidatePath("/"); } catch {}
    try { revalidatePath("/patients"); } catch {}
    try { revalidatePath(`/patients/${input.patientId}`); } catch {}
    try { revalidatePath("/treatments"); } catch {}
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to create treatment." };
  }
}

export async function updateTreatmentAction(input: UpdateTreatmentInput): Promise<ActionResult> {
  try {
    const id = Number(input.id);
    if (!Number.isInteger(id) || id < 1) return { ok: false, error: "Treatment not found." };
    if (!input.type.trim() || !input.diagnosis.trim()) return { ok: false, error: "Treatment type and diagnosis are required." };
    if (!input.date || Number.isNaN(new Date(input.date).getTime())) return { ok: false, error: "Select a valid date." };
    if (!Number.isFinite(input.totalPayment) || input.totalPayment < 0) return { ok: false, error: "Enter a valid total amount." };
    const existing = await prisma.treatment.findUnique({ where: { id }, select: { patientId: true, totalPayed: true } });
    if (!existing) return { ok: false, error: "Treatment not found." };
    if (input.totalPayment < existing.totalPayed) return { ok: false, error: "The total amount cannot be lower than the amount already paid." };
    
    await prisma.treatment.update({
      where: { id },
      data: {
        type: input.type.trim(),
        diagnosis: input.diagnosis.trim(),
        notes: input.notes?.trim() || "",
        date: new Date(`${input.date}T00:00:00.000Z`),
        totalPayment: input.totalPayment,
        ...(typeof input.isActive === "boolean" ? { isActive: input.isActive } : {}),
      },
    });
    revalidateTreatmentPaths(id, existing.patientId);
    return { ok: true };
  } catch (err: any) {
    console.error("Error in updateTreatmentAction:", err);
    return { ok: false, error: err?.message || "Failed to update treatment." };
  }
}

export async function toggleTreatmentActiveAction(treatmentId: number, isActive: boolean): Promise<ActionResult> {
  try {
    const id = Number(treatmentId);
    if (!Number.isInteger(id) || id < 1) return { ok: false, error: "Treatment not found." };
    const treatment = await prisma.treatment.findUnique({ where: { id }, select: { patientId: true } });
    if (!treatment) return { ok: false, error: "Treatment not found." };
    
    await prisma.treatment.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });
    
    revalidateTreatmentPaths(id, treatment.patientId);
    return { ok: true };
  } catch (err: any) {
    console.error("Error in toggleTreatmentActiveAction:", err);
    return { ok: false, error: err?.message || "Failed to update treatment active status." };
  }
}

export async function addPaymentAction(treatmentId: number, amount: number): Promise<ActionResult> {
  try {
    const id = Number(treatmentId);
    if (!Number.isInteger(id) || id < 1 || !Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter a valid payment amount." };
    const treatment = await prisma.treatment.findUnique({ where: { id }, select: { patientId: true, totalPayment: true, totalPayed: true } });
    if (!treatment) return { ok: false, error: "Treatment not found." };
    if (treatment.totalPayed + amount > treatment.totalPayment) return { ok: false, error: "This payment is greater than the remaining amount." };
    const updated = await prisma.treatment.updateMany({
      where: { id, totalPayed: treatment.totalPayed },
      data: { totalPayed: { increment: amount } },
    });
    if (updated.count !== 1) return { ok: false, error: "The treatment was changed by someone else. Refresh and try again." };
    revalidateTreatmentPaths(id, treatment.patientId);
    return { ok: true };
  } catch (err: any) {
    console.error("Error in addPaymentAction:", err);
    return { ok: false, error: err?.message || "Failed to record payment." };
  }
}

function revalidateTreatmentPaths(treatmentId: number, patientId: number) {
  try { revalidatePath("/"); } catch {}
  try { revalidatePath("/patients"); } catch {}
  try { revalidatePath(`/patients/${patientId}`); } catch {}
  try { revalidatePath("/treatments"); } catch {}
  try { revalidatePath(`/treatments/${treatmentId}`); } catch {}
}



