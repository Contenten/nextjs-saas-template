import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forget-password",
  "/reset-password",
  "/api/auth/sign-up",
  "/api/auth/sign-in",
  "/unauthorized",
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
};

// Routes that require specific roles (format: 'route': ['role1', 'role2'])
const roleProtectedRoutes: Record<string, string[]> = {
  "/admin": ["Admin"],
  "/admin/users": ["Admin"],
  "/admin/roles": ["Admin"],
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
    return NextResponse.next();
  }
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
