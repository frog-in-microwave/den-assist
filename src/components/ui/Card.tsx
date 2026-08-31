import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...rest
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-[17px] text-[var(--color-ink)]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-[var(--color-ink-faint)]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
