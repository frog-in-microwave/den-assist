"use client";

import Link from "next/link";
import { useState } from "react";
import type { ActivePatientSummary, Treatment } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { ActiveBadge } from "@/components/ui/Badge";
import { formatDate, formatCurrency, initials } from "@/lib/format";

export function DashboardView({
  summary,
}: {
  summary: {
    activePatients: ActivePatientSummary[];
    totalActivePatients: number;
    totalActiveTreatments: number;
    totalPatients: number;
    totalTreatments: number;
  };
}) {
  // Default to selecting the first active patient if available
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    summary.activePatients.length > 0 ? summary.activePatients[0].id : null
  );

  const selectedPatient = summary.activePatients.find((p) => p.id === selectedPatientId) ?? summary.activePatients[0] ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] text-[var(--color-ink)]">
          Clinic Overview
        </h1>
        <p className="mt-1 text-[14px] text-[var(--color-ink-faint)]">
          Active patient cases and ongoing treatments requiring care.
        </p>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Active Patients" value={String(summary.totalActivePatients)} badge="Live" />
        <SummaryCard label="Active Treatments" value={String(summary.totalActiveTreatments)} badge="Ongoing" />
        <SummaryCard label="Total Patients" value={String(summary.totalPatients)} subtext="All time on file" />
        <SummaryCard label="Total Treatments" value={String(summary.totalTreatments)} subtext="All recorded care" />
      </div>

      {/* Main Interactive Active Patients & Treatments Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Active Patients (7 cols) */}
        <div className="xl:col-span-7">
          <Card>
            <CardHeader
              title="Active Patients"
              subtitle="Select a patient row to view their active treatments"
              action={
                <Link href="/patients" className="text-[13px] text-[var(--color-brand)] font-medium hover:underline">
                  View all patients →
                </Link>
              }
            />

            {summary.activePatients.length === 0 ? (
              <div className="p-8 text-center text-[14px] text-[var(--color-ink-faint)]">
                No patients currently have active treatments.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {summary.activePatients.map((patient) => {
                  const isSelected = selectedPatient?.id === patient.id;
                  return (
                    <li
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`group cursor-pointer p-4 transition-colors flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-[var(--color-brand-soft)]/60 border-l-4 border-l-[var(--color-brand)]"
                          : "hover:bg-[var(--color-surface-sunken)]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)] grid place-items-center text-[12px] font-semibold">
                          {initials(patient.firstName, patient.lastName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14.5px] font-medium text-[var(--color-ink)] truncate">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-[12px] text-[var(--color-ink-faint)]">
                            {patient.activeTreatments.length} active treatment
                            {patient.activeTreatments.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Active Flag Badge */}
                        <ActiveBadge label="Active" />

                        {/* Go to Patient Profile Link */}
                        <Link
                          href={`/patients/${patient.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--color-brand)] bg-[var(--color-surface)] hover:bg-[var(--color-brand-soft)] px-2.5 py-1 rounded-md border border-[var(--color-border-strong)] transition-colors"
                        >
                          Go to patient
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M7.21 14.77a.75.75 0 01.02-1.06L11.16 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        {/* Right Column: Active Treatments of Selected Patient (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          {selectedPatient ? (
            <Card>
              <CardHeader
                title={`Active Treatments`}
                subtitle={`Showing ongoing care for ${selectedPatient.firstName} ${selectedPatient.lastName}`}
                action={
                  <Link
                    href={`/patients/${selectedPatient.id}`}
                    className="text-[13px] text-[var(--color-brand)] font-medium hover:underline"
                  >
                    Go to patient →
                  </Link>
                }
              />

              <div className="p-4 space-y-3">
                {selectedPatient.activeTreatments.length === 0 ? (
                  <div className="p-6 text-center text-[13.5px] text-[var(--color-ink-faint)]">
                    No active treatments for this patient.
                  </div>
                ) : (
                  selectedPatient.activeTreatments.map((treatment) => (
                    <div
                      key={treatment.id}
                      className="rounded-lg border border-[var(--color-border)] p-4 bg-[var(--color-surface)] space-y-3 hover:border-[var(--color-border-strong)] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-[14.5px] font-medium text-[var(--color-ink)]">
                            {treatment.type}
                          </h4>
                          <p className="text-[12.5px] text-[var(--color-ink-muted)] mt-0.5">
                            {treatment.diagnosis}
                          </p>
                        </div>
                        {/* Active Flag Badge on the right */}
                        <ActiveBadge label="Active" />
                      </div>

                      {treatment.notes && (
                        <p className="text-[12px] text-[var(--color-ink-faint)] italic bg-[var(--color-surface-sunken)] p-2 rounded">
                          "{treatment.notes}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-[12px]">
                        <span className="text-[var(--color-ink-faint)]">
                          Date: {formatDate(treatment.date)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[var(--color-ink)]">
                            {formatCurrency(treatment.totalPayment)}
                          </span>
                          {treatment.totalPayed < treatment.totalPayment ? (
                            <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded text-[11px] font-medium">
                              Due: {formatCurrency(treatment.totalPayment - treatment.totalPayed)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[11px] font-medium">
                              Paid ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-[14px] text-[var(--color-ink-faint)]">
              Select an active patient on the left to inspect their treatments.
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  badge,
  subtext,
}: {
  label: string;
  value: string;
  badge?: string;
  subtext?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[var(--color-ink-faint)]">{label}</p>
        {badge && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 font-[family-name:var(--font-mono)] tabular text-[28px] font-medium text-[var(--color-ink)]">
        {value}
      </p>
      {subtext && <p className="mt-1 text-[11.5px] text-[var(--color-ink-faint)]">{subtext}</p>}
    </Card>
  );
}
