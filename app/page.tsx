import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// The root route sends you where you belong: the app if signed in, otherwise
// sign-in. A marketing landing page can take over `/` later (app/(marketing)).
export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  redirect(session ? "/app" : "/sign-in");
}
