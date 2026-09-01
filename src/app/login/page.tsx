"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await loginAction(username, password);
      setSubmitting(false);

      if (!result.ok) {
        return setError(result.error);
      }

      // Navigate to destination route after successful JWT sign-in
      router.push(fromPath);
      router.refresh();
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.message || "An unexpected error occurred during sign-in.");
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[var(--color-brand)] text-white shadow-lg shadow-[var(--color-brand)]/20">
            <svg width="32" height="32" viewBox="0 0 26 26" fill="none">
              <path
                d="M8 13.2 11.3 16.5 18 9"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[28px] tracking-tight text-[var(--color-ink)]">
              Welcome to Den Assist
            </h1>
            <p className="mt-1 text-[14px] text-[var(--color-ink-faint)]">
              Enter your credentials to access the dental management platform.
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/20 p-3 text-[13.5px] text-[var(--color-danger)] flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <Field label="Username" htmlFor="username">
              <TextInput
                id="username"
                type="text"
                required
                autoComplete="username"
                autoFocus
                placeholder="Enter your username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[12px] font-medium text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 text-[15px] font-medium mt-2"
            >
              {submitting ? "Signing in..." : "Sign In →"}
            </Button>
          </form>
        </div>

        {/* Security Footer Note */}
        <p className="text-center text-[12px] text-[var(--color-ink-faint)]">
          Protected with 7-day JWT authentication session
        </p>

      </div>
    </div>
  );
}
