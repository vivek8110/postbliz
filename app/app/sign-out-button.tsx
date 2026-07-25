"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={() =>
        authClient.signOut({
          fetchOptions: { onSuccess: () => router.push("/sign-in") },
        })
      }
      className="rounded-lg border border-rule-strong bg-paper-raised px-3 py-1.5 text-sm text-ink hover:bg-paper-sunken"
    >
      Sign out
    </button>
  );
}
