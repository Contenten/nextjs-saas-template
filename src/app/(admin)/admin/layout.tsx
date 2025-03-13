import { ReactNode } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Database administration dashboard",
};

// Define runtime to use Node.js runtime
export const runtime = "nodejs";

// Define types for the session data
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

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Get the current session data from the API
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("better-auth.session_token")?.value;

  if (!authCookie) {
    redirect("/sign-in");
  }

  // Use the base URL from environment variables
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  // Call the check-session API to validate the session and get user data
  const response = await fetch(`${baseUrl}/api/auth/check-session`, {
    headers: {
      Cookie: `better-auth.session_token=${authCookie}`,
    },
    // Ensure this request is not cached
    cache: "no-store",
  });

  if (!response.ok) {
    redirect("/sign-in");
  }

  const sessionData: SessionData = await response.json();
  const { isValid, user, roles = [] } = sessionData;

  // Check if user is authenticated
  if (!isValid || !user) {
    redirect("/sign-in");
  }

  // Check if user has Admin role
  const isAdmin = roles.some((role: Role) => role.name === "Admin");
  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="h-full py-6 pr-6 lg:py-8">
            <nav className="flex flex-col space-y-2">
              <div className="pb-4">
                <h2 className="px-4 text-lg font-semibold tracking-tight">
                  Admin Dashboard
                </h2>
              </div>
              <div className="flex flex-col space-y-1">
                <a
                  href="/admin"
                  className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Overview
                </a>
                <a
                  href="/admin/users"
                  className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Users
                </a>
                <a
                  href="/admin/profiles"
                  className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Profiles
                </a>
                <a
                  href="/admin/roles"
                  className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Roles
                </a>
                <a
                  href="/admin/user-roles"
                  className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  User Roles
                </a>
                <a
                  href="/admin/sessions"
                  className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Sessions
                </a>
                <a
                  href="/admin/accounts"
                  className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Accounts
                </a>
                <a
                  href="/admin/verifications"
                  className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Verifications
                </a>
              </div>
            </nav>
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden p-4 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
