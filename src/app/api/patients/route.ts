import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() { return NextResponse.json(await prisma.patient.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] })); }
export async function POST(request: Request) {
  const body = await request.json();
  if (typeof body.firstName !== "string" || !body.firstName.trim() || typeof body.lastName !== "string" || !body.lastName.trim()) return NextResponse.json({ message: "First and last name are required." }, { status: 400 });
  const patient = await prisma.patient.create({ data: { firstName: body.firstName.trim(), lastName: body.lastName.trim(), birthDate: typeof body.birthDate === "string" && body.birthDate ? new Date(`${body.birthDate}T00:00:00.000Z`) : null, notes: typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null } });
  return NextResponse.json(patient, { status: 201 });
}
