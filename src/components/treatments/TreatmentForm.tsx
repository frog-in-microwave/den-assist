"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createTreatmentAction } from "@/lib/actions";

export function TreatmentForm({ open, onClose, patientId }: { open: boolean; onClose: () => void; patientId: number }) {
  const router = useRouter();
  const blank = { type: "", diagnosis: "", notes: "", date: new Date().toISOString().slice(0, 10), totalPayment: "", totalPayed: "" };
  const [form, setForm] = useState(blank); const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const close = () => { setForm(blank); setError(null); onClose(); };
  async function submit(event: FormEvent) { event.preventDefault(); setSubmitting(true); setError(null); const result = await createTreatmentAction({ patientId, type: form.type, diagnosis: form.diagnosis, notes: form.notes, date: form.date, totalPayment: Number(form.totalPayment), totalPayed: Number(form.totalPayed || 0) }); setSubmitting(false); if (!result.ok) return setError(result.error); close(); router.refresh(); }
  return <Modal open={open} onClose={close} title="Add treatment"><form onSubmit={submit} className="space-y-4"><Field label="Treatment type" htmlFor="type"><TextInput id="type" required value={form.type} onChange={(event) => update("type", event.target.value)} placeholder="e.g. Filling" /></Field><Field label="Date" htmlFor="date"><TextInput id="date" type="date" required value={form.date} onChange={(event) => update("date", event.target.value)} /></Field><Field label="Diagnosis" htmlFor="diagnosis"><TextInput id="diagnosis" required value={form.diagnosis} onChange={(event) => update("diagnosis", event.target.value)} /></Field><Field label="Notes" htmlFor="notes" hint="Optional"><TextArea id="notes" value={form.notes} onChange={(event) => update("notes", event.target.value)} /></Field><div className="grid grid-cols-2 gap-4"><Field label="Total amount" htmlFor="totalPayment"><TextInput id="totalPayment" type="number" min="0" required value={form.totalPayment} onChange={(event) => update("totalPayment", event.target.value)} /></Field><Field label="Amount paid" htmlFor="totalPayed"><TextInput id="totalPayed" type="number" min="0" value={form.totalPayed} onChange={(event) => update("totalPayed", event.target.value)} /></Field></div>{error && <p className="rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-[13px] text-[var(--color-danger)]">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save treatment"}</Button></div></form></Modal>;
}
