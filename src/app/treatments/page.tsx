import Link from "next/link";
import { getAllTreatments } from "@/lib/data";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActiveBadge } from "@/components/ui/Badge";
import { formatDate, initials } from "@/lib/format";

export default async function TreatmentsPage() {
  const treatments = await getAllTreatments();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-[26px] text-[var(--color-ink)]">
          Treatments
        </h1>
        <p className="mt-1 text-[14px] text-[var(--color-ink-faint)]">
          Every procedure logged across the clinic, most recent first.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        {treatments.length === 0 ? (
          <EmptyState
            title="No treatments logged"
            description="Treatments are added from a patient's profile page."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[12px] text-[var(--color-ink-faint)]">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Treatment</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-sunken)]">
                    <td className="px-5 py-3.5">
                      <Link href={`/patients/${t.patientId}`} className="flex items-center gap-2.5">
                        <div className="h-7 w-7 shrink-0 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)] grid place-items-center text-[10.5px] font-medium">
                          {initials(t.patient.firstName, t.patient.lastName)}
                        </div>
                        <span className="text-[13.5px] text-[var(--color-ink)]">
                          {t.patient.firstName} {t.patient.lastName}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/treatments/${t.id}`} className="block rounded hover:text-[var(--color-brand)]">
                        <p className="text-[13.5px] text-[var(--color-ink)]">{t.type}</p>
                        <p className="text-[12px] text-[var(--color-ink-faint)] truncate max-w-[220px]">{t.diagnosis}</p>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] text-[var(--color-ink-muted)]">{formatDate(t.date)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <ActiveBadge label="Active" active={t.isActive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        )}
      </div>
    </div>
  );
}
