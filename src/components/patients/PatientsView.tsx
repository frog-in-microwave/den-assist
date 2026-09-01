"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { PatientWithStats } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ActiveBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AddPatientModal } from "@/components/patients/AddPatientModal";
import { formatDate, initials } from "@/lib/format";

export function PatientsView({
  patients,
  initialQuery = "",
}: {
  patients: PatientWithStats[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [modalOpen, setModalOpen] = useState(false);

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

  const avatarGradients = [
    "from-sky-500 to-teal-500 text-white shadow-sky-500/20",
    "from-indigo-500 to-purple-500 text-white shadow-indigo-500/20",
    "from-emerald-500 to-teal-600 text-white shadow-emerald-500/20",
    "from-cyan-500 to-blue-600 text-white shadow-cyan-500/20",
    "from-rose-500 to-amber-500 text-white shadow-rose-500/20",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[28px] text-slate-900">
            Patients Directory
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            {patients.length} patient record{patients.length === 1 ? "" : "s"} stored on database
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white shadow-md shadow-sky-600/20"
        >
          + Add new patient
        </Button>
      </div>

      <div className="relative max-w-sm">
        <input
          value={query}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search by name..."
          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-slate-800 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 shadow-sm transition-all"
        />
        {isPending && (
          <div className="absolute right-3.5 top-3.5 h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 overflow-hidden">
        {patients.length === 0 ? (
          <EmptyState
            title={query ? "No matching patients" : "No patients yet"}
            description={
              query
                ? `No database records found matching "${query}".`
                : "Add your first patient to get started."
            }
            action={!query ? <Button onClick={() => setModalOpen(true)}>Add patient</Button> : undefined}
          />
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[12.5px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Patient Name</th>
                <th className="px-6 py-3.5">Last Care Visit</th>
                <th className="px-6 py-3.5 text-right">Active Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((patient, index) => {
                const gradientClass = avatarGradients[index % avatarGradients.length];
                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/90 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/patients/${patient.id}`} className="flex items-center gap-3.5">
                        <div
                          className={`h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr ${gradientClass} grid place-items-center text-[13px] font-bold shadow-md`}
                        >
                          {initials(patient.firstName, patient.lastName)}
                        </div>
                        <div>
                          <p className="text-[14.5px] font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-[12px] text-slate-400">
                            {patient.birthDate ? formatDate(patient.birthDate) : "Birth date not recorded"}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/patients/${patient.id}`} className="text-[13.5px] text-slate-700 font-medium">
                        {patient.lastTreatmentDate ? formatDate(patient.lastTreatmentDate) : "No treatments yet"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {patient.hasActiveTreatment ? (
                        <ActiveBadge label="Active Case" />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-medium border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AddPatientModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
