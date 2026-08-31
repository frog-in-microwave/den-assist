"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { updatePatientAction } from "@/lib/actions";
import { formatDateInput } from "@/lib/format";
import type { PatientWithStats } from "@/lib/types";

export function EditPatientModal({
  open,
  onClose,
  patient,
}: {
  open: boolean;
  onClose: () => void;
  patient: PatientWithStats;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: patient.firstName,
    lastName: patient.lastName,
    birthDate: patient.birthDate ? formatDateInput(patient.birthDate) : "",
    notes: patient.notes || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthDate: patient.birthDate ? formatDateInput(patient.birthDate) : "",
      notes: patient.notes || "",
    });
  }, [patient]);

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleClose = () => {
    setError(null);
    onClose();
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await updatePatientAction({
        id: patient.id,
        firstName: form.firstName,
        lastName: form.lastName,
        birthDate: form.birthDate || undefined,
        notes: form.notes || undefined,
      });
      setSubmitting(false);
      if (!result.ok) {
        return setError(result.error);
      }
      handleClose();
      router.refresh();
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.message || "Failed to update patient.");
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Edit Patient Profile">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" htmlFor="firstName">
            <TextInput
              id="firstName"
              required
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
            />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <TextInput
              id="lastName"
              required
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Date of birth" htmlFor="birthDate" hint="Optional">
          <TextInput
            id="birthDate"
            type="date"
            value={form.birthDate}
            onChange={(e) => update("birthDate", e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </Field>

        <Field label="Notes" htmlFor="notes" hint="Optional">
          <TextArea
            id="notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-[var(--color-danger-soft)] px-3 py-2 text-[13px] text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
