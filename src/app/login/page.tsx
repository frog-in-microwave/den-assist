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

      router.push(fromPath);
      router.refresh();
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.message || "An unexpected error occurred during sign-in.");
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-slate-50 via-sky-50/40 to-teal-50/50 overflow-hidden">
      
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        
        {/* Header Branding with Tooth Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 text-white shadow-xl shadow-sky-500/25 p-3 transform hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6 2 9.5.5 3.5 1.5 4.5 3 4.5s1.5-2 1-4.5c-.5-2.5 0-3.5 0-3.5s.5 1 0 3.5c-.5 2.5.5 4.5 1 4.5s2.5-1 3-4.5c.5-3.5 2-6.5 2-9.5 0-3.5-2.5-6-6-6z" fill="white" fillOpacity="0.25" />
              <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6 2 9.5.5 3.5 1.5 4.5 3 4.5s1.5-2 1-4.5c-.5-2.5 0-3.5 0-3.5s.5 1 0 3.5c-.5 2.5.5 4.5 1 4.5s2.5-1 3-4.5c.5-3.5 2-6.5 2-9.5 0-3.5-2.5-6-6-6z" />
            </svg>
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[30px] tracking-tight text-slate-900">
              Den Assist
            </h1>
            <p className="mt-1 text-[14px] text-slate-500">
              Dental Practice Management & Clinical Operations
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-7 sm:p-9 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-[13.5px] text-rose-700 flex items-start gap-2.5 shadow-sm">
                <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
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
                  className="absolute right-3 top-2.5 text-[12px] font-semibold text-slate-500 hover:text-sky-600 transition-colors px-1 py-0.5 rounded"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 text-[15px] font-semibold mt-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white shadow-lg shadow-sky-600/20"
            >
              {submitting ? "Signing in..." : "Sign In to Clinic →"}
            </Button>
          </form>
        </div>

        {/* Security Footer Note */}
        <p className="text-center text-[12.5px] text-slate-400">
          Protected with 7-day JWT authentication session
        </p>

      </div>
    </div>
  );
}
