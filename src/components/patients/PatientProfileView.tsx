"use client";

import Link from "next/link";
import { useState } from "react";
import type { PatientWithStats, Treatment } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ActiveBadge } from "@/components/ui/Badge";
import { TreatmentTimeline } from "@/components/treatments/TreatmentTimeline";
import { TreatmentForm } from "@/components/treatments/TreatmentForm";
import { EditPatientModal } from "@/components/patients/EditPatientModal";
import { age, formatCurrency, formatDate, initials } from "@/lib/format";

export function PatientProfileView({
  patient,
  treatments,
}: {
  patient: PatientWithStats;
  treatments: Treatment[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const totalBilled = treatments.reduce((acc, t) => acc + t.totalPayment, 0);
  const totalPaid = treatments.reduce((acc, t) => acc + t.totalPayed, 0);
  const remainingDue = totalBilled - totalPaid;

  const birthDateText = patient.birthDate
    ? `${age(patient.birthDate)} yrs · Born ${formatDate(patient.birthDate)}`
    : "Birth date not recorded";

  return (
    <div className="space-y-6">
      <Link 
        href="/patients" 
        className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:text-sky-600 hover:border-sky-200 w-fit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Patients Directory
      </Link>

      {/* Patient Hero Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-7 shadow-md shadow-slate-200/50 space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-full bg-gradient-to-tr from-sky-500 via-teal-500 to-emerald-400 text-white grid place-items-center text-[18px] sm:text-[22px] font-bold shadow-lg shadow-sky-500/20">
              {initials(patient.firstName, patient.lastName)}
              {patient.hasActiveTreatment && (
                <span className="absolute 0 top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="font-[family-name:var(--font-display)] text-[22px] sm:text-[30px] text-slate-900 leading-tight">
                  {patient.firstName} {patient.lastName}
                </h1>
                <div className="hidden sm:block">
                  {patient.hasActiveTreatment ? (
                    <ActiveBadge label="Active Case" />
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold border border-slate-200">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-[14px] text-slate-500">{birthDateText}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              variant="secondary"
              onClick={() => setEditOpen(true)}
              className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm px-3 sm:px-4"
            >
              Edit profile
            </Button>
            <Button
              onClick={() => setFormOpen(true)}
              className="flex-1 sm:flex-none bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white shadow-md shadow-sky-600/20 px-3 sm:px-4"
            >
              + Treatment
            </Button>
          </div>
        </div>

        {/* Patient Financial & Procedure Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-4 border-t border-slate-100">
          <StatChip label="Total Procedures" value={String(treatments.length)} />
          <StatChip label="Total Billed" value={formatCurrency(totalBilled)} />
          <StatChip label="Total Paid" value={formatCurrency(totalPaid)} color="text-emerald-600" />
          <StatChip
            label="Remaining Due"
            value={formatCurrency(remainingDue)}
            color={remainingDue > 0 ? "text-amber-600" : "text-slate-700"}
          />
        </div>
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Patient Metadata */}
        <Card className="shadow-md shadow-slate-200/50 border-slate-200/80 h-fit">
          <CardHeader
            title="Patient Information"
            action={
              <button
                onClick={() => setEditOpen(true)}
                className="text-[12.5px] text-sky-600 font-semibold hover:underline"
              >
                Edit
              </button>
            }
          />
          <dl className="px-5 pb-5 space-y-4">
            <Row label="Date of birth" value={patient.birthDate ? formatDate(patient.birthDate) : "—"} />
            <Row label="Medical & General Notes" value={patient.notes || "No notes recorded on file."} />
          </dl>
        </Card>

        {/* Right Col: Treatment History Timeline */}
        <Card className="lg:col-span-2 shadow-md shadow-slate-200/50 border-slate-200/80">
          <CardHeader
            title="Treatment History"
            subtitle={`${treatments.length} logged procedure${treatments.length === 1 ? "" : "s"}`}
          />
          <div className="px-5 pb-5">
            <TreatmentTimeline treatments={treatments} />
          </div>
        </Card>
      </div>

      <TreatmentForm open={formOpen} onClose={() => setFormOpen(false)} patientId={patient.id} />
      <EditPatientModal open={editOpen} onClose={() => setEditOpen(false)} patient={patient} />
    </div>
  );
}

function StatChip({ label, value, color = "text-slate-800" }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-[17px] font-bold mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-[14px] font-medium text-slate-800 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
        {value}
      </dd>
    </div>
  );
}
