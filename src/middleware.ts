import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define types for the session data returned by the API
interface Role {
  id: string;
  name: string;
  permissions?: Record<string, boolean>;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

interface SessionData {
  isValid: boolean;
  user: User | null;
  roles: Role[];
}

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forget-password",
  "/reset-password",
  "/api/auth/sign-up",
  "/api/auth/sign-in",
  "/api/auth/callback",
  "/unauthorized",
  "/api/auth/check-session", // New API route for session checking
];

// Routes that require specific permissions (format: 'route': ['permission1', 'permission2'])
const permissionProtectedRoutes: Record<string, string[]> = {
  "/api/users": ["user:read"],
  "/api/users/create": ["user:create"],
  "/api/users/update": ["user:update"],
  "/api/users/delete": ["user:delete"],
  "/api/roles": ["role:read"],
  "/api/roles/create": ["role:create"],
  "/api/roles/update": ["role:update"],
  "/api/roles/delete": ["role:delete"],
  "/api/admin/roles": ["role:read", "role:create"],
  "/api/admin/roles/create": ["role:create"],
  "/api/admin/users": ["user:read", "user:create"],
};

// Routes that require specific roles (format: 'route': ['role1', 'role2'])
const roleProtectedRoutes: Record<string, string[]> = {
  "/admin": ["Admin"],
  "/admin/users": ["Admin"],
  "/admin/roles": ["Admin"],
  "/admin/profiles": ["Admin"],
  "/admin/user-roles": ["Admin"],
  "/admin/sessions": ["Admin"],
  "/admin/accounts": ["Admin"],
  "/admin/verifications": ["Admin"],
  "/moderator": ["Admin", "Moderator"],
  "/dashboard": ["Admin", "User", "Moderator"],
};

// User-specific routes (these are routes a user can access for their own data)
const userSpecificRoutes: string[] = ["/api/profile", "/profile", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  if (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    )
  ) {
    // console.log("Public route detected:", pathname);
    return NextResponse.next();
  }

  // Get session token from cookie
  const authCookie = request.cookies.get("better-auth.session_token")?.value;
  // console.log("Auth cookie:", authCookie);
  if (!authCookie) {
    // Redirect to sign-in page if not authenticated
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Instead of directly querying the database in middleware (which uses Node.js modules),
  // make a request to an API route that will handle the session validation
  const apiUrl = new URL("/api/auth/check-session", request.url);
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Cookie: `better-auth.session_token=${authCookie}`,
    },
  });

  if (!response.ok) {
    // Session is invalid or expired
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const sessionData: SessionData = await response.json();
  const { isValid, user, roles = [] } = sessionData;

  if (!isValid || !user) {
    // Invalid session or user not found
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Check if user has Admin role - if so, allow access to all admin routes
  const isAdmin = roles.some((role: Role) => role.name === "Admin");
  if (
    isAdmin &&
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin"))
  ) {
    return NextResponse.next();
  }

  // Check permission-protected routes
  for (const route in permissionProtectedRoutes) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      const requiredPermissions = permissionProtectedRoutes[route];
      if (!requiredPermissions) {
        continue;
      }

      // Check if user has all required permissions
      const missingPermission = requiredPermissions.some((permission) => {
        // Check user permissions from the roles returned by the API
        return !roles.some(
          (role: Role) => role.permissions && role.permissions[permission],
        );
      });

      if (missingPermission) {
        // Redirect to unauthorized page if user doesn't have required permission
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // Check role-protected routes
  for (const route in roleProtectedRoutes) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      const requiredRoles = roleProtectedRoutes[route];
      if (!requiredRoles) {
        continue;
      }

      // Check if user has any of the required roles
      const hasRequiredRole = roles.some((role: Role) =>
        requiredRoles.includes(role.name),
      );

      if (!hasRequiredRole) {
        // Redirect to unauthorized page if user doesn't have any required role
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // Check user-specific routes (these are routes a user can access for their own data)
  if (userSpecificRoutes.some((route) => pathname.startsWith(route))) {
    // Extract user ID from the URL if present (e.g., /profile/123)
    const urlParts = pathname.split("/");
    const urlUserId = urlParts.length > 2 ? urlParts[2] : null;

    // If URL contains a user ID and it doesn't match the current user's ID
    if (urlUserId && urlUserId !== user.id) {
      // Check if user has Admin role, which allows access to other users' data
      const isAdmin = roles.some((role: Role) => role.name === "Admin");

      if (!isAdmin) {
        // Redirect to unauthorized page if user is trying to access another user's data
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // If all checks pass, allow the request to proceed
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (robots.txt, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
