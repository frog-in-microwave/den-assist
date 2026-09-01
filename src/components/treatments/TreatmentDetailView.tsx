"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { TreatmentWithPatient } from "@/lib/types";
import { addPaymentAction, toggleTreatmentActiveAction, updateTreatmentAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { ActiveBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatDateInput } from "@/lib/format";

export function TreatmentDetailView({ treatment }: { treatment: TreatmentWithPatient }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [payment, setPayment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type: treatment.type,
    diagnosis: treatment.diagnosis,
    notes: treatment.notes,
    date: formatDateInput(treatment.date),
    totalPayment: String(treatment.totalPayment),
    isActive: treatment.isActive,
  });

  const update = (key: keyof typeof form, value: any) =>
    setForm((current) => ({ ...current, [key]: value }));

  const remaining = treatment.totalPayment - treatment.totalPayed;
  const percentPaid = Math.min(
    100,
    Math.round((treatment.totalPayed / treatment.totalPayment) * 100)
  );

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const result = await updateTreatmentAction({
      id: treatment.id,
      ...form,
      totalPayment: Number(form.totalPayment),
    });
    setSaving(false);
    if (!result.ok) return setError(result.error);
    setEditing(false);
    router.refresh();
  }

  async function toggleActive() {
    setSaving(true);
    setError(null);
    try {
      const nextState = !treatment.isActive;
      const result = await toggleTreatmentActiveAction(treatment.id, nextState);
      setSaving(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm((current) => ({ ...current, isActive: nextState }));
      router.refresh();
    } catch (err: any) {
      setSaving(false);
      setError(err?.message || "Failed to update treatment status.");
    }
  }

  async function addPayment(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const result = await addPaymentAction(treatment.id, Number(payment));
    setSaving(false);
    if (!result.ok) return setError(result.error);
    setPayment("");
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link 
        href="/treatments" 
        className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-600 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:text-sky-600 hover:border-sky-200 w-fit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Treatments Directory
      </Link>

      {/* Hero Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-7 shadow-md shadow-slate-200/50 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl bg-gradient-to-tr from-sky-500 via-teal-500 to-emerald-400 text-white grid place-items-center shadow-lg shadow-sky-500/20 p-2.5 sm:p-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6 2 9.5.5 3.5 1.5 4.5 3 4.5s1.5-2 1-4.5c-.5-2.5 0-3.5 0-3.5s.5 1 0 3.5c-.5 2.5.5 4.5 1 4.5s2.5-1 3-4.5c.5-3.5 2-6.5 2-9.5 0-3.5-2.5-6-6-6z" fill="white" fillOpacity="0.25" />
                <path d="M12 2C8.5 2 6 4.5 6 8c0 3 1.5 6 2 9.5.5 3.5 1.5 4.5 3 4.5s1.5-2 1-4.5c-.5-2.5 0-3.5 0-3.5s.5 1 0 3.5c-.5 2.5.5 4.5 1 4.5s2.5-1 3-4.5c.5-3.5 2-6.5 2-9.5 0-3.5-2.5-6-6-6z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="font-[family-name:var(--font-display)] text-[22px] sm:text-[28px] text-slate-900 leading-tight">
                  {treatment.type}
                </h1>
                <div className="hidden sm:block">
                  <ActiveBadge label={treatment.isActive ? "Active Case" : "Completed Care"} active={treatment.isActive} />
                </div>
              </div>
              <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-[14px] text-slate-500">
                Patient:{" "}
                <Link
                  href={`/patients/${treatment.patient.id}`}
                  className="font-semibold text-sky-600 hover:underline inline-flex items-center gap-1"
                >
                  {treatment.patient.firstName} {treatment.patient.lastName}
                  {treatment.isActive && <span className="sm:hidden w-2 h-2 bg-emerald-500 rounded-full inline-block" />}
                </Link>{" "}
                <br className="sm:hidden" />
                <span className="hidden sm:inline">·</span> Date: {formatDate(treatment.date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              variant="secondary"
              onClick={toggleActive}
              disabled={saving}
              className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 border-slate-200 px-3 sm:px-4"
            >
              {treatment.isActive ? "Mark Completed" : "Mark Active"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setEditing((value) => !value)}
              className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 border-slate-200 px-3 sm:px-4"
            >
              {editing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-[13.5px] text-rose-700 flex items-center gap-2 shadow-sm">
          {error}
        </div>
      )}

      {editing ? (
        <Card className="shadow-md shadow-slate-200/50 border-slate-200/80">
          <CardHeader title="Edit Treatment Procedure" />
          <form onSubmit={save} className="px-6 pb-6 space-y-4">
            <Field label="Treatment type" htmlFor="type">
              <TextInput id="type" required value={form.type} onChange={(event) => update("type", event.target.value)} />
            </Field>
            <Field label="Date" htmlFor="date">
              <TextInput id="date" type="date" required value={form.date} onChange={(event) => update("date", event.target.value)} />
            </Field>
            <Field label="Diagnosis" htmlFor="diagnosis">
              <TextInput id="diagnosis" required value={form.diagnosis} onChange={(event) => update("diagnosis", event.target.value)} />
            </Field>
            <Field label="Notes" htmlFor="notes">
              <TextArea id="notes" value={form.notes} onChange={(event) => update("notes", event.target.value)} />
            </Field>
            <Field label="Total amount" htmlFor="total">
              <TextInput id="total" type="number" min={treatment.totalPayed} required value={form.totalPayment} onChange={(event) => update("totalPayment", event.target.value)} />
            </Field>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => update("isActive", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="isActive" className="text-[14px] text-slate-800 font-medium">
                Active treatment case
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving} className="bg-sky-600 hover:bg-sky-700 text-white">
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="shadow-md shadow-slate-200/50 border-slate-200/80">
          <CardHeader title="Treatment Details" />
          <dl className="px-6 pb-6 space-y-4">
            <Detail label="Clinical Diagnosis" value={treatment.diagnosis} />
            <Detail label="Procedure Notes" value={treatment.notes || "No notes recorded on file."} />
          </dl>
        </Card>
      )}

      {/* Payment Information Card */}
      <Card className="shadow-md shadow-slate-200/50 border-slate-200/80">
        <CardHeader title="Payment & Billing" subtitle="Financial record for this procedure" />
        <div className="px-6 pb-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <AmountCard label="Total Amount" value={formatCurrency(treatment.totalPayment)} />
            <AmountCard label="Amount Paid" value={formatCurrency(treatment.totalPayed)} color="text-emerald-600" />
            <AmountCard label="Remaining Balance" value={formatCurrency(remaining)} color={remaining > 0 ? "text-amber-600" : "text-slate-800"} />
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[12px] font-medium text-slate-500">
              <span>Progress: {percentPaid}% paid</span>
              <span>{remaining > 0 ? `${formatCurrency(remaining)} remaining` : "Paid in full"}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentPaid === 100 ? "bg-emerald-500" : "bg-sky-500"
                }`}
                style={{ width: `${percentPaid}%` }}
              />
            </div>
          </div>

          {remaining > 0 ? (
            <form onSubmit={addPayment} className="flex flex-wrap gap-3 items-end pt-3 border-t border-slate-100">
              <div className="w-full sm:w-56">
                <Field label="Record payment" htmlFor="payment">
                  <TextInput
                    id="payment"
                    type="number"
                    min="1"
                    max={remaining}
                    required
                    placeholder="Enter amount..."
                    value={payment}
                    onChange={(event) => setPayment(event.target.value)}
                  />
                </Field>
              </div>
              <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20">
                {saving ? "Saving…" : "Record payment →"}
              </Button>
            </form>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[13.5px] font-semibold text-emerald-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              This treatment procedure has been paid in full.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-[14px] font-medium text-slate-800 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
        {value}
      </dd>
    </div>
  );
}

function AmountCard({ label, value, color = "text-slate-800" }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
      <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 font-[family-name:var(--font-mono)] text-[18px] font-bold ${color}`}>{value}</p>
    </div>
  );
}
