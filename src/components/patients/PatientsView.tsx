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

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] text-[var(--color-ink)]">
            Patients
          </h1>
          <p className="mt-1 text-[14px] text-[var(--color-ink-faint)]">
            {patients.length} patient{patients.length === 1 ? "" : "s"} on file
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Add patient</Button>
      </div>

      <div className="relative max-w-xs">
        <input
          value={query}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search by name (e.g. John, Smth)..."
          className="w-full h-10 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[14px] text-[var(--color-ink)] outline-none focus:border-[var(--color-brand)]"
        />
        {isPending && (
          <div className="absolute right-3 top-3 h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
        )}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
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
              <tr className="border-b border-[var(--color-border)] text-[12px] text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Last treatment</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-sunken)]"
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/patients/${patient.id}`} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)] grid place-items-center text-[11px] font-medium">
                        {initials(patient.firstName, patient.lastName)}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[var(--color-ink)]">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-[12px] text-[var(--color-ink-faint)]">
                          {patient.birthDate ? formatDate(patient.birthDate) : "Birth date not recorded"}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/patients/${patient.id}`} className="text-[13.5px] text-[var(--color-ink)]">
                      {patient.lastTreatmentDate ? formatDate(patient.lastTreatmentDate) : "No treatments yet"}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {patient.hasActiveTreatment ? (
                      <ActiveBadge label="Active" />
                    ) : (
                      <span className="text-[12px] text-[var(--color-ink-faint)]">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        )}
      </div>

      <AddPatientModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

