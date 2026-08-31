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
    const result = await toggleTreatmentActiveAction(treatment.id, !treatment.isActive);
    setSaving(false);
    if (!result.ok) return setError(result.error);
    router.refresh();
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
      <Link href="/treatments" className="inline-flex text-[13px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
        ← Treatments
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-[26px] text-[var(--color-ink)]">
              {treatment.type}
            </h1>
            <ActiveBadge label="Active" active={treatment.isActive} />
          </div>
          <p className="mt-1 text-[14px] text-[var(--color-ink-faint)]">
            {treatment.patient.firstName} {treatment.patient.lastName} · {formatDate(treatment.date)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={toggleActive} disabled={saving}>
            {treatment.isActive ? "Mark as Completed" : "Mark as Active"}
          </Button>
          <Button variant="secondary" onClick={() => setEditing((value) => !value)}>
            {editing ? "Cancel editing" : "Edit treatment"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-[13px] text-[var(--color-danger)]">
          {error}
        </p>
      )}

      {editing ? (
        <Card>
          <CardHeader title="Edit treatment" />
          <form onSubmit={save} className="px-5 pb-5 space-y-4">
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
                className="h-4 w-4 rounded border-gray-300 text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
              />
              <label htmlFor="isActive" className="text-[14px] text-[var(--color-ink)]">
                Active treatment case
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Treatment details" />
          <dl className="px-5 pb-5 space-y-3">
            <Detail label="Status" value={treatment.isActive ? "Active Case" : "Completed Care"} />
            <Detail label="Diagnosis" value={treatment.diagnosis} />
            <Detail label="Notes" value={treatment.notes || "—"} />
          </dl>
        </Card>
      )}

      <Card>
        <CardHeader title="Payment" subtitle="Recorded only for this treatment" />
        <div className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Amount label="Total amount" value={formatCurrency(treatment.totalPayment)} />
            <Amount label="Paid" value={formatCurrency(treatment.totalPayed)} />
            <Amount label="Remaining" value={formatCurrency(remaining)} />
          </div>
          {remaining > 0 ? (
            <form onSubmit={addPayment} className="flex flex-wrap gap-2 items-end">
              <div className="w-full sm:w-48">
                <Field label="Add payment" htmlFor="payment">
                  <TextInput id="payment" type="number" min="1" max={remaining} required value={payment} onChange={(event) => setPayment(event.target.value)} />
                </Field>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Record payment"}
              </Button>
            </form>
          ) : (
            <p className="text-[14px] text-[var(--color-ink-muted)]">This treatment has been paid in full.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-[12px] text-[var(--color-ink-faint)]">{label}</dt><dd className="mt-0.5 whitespace-pre-wrap text-[14px] text-[var(--color-ink)]">{value}</dd></div>; }
function Amount({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-[var(--color-surface-sunken)] px-3 py-2"><p className="text-[12px] text-[var(--color-ink-faint)]">{label}</p><p className="mt-1 font-[family-name:var(--font-mono)] text-[15px] text-[var(--color-ink)]">{value}</p></div>; }
