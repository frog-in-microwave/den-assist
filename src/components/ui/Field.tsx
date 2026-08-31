import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-[var(--color-ink)] mb-1.5">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[12.5px] text-[var(--color-danger)]">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12.5px] text-[var(--color-ink-faint)]">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-lg border bg-[var(--color-surface)] px-3 h-10 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors focus:border-[var(--color-brand)]";

export function TextInput({
  error,
  className = "",
  ...rest
}: { error?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`${inputBase} ${error ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]"} ${className}`}
      {...rest}
    />
  );
}

export function TextArea({
  error,
  className = "",
  ...rest
}: { error?: boolean } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${inputBase} h-auto min-h-24 py-2.5 resize-y ${error ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]"} ${className}`}
      {...rest}
    />
  );
}
