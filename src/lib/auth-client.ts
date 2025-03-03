import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

export const client = createAuthClient({
  // baseURL: "http://localhost:3000", // the base url of your auth server
  baseURL: process.env.BETTER_AUTH_URL!, // the base url of your auth server
  plugins: [],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  // organization,
  // useListOrganizations,
  // useActiveOrganization,
} = client;

client.$store.listen("$sessionSignal", async () => {});
