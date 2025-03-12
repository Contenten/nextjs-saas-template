import { cookies } from "next/headers";
import { getSessionByToken, getUserById } from "@/db/queries";

// Secret key for verifying signatures
const secretKey =
  process.env.BETTER_AUTH_SECRET || "default-secret-key-for-development";

/**
 * Verify the signature of a token
 */
function verifySignature(
  token: string,
  signature: string,
  secret: string,
): boolean {
  try {
    // TODO: Implement signature verification
    return true;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

/**
 * Get the current authenticated user in a server component
 */
export async function getCurrentUser() {
  try {
    // Get session token from cookie
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("better-auth.session_token")?.value;
    if (!authCookie) {
      return null;
    }

    // Validate session
    const [token, signature] = authCookie.split(".");
    let session: Awaited<ReturnType<typeof getSessionByToken>> | null;

    if (token && signature && verifySignature(token, signature, secretKey)) {
      session = await getSessionByToken(token);
    } else {
      return null;
    }

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    // Get user
    const user = await getUserById(session.userId);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
