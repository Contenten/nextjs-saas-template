import { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/new-york/ui/card";
import { db } from "@/db/drizzle";
import {
  user,
  session,
  account,
  verification,
  profile,
  role,
  user_role,
} from "@/db/schema";
import { count } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Overview of database tables",
};

async function getDatabaseStats() {
  const userResults = await db.select({ value: count() }).from(user);
  const sessionResults = await db.select({ value: count() }).from(session);
  const accountResults = await db.select({ value: count() }).from(account);
  const verificationResults = await db
    .select({ value: count() })
    .from(verification);
  const profileResults = await db.select({ value: count() }).from(profile);
  const roleResults = await db.select({ value: count() }).from(role);
  const userRoleResults = await db.select({ value: count() }).from(user_role);

  return {
    users: userResults[0]?.value ?? 0,
    sessions: sessionResults[0]?.value ?? 0,
    accounts: accountResults[0]?.value ?? 0,
    verifications: verificationResults[0]?.value ?? 0,
    profiles: profileResults[0]?.value ?? 0,
    roles: roleResults[0]?.value ?? 0,
    userRoles: userRoleResults[0]?.value ?? 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getDatabaseStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Database administration interface for managing tables and records.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/users">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.users}</CardTitle>
              <CardDescription>Users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage user accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/sessions">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.sessions}</CardTitle>
              <CardDescription>Sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View active user sessions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/accounts">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.accounts}</CardTitle>
              <CardDescription>Accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View user authentication accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/verifications">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.verifications}</CardTitle>
              <CardDescription>Verifications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View email verification records
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/profiles">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.profiles}</CardTitle>
              <CardDescription>Profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage user profiles
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/roles">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.roles}</CardTitle>
              <CardDescription>Roles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage system roles and permissions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/user-roles">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{stats.userRoles}</CardTitle>
              <CardDescription>User Roles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Assign roles to users
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-medium mb-2">About Admin Access</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Role-based access control is now implemented to restrict access to
          authorized administrators. Use the Roles and User Roles sections to
          manage permissions.
        </p>
        <p className="text-sm text-muted-foreground">Features available:</p>
        <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
          <li>Create and manage roles with specific permissions</li>
          <li>Assign roles to users</li>
          <li>Manage user profiles with additional information</li>
        </ul>
      </div>
    </div>
  );
}
