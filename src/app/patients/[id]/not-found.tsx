import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function PatientNotFound() {
  return (
    <EmptyState
      title="Patient not found"
      description="This patient may have been removed, or the link is out of date."
      action={
        <Link href="/patients">
          <Button variant="secondary">Back to patients</Button>
        </Link>
      }
    />
  );
}
