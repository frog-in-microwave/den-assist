"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { ActivePatientSummary } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { ActiveBadge } from "@/components/ui/Badge";
import { formatDate, formatCurrency, initials } from "@/lib/format";

export function DashboardView({
  summary,
  initialQuery = "",
}: {
  summary: {
    activePatients: ActivePatientSummary[];
  };
  initialQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);

  // Maintain selected active patient state
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    summary.activePatients.length > 0 ? summary.activePatients[0].id : null
  );

  // Sync selected patient if query or summary list changes
  const selectedPatient =
    summary.activePatients.find((p) => p.id === selectedPatientId) ??
    summary.activePatients[0] ??
    null;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    startTransition(() => {
      const params = new URLSearchParams();
      if (value.trim()) {
        params.set("query", value);
      } else {
        params.delete("query");
      }
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] text-[var(--color-ink)]">
          Active Clinic Cases
        </h1>
        <p className="mt-1 text-[14px] text-[var(--color-ink-faint)]">
          Ongoing treatments and active patient care requiring attention.
        </p>
      </div>

      {/* Main Interactive Active Patients & Treatments Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Patients with Fuzzy Search (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          <Card>
            <CardHeader
              title="Active Patients"
              subtitle="Select a patient to view their active treatments"
              action={
                <Link href="/patients" className="text-[13px] text-[var(--color-brand)] font-medium hover:underline">
                  View all patients →
                </Link>
              }
            />

            {/* Active Patients Fuzzy Search Input */}
            <div className="px-5 pb-3">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search active patients..."
                  className="w-full h-10 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[14px] text-[var(--color-ink)] outline-none focus:border-[var(--color-brand)]"
                />
                {isPending && (
                  <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
                )}
              </div>
            </div>

            {summary.activePatients.length === 0 ? (
              <div className="p-8 text-center text-[14px] text-[var(--color-ink-faint)]">
                {query ? (
                  <>No active patients match your search "<strong>{query}</strong>".</>
                ) : (
                  "No patients currently have active treatments."
                )}
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
                title="Active Treatments"
                subtitle={`Ongoing care for ${selectedPatient.firstName} ${selectedPatient.lastName}`}
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
                    <Link
                      key={treatment.id}
                      href={`/treatments/${treatment.id}`}
                      className="block rounded-lg border border-[var(--color-border)] p-4 bg-[var(--color-surface)] space-y-3 hover:border-[var(--color-brand)] hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-[14.5px] font-medium text-[var(--color-ink)] group-hover:text-[var(--color-brand)] transition-colors">
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
                    </Link>
                  ))

                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-[14px] text-[var(--color-ink-faint)]">
              Select an active patient on the left to inspect their active treatments.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
