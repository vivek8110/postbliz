import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { CreateProjectForm } from "./create-form";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-md rounded-lg border border-rule bg-paper-raised p-6">
      <h1 className="text-xl font-semibold tracking-tight text-ink">Create your project</h1>
      <p className="mt-1 text-sm text-ink-muted">One product you want to promote.</p>
      <CreateProjectForm error={error} />
    </div>
  );
}
