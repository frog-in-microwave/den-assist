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

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    summary.activePatients.length > 0 ? summary.activePatients[0].id : null
  );

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

  // Color generator for patient avatar rings
  const avatarGradients = [
    "from-sky-500 to-teal-500 text-white shadow-sky-500/20",
    "from-indigo-500 to-purple-500 text-white shadow-indigo-500/20",
    "from-emerald-500 to-teal-600 text-white shadow-emerald-500/20",
    "from-cyan-500 to-blue-600 text-white shadow-cyan-500/20",
    "from-rose-500 to-amber-500 text-white shadow-rose-500/20",
  ];

  return (
    <div className="space-y-6">
      
      {/* Rich Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 p-6 sm:p-7 text-white shadow-xl shadow-sky-500/10 overflow-hidden">
        {/* Decorative Tooth Background Silhouette */}
        <div className="absolute right-4 -bottom-6 opacity-15 pointer-events-none w-56 h-56">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6 2 9.5.5 3.5 1.5 4.5 3 4.5s1.5-2 1-4.5c-.5-2.5 0-3.5 0-3.5s.5 1 0 3.5c-.5 2.5.5 4.5 1 4.5s2.5-1 3-4.5c.5-3.5 2-6.5 2-9.5 0-3.5-2.5-6-6-6z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-100 text-[13px] font-medium tracking-wide uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              Live Clinic Overview
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-[26px] sm:text-[30px] text-white mt-1">
              Active Dental Cases
            </h1>
            <p className="mt-1 text-[14px] text-sky-50/90 max-w-xl">
              Patients currently undergoing active treatment care requiring clinical attention.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 text-center">
              <p className="text-[11px] uppercase tracking-wider text-sky-100 font-medium">Active Cases</p>
              <p className="text-[22px] font-bold text-white leading-tight mt-0.5">{summary.activePatients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Active Patients & Treatments Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Patients with Fuzzy Search (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          <Card className="shadow-md shadow-slate-200/50 border-slate-200/80">
            <CardHeader
              title="Active Patients"
              subtitle="Select a patient to inspect their active care timeline"
              action={
                <Link href="/patients" className="text-[13px] text-sky-600 font-semibold hover:text-sky-700 hover:underline flex items-center gap-1">
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
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-[14px] text-slate-800 outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all"
                />
                {isPending && (
                  <div className="absolute right-3.5 top-3.5 h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                )}
              </div>
            </div>

            {summary.activePatients.length === 0 ? (
              <div className="p-8 text-center text-[14px] text-slate-500">
                {query ? (
                  <>No active patients match your search "<strong>{query}</strong>".</>
                ) : (
                  "No patients currently have active treatments."
                )}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {summary.activePatients.map((patient, index) => {
                  const isSelected = selectedPatient?.id === patient.id;
                  const gradientClass = avatarGradients[index % avatarGradients.length];

                  return (
                    <li
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`group cursor-pointer p-4 transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-sky-50/70 border-l-4 border-l-sky-600 shadow-sm"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr ${gradientClass} grid place-items-center text-[13px] font-bold shadow-md`}
                        >
                          {initials(patient.firstName, patient.lastName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold text-slate-800 truncate group-hover:text-sky-600 transition-colors">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-[12px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-500" />
                            {patient.activeTreatments.length} active treatment
                            {patient.activeTreatments.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <ActiveBadge label="Active Case" />

                        <Link
                          href={`/patients/${patient.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-sky-600 bg-white hover:bg-sky-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:border-sky-300 transition-all"
                        >
                          Profile
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
            <Card className="shadow-md shadow-slate-200/50 border-slate-200/80">
              <CardHeader
                title="Active Treatments"
                subtitle={`Ongoing procedures for ${selectedPatient.firstName} ${selectedPatient.lastName}`}
                action={
                  <Link
                    href={`/patients/${selectedPatient.id}`}
                    className="text-[13px] text-sky-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    Go to profile →
                  </Link>
                }
              />

              <div className="p-4 space-y-3.5">
                {selectedPatient.activeTreatments.length === 0 ? (
                  <div className="p-8 text-center text-[13.5px] text-slate-500">
                    No active treatments for this patient.
                  </div>
                ) : (
                  selectedPatient.activeTreatments.map((treatment) => {
                    const percentPaid = Math.min(
                      100,
                      Math.round((treatment.totalPayed / treatment.totalPayment) * 100)
                    );
                    const remainingDue = treatment.totalPayment - treatment.totalPayed;

                    return (
                      <Link
                        key={treatment.id}
                        href={`/treatments/${treatment.id}`}
                        className="block rounded-xl border border-slate-200 p-4 bg-white space-y-3 hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded-md bg-sky-50 text-sky-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6 2 9.5.5 3.5 1.5 4.5 3 4.5s1.5-2 1-4.5c-.5-2.5 0-3.5 0-3.5s.5 1 0 3.5c-.5 2.5.5 4.5 1 4.5s2.5-1 3-4.5c.5-3.5 2-6.5 2-9.5 0-3.5-2.5-6-6-6z" />
                                </svg>
                              </span>
                              <h4 className="text-[15px] font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                                {treatment.type}
                              </h4>
                            </div>
                            <p className="text-[13px] text-slate-500 mt-1">
                              {treatment.diagnosis}
                            </p>
                          </div>
                          <ActiveBadge label="Active" />
                        </div>

                        {treatment.notes && (
                          <p className="text-[12px] text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            "{treatment.notes}"
                          </p>
                        )}

                        {/* Payment Progress Bar */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-slate-500 font-medium">
                              Paid {formatCurrency(treatment.totalPayed)} of {formatCurrency(treatment.totalPayment)}
                            </span>
                            {remainingDue > 0 ? (
                              <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                                Due: {formatCurrency(remainingDue)}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                                Fully Paid ✓
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all rounded-full ${
                                percentPaid === 100 ? "bg-emerald-500" : "bg-sky-500"
                              }`}
                              style={{ width: `${percentPaid}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-[14px] text-slate-500">
              Select an active patient on the left to inspect their active treatments.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
