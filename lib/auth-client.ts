import { createAuthClient } from "better-auth/react";

// Same-origin; baseURL is inferred. Add NEXT_PUBLIC_BETTER_AUTH_URL only if the
// client and server ever live on different origins.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
