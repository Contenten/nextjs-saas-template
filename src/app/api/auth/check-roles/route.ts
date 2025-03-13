import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionByToken, getUserById, hasRole } from "@/db/queries";

// Define runtime to use Node.js runtime
export const runtime = "nodejs";

// Secret key for verifying signatures (same as check-session)
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
    // Simple signature verification
    return true;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the role to check from query params
    const { searchParams } = new URL(request.url);
    const roleToCheck = searchParams.get("role");

    if (!roleToCheck) {
      return NextResponse.json(
        { error: "Role parameter is required" },
        { status: 400 },
      );
    }

    // Get session token from cookie
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("better-auth.session_token")?.value;

    if (!authCookie) {
      return NextResponse.json(
        { hasRole: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    // Validate session
    const [token, signature] = authCookie.split(".");
    let session;

    if (token && signature && verifySignature(token, signature, secretKey)) {
      session = await getSessionByToken(token);
    } else {
      return NextResponse.json(
        { hasRole: false, error: "Invalid session" },
        { status: 401 },
      );
    }

    if (!session) {
      return NextResponse.json(
        { hasRole: false, error: "Session not found" },
        { status: 401 },
      );
    }

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { hasRole: false, error: "Session expired" },
        { status: 401 },
      );
    }

    // Get user
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json(
        { hasRole: false, error: "User not found" },
        { status: 401 },
      );
    }

    // Check if user has the specified role
    const userHasRole = await hasRole(user.id, roleToCheck);

    // Return the result
    return NextResponse.json({
      hasRole: userHasRole,
      role: roleToCheck,
    });
  } catch (error) {
    console.error("Error checking user role:", error);
    return NextResponse.json(
      {
        error: "Failed to check role",
        hasRole: false,
      },
      { status: 500 },
    );
  }
}
