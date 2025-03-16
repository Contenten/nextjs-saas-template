import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionByToken, getUserById, getUserRoles, assignRoleToUser, getRoleByName } from "@/db/queries";

// Define runtime to use Node.js runtime
export const runtime = "nodejs";

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
 * Ensure a user has at least the basic User role
 */
async function ensureUserHasRole(userId: string): Promise<void> {
  try {
    // Get user roles
    const userRoles = await getUserRoles(userId);

    // If user already has roles, no need to assign
    if (userRoles.length > 0) {
      return;
    }

    // Get the "User" role
    const userRole = await getRoleByName("User");
    if (!userRole) {
      console.error("User role not found in the database");
      return;
    }

    // Assign the "User" role to the user
    await assignRoleToUser({
      userId,
      roleId: userRole.id,
      createdAt: new Date(),
    });

    console.log(`Assigned User role to user ${userId}`);
  } catch (error) {
    console.error("Error assigning role to user:", error);
  }
}

export async function GET(request: Request) {
  try {
    // Get session token from cookie
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("better-auth.session_token")?.value;

    if (!authCookie) {
      return NextResponse.json(
        { isValid: false, user: null, roles: [] },
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
        { isValid: false, user: null, roles: [] },
        { status: 401 },
      );
    }

    if (!session) {
      return NextResponse.json(
        { isValid: false, user: null, roles: [] },
        { status: 401 },
      );
    }

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { isValid: false, user: null, roles: [] },
        { status: 401 },
      );
    }

    // Get user
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json(
        { isValid: false, user: null, roles: [] },
        { status: 401 },
      );
    }

    // Ensure user has a role (especially for OAuth users)
    await ensureUserHasRole(user.id);

    // Get user roles (after potentially assigning a role)
    const roles = await getUserRoles(user.id);

    // Return user and roles
    return NextResponse.json({
      isValid: true,
      user,
      roles,
    });
  } catch (error) {
    console.error("Error checking session:", error);
    return NextResponse.json(
      {
        error: "Failed to check session",
        isValid: false,
        user: null,
        roles: [],
      },
      { status: 500 },
    );
  }
}
