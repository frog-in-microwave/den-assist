"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { TreatmentWithPatient } from "@/lib/types";
import { ActiveBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate, initials } from "@/lib/format";

type FilterMode = "all" | "active" | "completed" | "unpaid";

export function TreatmentsView({
  treatments,
  initialQuery = "",
}: {
  treatments: TreatmentWithPatient[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<FilterMode>("all");

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

  // Filter treatments by selected status pill
  const filteredTreatments = treatments.filter((t) => {
    if (filter === "active") return t.isActive;
    if (filter === "completed") return !t.isActive;
    if (filter === "unpaid") return t.totalPayed < t.totalPayment;
    return true;
  });

  const totalActive = treatments.filter((t) => t.isActive).length;
  const totalUnpaid = treatments.filter((t) => t.totalPayed < t.totalPayment).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 p-6 sm:p-7 text-white shadow-xl shadow-sky-500/10 overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-100 text-[13px] font-medium uppercase tracking-wide">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              Clinical History & Procedures
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-[26px] sm:text-[30px] text-white mt-1">
              Treatments Directory
            </h1>
            <p className="mt-1 text-[14px] text-sky-50/90 max-w-xl">
              All dental procedures logged across the practice, ordered by date.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 text-center">
              <p className="text-[11px] uppercase tracking-wider text-sky-100 font-medium">Logged</p>
              <p className="text-[20px] font-bold text-white leading-tight mt-0.5">{treatments.length}</p>
            </div>
            <div className="rounded-xl bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 text-center">
              <p className="text-[11px] uppercase tracking-wider text-sky-100 font-medium">Active</p>
              <p className="text-[20px] font-bold text-emerald-200 leading-tight mt-0.5">{totalActive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Fuzzy Search Input and Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Database-Level Fuzzy Search Input */}
        <div className="relative w-full sm:w-96">
          <input
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search procedure, diagnosis, or patient..."
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[14px] text-slate-800 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 shadow-sm transition-all"
          />
          {isPending && (
            <div className="absolute right-3.5 top-3.5 h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <FilterPill
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="All Procedures"
            count={treatments.length}
          />
          <FilterPill
            active={filter === "active"}
            onClick={() => setFilter("active")}
            label="Active Cases"
            count={totalActive}
            badgeColor="emerald"
          />
          <FilterPill
            active={filter === "completed"}
            onClick={() => setFilter("completed")}
            label="Completed"
            count={treatments.length - totalActive}
          />
          <FilterPill
            active={filter === "unpaid"}
            onClick={() => setFilter("unpaid")}
            label="Unpaid Balance"
            count={totalUnpaid}
            badgeColor="amber"
          />
        </div>
      </div>

      {/* Treatments Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/50 overflow-hidden">
        {filteredTreatments.length === 0 ? (
          <EmptyState
            title={query ? "No matching procedures" : "No treatments logged"}
            description={
              query
                ? `No database procedure records found matching "${query}".`
                : "Treatments are recorded directly from a patient's profile page."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[12.5px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Procedure & Diagnosis</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Payment Progress</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTreatments.map((t, index) => {
                  const gradientClass = avatarGradients[index % avatarGradients.length];
                  const percentPaid = Math.min(
                    100,
                    Math.round((t.totalPayed / t.totalPayment) * 100)
                  );
                  const remaining = t.totalPayment - t.totalPayed;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/90 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/patients/${t.patientId}`} className="flex items-center gap-3.5">
                          <div
                            className={`h-9 w-9 shrink-0 rounded-full bg-gradient-to-tr ${gradientClass} grid place-items-center text-[12px] font-bold shadow-sm`}
                          >
                            {initials(t.patient.firstName, t.patient.lastName)}
                          </div>
                          <div>
                            <span className="text-[14.5px] font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                              {t.patient.firstName} {t.patient.lastName}
                            </span>
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        <Link href={`/treatments/${t.id}`} className="block">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-sky-50 text-sky-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6 2 9.5.5 3.5 1.5 4.5 3 4.5s1.5-2 1-4.5c-.5-2.5 0-3.5 0-3.5s.5 1 0 3.5c-.5 2.5.5 4.5 1 4.5s2.5-1 3-4.5c.5-3.5 2-6.5 2-9.5 0-3.5-2.5-6-6-6z" />
                              </svg>
                            </span>
                            <p className="text-[14.5px] font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                              {t.type}
                            </p>
                          </div>
                          <p className="text-[12.5px] text-slate-500 mt-0.5 truncate max-w-xs">
                            {t.diagnosis}
                          </p>
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-[13.5px] text-slate-600 font-medium">
                        {formatDate(t.date)}
                      </td>

                      <td className="px-6 py-4 min-w-[180px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-slate-600 font-medium">
                              {formatCurrency(t.totalPayed)} / {formatCurrency(t.totalPayment)}
                            </span>
                            {remaining > 0 ? (
                              <span className="text-amber-700 font-semibold text-[11px]">
                                Due {formatCurrency(remaining)}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-semibold text-[11px]">
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
                      </td>

                      <td className="px-6 py-4 text-right">
                        <ActiveBadge label={t.isActive ? "Active Case" : "Completed"} active={t.isActive} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
  badgeColor = "sky",
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  badgeColor?: "sky" | "emerald" | "amber";
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all shrink-0 ${
        active
          ? "bg-sky-600 text-white shadow-sm shadow-sky-600/20"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
          active
            ? "bg-white/20 text-white"
            : badgeColor === "emerald"
            ? "bg-emerald-100 text-emerald-800"
            : badgeColor === "amber"
            ? "bg-amber-100 text-amber-800"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
