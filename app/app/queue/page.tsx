import Link from "next/link";
import { EmptyState } from "../empty-state";

export default function QueuePage() {
  return (
    <EmptyState
      title="Nothing queued"
      action={
        <Link href="/app/knowledge" className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover">
          Add a source
        </Link>
      }
    >
      Add a changelog or your product URL and Postbliz will draft the first posts from it — then they land here, on the rail.
    </EmptyState>
  );
}
