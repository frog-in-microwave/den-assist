import type { ReactNode } from "react";

export function ActiveBadge({ label = "Active", active = true }: { label?: string; active?: boolean }) {
  if (!active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Completed Care
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      {label}
    </span>
  );
}

export function StatusBadge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: "neutral" | "success" | "warning" | "brand" | "indigo";
}) {
  const styles = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-500/5",
    warning: "bg-amber-50 text-amber-800 border-amber-200 shadow-sm shadow-amber-500/5",
    brand: "bg-sky-50 text-sky-700 border-sky-200 shadow-sm shadow-sky-500/5",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-500/5",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}
