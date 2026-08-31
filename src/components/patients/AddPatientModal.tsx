"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createPatientAction } from "@/lib/actions";

export function AddPatientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", birthDate: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const handleClose = () => { setForm({ firstName: "", lastName: "", birthDate: "", notes: "" }); setError(null); onClose(); };
  async function handleSubmit(event: FormEvent) { event.preventDefault(); setSubmitting(true); setError(null); const result = await createPatientAction(form); setSubmitting(false); if (!result.ok) return setError(result.error); handleClose(); router.push(`/patients/${result.id}`); }
  return <Modal open={open} onClose={handleClose} title="Add patient"><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><Field label="First name" htmlFor="firstName"><TextInput id="firstName" required value={form.firstName} onChange={(event) => update("firstName", event.target.value)} /></Field><Field label="Last name" htmlFor="lastName"><TextInput id="lastName" required value={form.lastName} onChange={(event) => update("lastName", event.target.value)} /></Field></div><Field label="Date of birth" htmlFor="birthDate" hint="Optional"><TextInput id="birthDate" type="date" value={form.birthDate} onChange={(event) => update("birthDate", event.target.value)} max={new Date().toISOString().slice(0, 10)} /></Field><Field label="Notes" htmlFor="notes" hint="Optional"><TextArea id="notes" value={form.notes} onChange={(event) => update("notes", event.target.value)} /></Field>{error && <p className="rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-[13px] text-[var(--color-danger)]">{error}</p>}<div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Add patient"}</Button></div></form></Modal>;
}
