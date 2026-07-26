import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { CrawlProgress } from "./crawl-progress";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string; pk?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { run, pk } = await searchParams;
  if (!run || !pk) redirect("/app");

  return <CrawlProgress runId={run} accessToken={pk} />;
}
