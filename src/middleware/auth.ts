import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import {
  getSessionByToken,
  getUserById,
  hasPermission,
  hasRole,
  hasAnyRole,
} from "../db/queries";

export interface AuthOptions {
  required?: boolean;
  permissions?: string[];
  roles?: string[];
  anyRole?: string[];
}

/**
 * Authentication middleware for API routes
 */
export async function authenticate(
  req: NextRequest,
  options: AuthOptions = {},
) {
  const {
    required = true,
    permissions = [],
    roles = [],
    anyRole = [],
  } = options;

  try {
    // Get session token from cookie
    const authCookie = req.cookies.get("better-auth.session_token")?.value;
    if (!authCookie && required) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!authCookie) {
      return { auth: false };
    }

    // Validate session
    const [token, signature] = authCookie.split(".");
    const session = await getSessionByToken(token!);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 },
      );
    }

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // Get user
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Check permissions if specified
    if (permissions.length > 0) {
      for (const permission of permissions) {
        const hasUserPermission = await hasPermission(user.id, permission);
        if (!hasUserPermission) {
          return NextResponse.json(
            { error: `Missing required permission: ${permission}` },
            { status: 403 },
          );
        }
      }
    }

    // Check roles if specified
    if (roles.length > 0) {
      for (const roleName of roles) {
        const hasUserRole = await hasRole(user.id, roleName);
        if (!hasUserRole) {
          return NextResponse.json(
            { error: `Missing required role: ${roleName}` },
            { status: 403 },
          );
        }
      }
    }

    // Check if user has any of the specified roles
    if (anyRole.length > 0) {
      const hasAnyRequiredRole = await hasAnyRole(user.id, anyRole);
      if (!hasAnyRequiredRole) {
        return NextResponse.json(
          { error: `Must have one of these roles: ${anyRole.join(", ")}` },
          { status: 403 },
        );
      }
    }

    // Authentication and authorization successful
    return {
      auth: true,
      user,
      session,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

/**
 * Check if the user has specific permissions
 */
export function withPermission(permission: string) {
  return async (req: NextRequest) => {
    return authenticate(req, { permissions: [permission] });
  };
}

/**
 * Check if the user has a specific role
 */
export function withRole(roleName: string) {
  return async (req: NextRequest) => {
    return authenticate(req, { roles: [roleName] });
  };
}

/**
 * Check if the user has any of the specified roles
 */
export function withAnyRole(roleNames: string[]) {
  return async (req: NextRequest) => {
    return authenticate(req, { anyRole: roleNames });
  };
}
