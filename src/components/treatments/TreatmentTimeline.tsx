import type { Treatment } from "@/lib/types";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActiveBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/format";

export function TreatmentTimeline({ treatments }: { treatments: Treatment[] }) {
  if (!treatments.length)
    return <EmptyState title="No treatments yet" description="Treatments added for this patient will appear here." />;

  return (
    <ol className="relative space-y-6 pt-2">
      {treatments.map((treatment, index) => {
        const percentPaid = Math.min(
          100,
          Math.round((treatment.totalPayed / treatment.totalPayment) * 100)
        );
        const remaining = treatment.totalPayment - treatment.totalPayed;

        return (
          <li key={treatment.id} className="relative pl-9 pb-2 last:pb-0">
            {/* Timeline Vertical Bar */}
            {index !== treatments.length - 1 && (
              <span className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-slate-200" />
            )}

            {/* Timeline Tooth Icon Node */}
            <span
              className={`absolute left-0 top-1 h-7 w-7 rounded-full border-2 border-white grid place-items-center shadow-md ${
                treatment.isActive
                  ? "bg-gradient-to-tr from-sky-500 to-teal-500 text-white ring-4 ring-sky-500/10"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6 2 9.5.5 3.5 1.5 4.5 3 4.5s1.5-2 1-4.5c-.5-2.5 0-3.5 0-3.5s.5 1 0 3.5c-.5 2.5.5 4.5 1 4.5s2.5-1 3-4.5c.5-3.5 2-6.5 2-9.5 0-3.5-2.5-6-6-6z" />
              </svg>
            </span>

            {/* Treatment Timeline Card */}
            <Link
              href={`/treatments/${treatment.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4.5 space-y-3 hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-[15px] font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                    {treatment.type}
                  </h4>
                  <p className="text-[12.5px] text-slate-400 mt-0.5">
                    {formatDate(treatment.date)}
                  </p>
                </div>

                <ActiveBadge label={treatment.isActive ? "Active Case" : "Completed Care"} active={treatment.isActive} />
              </div>

              <p className="text-[13.5px] text-slate-600 font-medium">{treatment.diagnosis}</p>
              {treatment.notes && (
                <p className="text-[12px] text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  "{treatment.notes}"
                </p>
              )}

              {/* Payment Progress */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500 font-medium">
                    Paid {formatCurrency(treatment.totalPayed)} of {formatCurrency(treatment.totalPayment)}
                  </span>
                  {remaining > 0 ? (
                    <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                      Due: {formatCurrency(remaining)}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                      Paid ✓
                    </span>
                  )}
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentPaid === 100 ? "bg-emerald-500" : "bg-sky-500"
                    }`}
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
