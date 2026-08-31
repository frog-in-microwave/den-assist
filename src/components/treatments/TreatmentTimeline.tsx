import type { Treatment } from "@/lib/types";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActiveBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";

export function TreatmentTimeline({ treatments }: { treatments: Treatment[] }) {
  if (!treatments.length)
    return <EmptyState title="No treatments yet" description="Treatments added for this patient will appear here." />;

  return (
    <ol className="relative">
      {treatments.map((treatment, index) => (
        <li key={treatment.id} className="relative pl-8 pb-7 last:pb-0">
          {index !== treatments.length - 1 && (
            <span className="absolute left-[9px] top-4 bottom-0 w-px bg-[var(--color-border)]" />
          )}
          <span className="absolute left-0 top-1 h-[19px] w-[19px] rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-brand-soft)] ring-1 ring-[var(--color-border)] grid place-items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]" />
          </span>

          <Link href={`/treatments/${treatment.id}`} className="block group rounded hover:opacity-90">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14.5px] font-medium text-[var(--color-ink)] group-hover:text-[var(--color-brand)]">
                  {treatment.type}
                </p>
                <p className="text-[13px] text-[var(--color-ink-faint)]">{formatDate(treatment.date)}</p>
              </div>

              {/* Active Flag Badge on the right */}
              <ActiveBadge label="Active" active={treatment.isActive} />
            </div>

            <p className="mt-2 text-[13.5px] text-[var(--color-ink-muted)]">{treatment.diagnosis}</p>
            {treatment.notes && <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">{treatment.notes}</p>}
          </Link>
        </li>
      ))}
    </ol>
  );
}

