import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db";
import * as schema from "../db/schema";

// BetterAuth owns user/session/account/verification via the Drizzle adapter.
// Env: BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID/SECRET (see .env.example).
// Google callback: BETTER_AUTH_URL + /api/auth/callback/google.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  // nextCookies() MUST be last — it lets BetterAuth set cookies from Server Actions.
  plugins: [nextCookies()],
});
